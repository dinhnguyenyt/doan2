export const MENU_PERMISSIONS = {
    dash:     ['admin', 'manager', 'staff'],
    order:    ['admin', 'manager', 'staff'],
    product:  ['admin', 'manager', 'staff'],
    category: ['admin', 'manager', 'staff'],
    coupon:   ['admin', 'manager'],
    customer: ['admin', 'manager'],
    blog:     ['admin', 'manager', 'staff'],
    comment:  ['admin', 'manager', 'staff'],
};

export function canAccessMenu(menuKey, role) {
    return MENU_PERMISSIONS[menuKey]?.includes(role) ?? false;
}
