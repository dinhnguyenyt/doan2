import axios from 'axios'; // import thu vien axios

const request = axios.create({
    // tao doi tuong axios
    withCredentials: true, // cho phep truy cap cookie
    baseURL: 'http://localhost:5000/', // url server
});

export default request; // export doi tuong
