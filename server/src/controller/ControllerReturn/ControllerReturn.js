const ModelReturnRequest = require('../../model/ModelReturnRequest');
const ModelOrder         = require('../../model/ModelOrder');
const ModelOrderItem     = require('../../model/ModelOrderItem');
const ModelProducts      = require('../../model/ModelProducts');
const ModelUser          = require('../../model/ModelUser');
const { jwtDecode }      = require('jwt-decode');
const sendMailMessage    = require('../ControllerEmail/SendMailMessage');
const crypto             = require('crypto');
const axios              = require('axios');
const { v4: uuidv4 }     = require('uuid');

const VNPAY_TMN_CODE  = '7N2SECJJ';
const VNPAY_SECRET    = '65W8KAP5EEC7F6E7WOL38QTF96XWWLTN';
const VNPAY_API_URL   = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decoded(req) {
    return jwtDecode(req.cookies.Token);
}

function formatVNPayDate(date) {
    const d = new Date(date);
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
        String(d.getHours()).padStart(2, '0'),
        String(d.getMinutes()).padStart(2, '0'),
        String(d.getSeconds()).padStart(2, '0'),
    ].join('');
}

function clientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
}

async function sendReturnEmail(email, subject, htmlBody) {
    try {
        await sendMailMessage(email, `<div style="font-family:sans-serif">${htmlBody}</div>`);
    } catch {
        // email failure không block luồng chính
    }
}

const STATUS_LABELS = {
    PENDING_REVIEW: 'Chờ xem xét',
    CONTACTING:     'Đang liên hệ',
    WAITING_ITEM:   'Chờ nhận hàng',
    ITEM_RECEIVED:  'Đã nhận hàng',
    APPROVED:       'Chấp nhận trả hàng',
    REJECTED:       'Từ chối',
    REFUNDED:       'Đã hoàn tiền',
};

// ─── Controller ──────────────────────────────────────────────────────────────

