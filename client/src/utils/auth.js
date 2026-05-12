import { jwtDecode } from 'jwt-decode';

export function getCurrentRole() {
    try {
        const tokenRow = document.cookie.split('; ').find((row) => row.startsWith('Token='));
        if (!tokenRow) return null;
        const token = tokenRow.split('=')[1];
        const decoded = jwtDecode(token);
        return decoded.role || (decoded.admin ? 'admin' : 'user');
    } catch {
        return null;
    }
}
