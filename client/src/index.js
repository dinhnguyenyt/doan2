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
                        const token = document.cookie;
                        if (token) {
                            const decoded = jwtDecode(token.slice(6, 9999));
                            if (decoded.admin) {
                                return <Route key={route.path} path={route.path} element={route.element} />;
                            } else {
                                return <Route path="/" element={<App />} />;
                            }
                        }
                        return <Route path="/" element={<App />} />;
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
