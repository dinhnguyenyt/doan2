import { useEffect, useState } from 'react';

import request from '../../../../../config/Connect';

function Customers() {
    const [dataUser, setDataUser] = useState([]);

    useEffect(() => {
        request.get('/api/datauser').then((res) => setDataUser(res.data));
    }, []);

    return (
        <div>
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Position</th>
                    </tr>
                </thead>
                <tbody>
                    {dataUser.map((item) => (
                        <>
                            <tr key={item._id}>
                                <th scope="row">{item._id}</th>
                                <td>{item.fullname}</td>
                                <td>{item.email}</td>
                                <td>{item.isAdmin === false ? 'User' : 'Admin'}</td>
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Customers;
