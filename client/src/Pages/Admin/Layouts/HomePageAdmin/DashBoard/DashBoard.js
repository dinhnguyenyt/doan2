import classNames from 'classnames/bind';
import styles from './DashBoard.module.scss';
import { useEffect, useState } from 'react';
import request from '../../../../../config/Connect';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const cx = classNames.bind(styles);

function Dashboard() {
    const [dataProducts, setDataProducts] = useState([]);
    const [dataUsers, setDataUsers] = useState([]);
    const [dataOrders, setDataOrders] = useState([]);

    useEffect(() => {
        // Fetch all required data
        Promise.all([
            request.get('/api/products').then(res => setDataProducts(res.data || [])).catch(() => {}),
            request.get('/api/datauser').then(res => setDataUsers(res.data || [])).catch(() => {}),
            request.get('/api/getorder').then(res => setDataOrders(res.data || [])).catch(() => {})
        ]);
    }, []);

    // Calculate KPIs
    const totalProducts = dataProducts.length;
    const totalCustomers = dataUsers.length;
    const totalOrders = dataOrders.length;
    
    // Estimate total revenue if sumPrice exists on order, otherwise use a placeholder or sum up products
    let totalRevenue = 0;
    dataOrders.forEach(order => {
        if (order.totalAmount || order.sumPrice) {
            totalRevenue += Number(order.totalAmount || order.sumPrice);
        } else if (order.products) {
            order.products.forEach(p => {
                totalRevenue += (p.price || 0) * (p.quantity || 1);
            });
        }
    });

    // Revenue Last 7 Days — group orders by date
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const label = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const revenue = dataOrders
            .filter(order => order.created_at && new Date(order.created_at).toISOString().split('T')[0] === dateStr)
            .reduce((sum, order) => sum + (order.sumPrice || 0), 0);
        return { name: label, Revenue: revenue };
    });

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('page-title')}>Dashboard Overview</h1>
            
            <div className={cx('kpi-container')}>
                <div className={cx('kpi-card', 'bg-purple')}>
                    <h3>Total Revenue</h3>
                    <p className={cx('kpi-value')}>$ {totalRevenue.toLocaleString()}</p>
                </div>
                <div className={cx('kpi-card', 'bg-blue')}>
                    <h3>Total Orders</h3>
                    <p className={cx('kpi-value')}>{totalOrders}</p>
                </div>
                <div className={cx('kpi-card', 'bg-green')}>
                    <h3>Total Customers</h3>
                    <p className={cx('kpi-value')}>{totalCustomers}</p>
                </div>
                <div className={cx('kpi-card', 'bg-orange')}>
                    <h3>Active Products</h3>
                    <p className={cx('kpi-value')}>{totalProducts}</p>
                </div>
            </div>

            <div className={cx('sections-grid')}>
                <div className={cx('chart-section')}>
                    <h2>Revenue Last 7 Days</h2>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Revenue" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cx('recent-orders-section')}>
                    <h2>Recent Orders</h2>
                    <div className={cx('table-responsive')}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataOrders.slice(0, 5).map((order, idx) => (
                                    <tr key={idx}>
                                        <td>{order.email}</td>
                                        <td>
                                            <span className={cx('badge', order.statusOrder ? 'badge-success' : 'badge-warning')}>
                                                {order.statusOrder ? 'Delivered' : 'Shipping'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={cx('badge', order.statusPayment ? 'badge-success' : 'badge-warning')}>
                                                {order.statusPayment ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {dataOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>No orders yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
