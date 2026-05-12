const ACTION_PERMISSIONS = {
    'order:edit':           ['admin', 'manager', 'staff'],
    'order:delete':         ['admin'],

    'product:create':       ['admin', 'manager'],
    'product:edit':         ['admin', 'manager'],
    'product:delete':       ['admin'],

    'category:create':      ['admin', 'manager'],
    'category:edit':        ['admin', 'manager'],
    'category:delete':      ['admin'],

    'coupon:create':        ['admin', 'manager'],
    'coupon:edit':          ['admin', 'manager'],
    'coupon:delete':        ['admin'],

    'customer:edit':        ['admin'],
    'customer:delete':      ['admin'],
    'customer:change_role': ['admin'],

    'blog:create':          ['admin', 'manager', 'staff'],
    'blog:edit':            ['admin', 'manager', 'staff'],
    'blog:delete':          ['admin', 'manager'],

    'comment:delete':       ['admin', 'manager', 'staff'],
};

export function canDo(action, role) {
    return ACTION_PERMISSIONS[action]?.includes(role) ?? false;
}
