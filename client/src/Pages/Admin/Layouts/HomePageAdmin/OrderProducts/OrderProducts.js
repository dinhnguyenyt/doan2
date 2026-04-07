import { useEffect, useState } from 'react';

import request from '../../../../../config/Connect';
import { CheckProduct, ModalEditOrder } from '../../../Modal/Modal';

function OrderProducts() {
    const [dataOrder, setDataOrder] = useState([]);
    const [show, setShow] = useState(false);
    const [idProduct, setIdProduct] = useState(false);
    const [id, setId] = useState('');

    useEffect(() => {
        request.get('/api/getorder').then((res) => setDataOrder(res.data));
    }, [show]);

    const handleShowModal = (id1) => {
        setShow(!show);
        setId(id1);
    };

    return (
        <div>
            <h1>Order Products</h1>
            {dataOrder.map((item) => (
                <table className="table table-bordered border-primary">
                    <thead>
                        <tr>
                            <th scope="col">Email Người Dùng</th>
                            <th scope="col">Tên Sản Phẩm</th>
                            <th scope="col">Trạng Thái</th>
                            <th scope="col">Tình Trạng</th>
                            <th scope="col">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{item.email}</td>
                            <td style={{ display: 'flex', flexDirection: 'column' }}>
                                {item?.products?.map((item2, idx) => (
                                    <div key={idx} style={{ padding: '4px 0' }}>
                                        {item2.nameProduct} (x{item2.quantity})
                                    </div>
                                ))}
                            </td>
                            <td>{item.statusOrder ? 'Đã giao hàng' : 'Đang vận chuyển'}</td>
                            <td>{item.statusPayment ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                            <td>
                                <button
                                    onClick={() => handleShowModal(item._id)}
                                    type="button"
                                    className="btn btn-primary"
                                >
                                    chỉnh sửa
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            ))}
            <CheckProduct show={show} setShow={setShow} idProduct={idProduct} />
            <ModalEditOrder show={show} setShow={setShow} id={id} />
        </div>
    );
}

export default OrderProducts;
