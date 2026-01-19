import App from '../App';
import Loading from '../Layouts/Loading/Loading';
import DefaultLayout from '../Pages/Admin/DefaultLayout/DefaultLayout';
import Blogger from '../Pages/Blog/Blogger';
import CartUser from '../Pages/Cart/Cart';
import Checkout from '../Pages/Checkout/Checkout';
import Contact from '../Pages/Contact/Contact';
import DefaultPage from '../Pages/DefaultPage/DefaultPage';
import InfoUser from '../Pages/InfoUser/InfoUser';
import LoginUser from '../Pages/Login/LoginUser';
import ProductDetail from '../Pages/ProductDetail/ProductDetail';
import RegisterUser from '../Pages/Register/RegisterUser';
import SuccessfulPaymentPage from '../Pages/SuccessfulPaymentPage/SuccessfulPaymentPage';

export const publicRoutes = [
    { path: '/', element: <App /> },
    { path: '/category', element: <DefaultPage /> },
    { path: '/login', element: <LoginUser /> },
    { path: '/register', element: <RegisterUser /> },
    { path: '/cart', element: <CartUser /> },
    { path: '/checkout', element: <Checkout /> },
    { path: '/prodetail/:id', element: <ProductDetail /> },
    { path: '/loading', element: <Loading /> },
    { path: '/info', element: <InfoUser /> },
    { path: '/thanks', element: <SuccessfulPaymentPage /> },
    { path: '/contact', element: <Contact /> },
    { path: '/blog', element: <Blogger /> },
];

export const privateRoute = [{ path: '/admin', element: <DefaultLayout /> }];
