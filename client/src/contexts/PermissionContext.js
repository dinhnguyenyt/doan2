import { createContext, useContext, useEffect, useState } from 'react';
import request from '../config/Connect';

const PermissionContext = createContext({ menus: [], actions: [], loading: true });

export function PermissionProvider({ children }) {
    const [perms, setPerms] = useState({ menus: [], actions: [], loading: true });

    useEffect(() => {
        request
            .get('/api/my-permissions')
            .then((res) => setPerms({ ...res.data, loading: false }))
            .catch(() => setPerms({ menus: [], actions: [], loading: false }));
    }, []);

    return <PermissionContext.Provider value={perms}>{children}</PermissionContext.Provider>;
}

export function usePermission() {
    return useContext(PermissionContext);
}