const ControllerReturn = {
    // Khách hàng tạo yêu cầu trả hàng
    async CreateRequest(req, res) {
        try {
            const user = decoded(req);
            const { order_id, reason, description } = req.body;

            const order = await ModelOrder.findById(order_id);
            if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            if (order.email !== user.email) return res.status(403).json({ message: 'Không có quyền' });
            if (!order.statusOrder) return res.status(400).json({ message: 'Chỉ có thể trả hàng sau khi đã nhận hàng' });
            if (order.has_return_request) return res.status(400).json({ message: 'Đơn hàng đã có yêu cầu trả hàng' });

            // Kiểm tra thời hạn trả hàng theo sản phẩm
            const items = await ModelOrderItem.find({ order_id });
            const products = await ModelProducts.find({ _id: { $in: items.map(i => i.product_id) } });
            const maxReturnDays = Math.max(0, ...products.map(p => p.return_days || 0));

            if (maxReturnDays === 0) return res.status(400).json({ message: 'Sản phẩm không hỗ trợ trả hàng' });

            const deadline = new Date(order.created_at).getTime() + maxReturnDays * 86400000;
            if (Date.now() > deadline) {
                return res.status(400).json({ message: `Đã quá hạn trả hàng (${maxReturnDays} ngày kể từ ngày đặt)` });
            }

            const request = await ModelReturnRequest.create({
                order_id,
                customer_email: user.email,
                reason,
                description: description || '',
                refund_amount: order.sumPrice,
            });

            await ModelOrder.findByIdAndUpdate(order_id, { has_return_request: true });

            await sendReturnEmail(user.email, 'Yêu cầu trả hàng đã được ghi nhận',
                `<h3>Yêu cầu trả hàng #${request._id}</h3>
                 <p>Chúng tôi đã nhận được yêu cầu trả hàng của bạn.</p>
                 <p><b>Lý do:</b> ${reason}</p>
                 <p>Nhân viên sẽ liên hệ với bạn trong thời gian sớm nhất.</p>`
            );

            return res.status(201).json({ message: 'Đã gửi yêu cầu trả hàng', request });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Khách xem yêu cầu của mình
    async GetMyRequests(req, res) {
        try {
            const user = decoded(req);
            const requests = await ModelReturnRequest.find({ customer_email: user.email }).sort({ created_at: -1 });
            return res.status(200).json(requests);
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // ── Admin ──

    async GetAllRequests(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const filter = status ? { status } : {};
            const [data, total] = await Promise.all([
                ModelReturnRequest.find(filter).sort({ created_at: -1 }).skip((page - 1) * limit).limit(Number(limit)),
                ModelReturnRequest.countDocuments(filter),
            ]);
            return res.status(200).json({ data, total, page: Number(page) });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    async GetRequestById(req, res) {
        try {
            const request = await ModelReturnRequest.findById(req.params.id);
            if (!request) return res.status(404).json({ message: 'Không tìm thấy' });
            const order = await ModelOrder.findById(request.order_id);
            const items = await ModelOrderItem.find({ order_id: request.order_id });
            return res.status(200).json({ request, order, items });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Nhân viên cập nhật trạng thái: CONTACTING / WAITING_ITEM / ITEM_RECEIVED
    async UpdateStatus(req, res) {
        try {
            const actor = decoded(req);
            const { status, staff_note } = req.body;
            const allowed = ['CONTACTING', 'WAITING_ITEM', 'ITEM_RECEIVED'];
            if (!allowed.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

            const request = await ModelReturnRequest.findByIdAndUpdate(
                req.params.id,
                { status, staff_note: staff_note || '', modified_at: new Date(), modified_by: actor.email },
                { new: true }
            );
            if (!request) return res.status(404).json({ message: 'Không tìm thấy' });

            const emailMessages = {
                CONTACTING:    'Nhân viên đang liên hệ với bạn để xác nhận yêu cầu trả hàng.',
                WAITING_ITEM:  'Vui lòng gửi hàng về địa chỉ cửa hàng. Chúng tôi sẽ thông báo khi nhận được.',
                ITEM_RECEIVED: 'Chúng tôi đã nhận được hàng từ bạn và đang xem xét yêu cầu.',
            };

            await sendReturnEmail(request.customer_email,
                `Cập nhật yêu cầu trả hàng: ${STATUS_LABELS[status]}`,
                `<h3>Yêu cầu trả hàng #${request._id}</h3>
                 <p><b>Trạng thái:</b> ${STATUS_LABELS[status]}</p>
                 <p>${emailMessages[status]}</p>
                 ${staff_note ? `<p><b>Ghi chú từ nhân viên:</b> ${staff_note}</p>` : ''}`
            );

            return res.status(200).json({ message: 'Đã cập nhật trạng thái', request });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Manager/Admin chấp nhận trả hàng
    async ApproveReturn(req, res) {
        try {
            const actor = decoded(req);
            const request = await ModelReturnRequest.findById(req.params.id);
            if (!request) return res.status(404).json({ message: 'Không tìm thấy' });
            if (request.status !== 'ITEM_RECEIVED') return res.status(400).json({ message: 'Chỉ có thể chấp nhận khi đã nhận được hàng' });

            await ModelReturnRequest.findByIdAndUpdate(req.params.id, {
                status: 'APPROVED', modified_at: new Date(), modified_by: actor.email,
            });

            await sendReturnEmail(request.customer_email,
                'Yêu cầu trả hàng đã được chấp nhận',
                `<h3>Yêu cầu trả hàng #${request._id}</h3>
                 <p>Yêu cầu trả hàng của bạn đã được <b>chấp nhận</b>.</p>
                 <p>Số tiền hoàn: <b>${request.refund_amount.toLocaleString('vi-VN')} VNĐ</b></p>
                 <p>Chúng tôi sẽ tiến hành hoàn tiền trong thời gian sớm nhất.</p>`
            );

            return res.status(200).json({ message: 'Đã chấp nhận yêu cầu trả hàng' });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Manager/Admin từ chối
    async RejectReturn(req, res) {
        try {
            const actor = decoded(req);
            const { reject_reason } = req.body;
            const request = await ModelReturnRequest.findByIdAndUpdate(
                req.params.id,
                { status: 'REJECTED', reject_reason: reject_reason || '', modified_at: new Date(), modified_by: actor.email },
                { new: true }
            );
            if (!request) return res.status(404).json({ message: 'Không tìm thấy' });

            await ModelOrder.findByIdAndUpdate(request.order_id, { has_return_request: false });

            await sendReturnEmail(request.customer_email,
                'Yêu cầu trả hàng bị từ chối',
                `<h3>Yêu cầu trả hàng #${request._id}</h3>
                 <p>Rất tiếc, yêu cầu trả hàng của bạn đã bị <b>từ chối</b>.</p>
                 ${reject_reason ? `<p><b>Lý do:</b> ${reject_reason}</p>` : ''}
                 <p>Nếu có thắc mắc vui lòng liên hệ cửa hàng.</p>`
            );

            return res.status(200).json({ message: 'Đã từ chối yêu cầu trả hàng' });
        } catch {
            return res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Admin hoàn tiền qua VNPay (hoặc đánh dấu hoàn COD)
    async ProcessRefund(req, res) {
        try {
            const actor = decoded(req);
            const request = await ModelReturnRequest.findById(req.params.id);
            if (!request) return res.status(404).json({ message: 'Không tìm thấy' });
            if (request.status !== 'APPROVED') return res.status(400).json({ message: 'Yêu cầu phải ở trạng thái Chấp nhận trước khi hoàn tiền' });

            const order = await ModelOrder.findById(request.order_id);

            // Hoàn tiền VNPay
            if (order?.payment_method === 'vnpay' && order.vnp_transaction_no) {
                const requestId = uuidv4().replace(/-/g, '').substring(0, 16);
                const createDate = formatVNPayDate(new Date());

                const params = {
                    vnp_RequestId:      requestId,
                    vnp_Version:        '2.1.0',
                    vnp_Command:        'refund',
                    vnp_TmnCode:        VNPAY_TMN_CODE,
                    vnp_TransactionType: '02',
                    vnp_TxnRef:         order.vnp_txn_ref,
                    vnp_Amount:         String(request.refund_amount * 100),
                    vnp_OrderInfo:      'Hoan tien don hang tra hang',
                    vnp_TransactionNo:  order.vnp_transaction_no,
                    vnp_TransactionDate: order.vnp_pay_date,
                    vnp_CreateBy:       actor.email,
                    vnp_CreateDate:     createDate,
                    vnp_IpAddr:         clientIp(req),
                };

                const sortedKeys = Object.keys(params).sort();
                const hashData = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
                params.vnp_SecureHash = crypto.createHmac('sha512', VNPAY_SECRET)
                    .update(Buffer.from(hashData, 'utf-8')).digest('hex');

                const vnRes = await axios.post(VNPAY_API_URL, params, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (vnRes.data?.vnp_ResponseCode !== '00') {
                    return res.status(400).json({
                        message: `VNPay từ chối hoàn tiền: ${vnRes.data?.vnp_Message || 'Lỗi không xác định'}`,
                    });
                }
            }
            // COD: hoàn tiền thủ công, không cần gọi API

            await ModelReturnRequest.findByIdAndUpdate(req.params.id, {
                status: 'REFUNDED', refunded_by: actor.email, refunded_at: new Date(),
                modified_at: new Date(), modified_by: actor.email,
            });

            await sendReturnEmail(request.customer_email,
                'Hoàn tiền thành công',
                `<h3>Yêu cầu trả hàng #${request._id}</h3>
                 <p>Chúng tôi đã hoàn tiền <b>${request.refund_amount.toLocaleString('vi-VN')} VNĐ</b> cho bạn.</p>
                 ${order?.payment_method === 'vnpay'
                     ? '<p>Tiền sẽ được hoàn về tài khoản ngân hàng của bạn trong 3–5 ngày làm việc.</p>'
                     : '<p>Nhân viên sẽ liên hệ để hoàn tiền mặt cho bạn.</p>'
                 }`
            );

            return res.status(200).json({ message: 'Đã xử lý hoàn tiền thành công' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Lỗi server khi hoàn tiền' });
        }
    },
};

module.exports = ControllerReturn;
