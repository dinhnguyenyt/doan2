import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { privateRoute, publicRoutes } from './Route';
import { jwtDecode } from 'jwt-decode';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router>
                <Routes>
                    {publicRoutes.map((route, index) => {
                        return <Route key={index} path={route.path} element={route.element} />;
                    })}
                    {privateRoute.map((route, index) => {
                        try {
                            const tokenRow = document.cookie.split('; ').find(row => row.startsWith('Token='));
                            if (tokenRow) {
                                const token = tokenRow.split('=')[1];
                                const decoded = jwtDecode(token);
                                const role = decoded.role || (decoded.admin ? 'admin' : 'user');
                                if (role === 'admin' || role === 'staff') {
                                    return <Route key={route.path} path={route.path} element={route.element} />;
                                }
                            }
                        } catch (error) {
                            console.error("Token decode error:", error);
                        }
                        // Nếu không đủ quyền, trả về route chặn bằng thẻ bảo vệ trống hoặc điều hướng về App
                        return <Route key={route.path || index} path={route.path} element={<App />} />;
                    })}
                </Routes>
            </Router>
        </Provider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
