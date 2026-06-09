// ─── Admin Roles ─────────────────────────────────────────────────────────────
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  STAFF: 'staff',
};

// ─── Order Statuses ───────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  { value: 'pending',            label: 'Pending',            color: 'yellow' },
  { value: 'confirmed',          label: 'Confirmed',          color: 'blue'   },
  { value: 'processing',         label: 'Processing',         color: 'purple' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: 'indigo' },
  { value: 'dispatched',         label: 'Dispatched',         color: 'orange' },
  { value: 'delivered',          label: 'Delivered',          color: 'teal'   },
  { value: 'completed',          label: 'Completed',          color: 'green'  },
  { value: 'cancelled',          label: 'Cancelled',          color: 'red'    },
];

// ─── Permission Keys ──────────────────────────────────────────────────────────
export const PERMISSIONS = {
  MANAGE_PRODUCTS:   'manageProducts',
  MANAGE_ORDERS:     'manageOrders',
  MANAGE_CUSTOMERS:  'manageCustomers',
  MANAGE_CATEGORIES: 'manageCategories',
  MANAGE_USERS:      'manageUsers',
  VIEW_REPORTS:      'viewReports',
  MANAGE_SETTINGS:   'manageSettings',
  MANAGE_MARKETING:  'manageMarketing',
};

// Default permissions for each role
export const DEFAULT_PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    manageProducts:   true,
    manageOrders:     true,
    manageCustomers:  true,
    manageCategories: true,
    manageUsers:      true,
    viewReports:      true,
    manageSettings:   true,
    manageMarketing:  true,
  },
  [ROLES.ADMIN]: {
    manageProducts:   true,
    manageOrders:     true,
    manageCustomers:  true,
    manageCategories: true,
    manageUsers:      false,
    viewReports:      true,
    manageSettings:   false,
    manageMarketing:  true,
  },
  [ROLES.STAFF]: {
    manageProducts:   false,
    manageOrders:     true,
    manageCustomers:  false,
    manageCategories: false,
    manageUsers:      false,
    viewReports:      false,
    manageSettings:   false,
    manageMarketing:  false,
  },
};

// ─── Product Status ───────────────────────────────────────────────────────────
export const PRODUCT_STATUSES = [
  { value: 'active',       label: 'Active'       },
  { value: 'inactive',     label: 'Inactive'     },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

// ─── Navigation ───────────────────────────────────────────────────────────────
export const STORE_NAV_LINKS = [
  { label: 'Home',    href: '/'         },
  { label: 'Shop',    href: '/shop'     },
  { label: 'About',   href: '/about'    },
  { label: 'Contact', href: '/contact'  },
];

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard',  href: '/admin',             icon: 'LayoutDashboard', permission: null              },
  { label: 'Products',   href: '/admin/products',    icon: 'Package',         permission: 'manageProducts'  },
  { label: 'Orders',     href: '/admin/orders',      icon: 'ShoppingBag',     permission: 'manageOrders'    },
  { label: 'Customers',  href: '/admin/customers',   icon: 'Users',           permission: 'manageCustomers' },
  { label: 'Categories', href: '/admin/categories',  icon: 'Tag',             permission: 'manageCategories'},
  { label: 'Marketing',  href: '/admin/marketing',   icon: 'TrendingUp',      permission: 'manageMarketing' },
  { label: 'Users',      href: '/admin/users',       icon: 'Shield',          permission: 'manageUsers'     },
  { label: 'Settings',   href: '/admin/settings',    icon: 'Settings',        permission: 'manageSettings'  },
];

// ─── Low Stock Threshold ──────────────────────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 5;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PRODUCTS_PER_PAGE = 24;
export const ORDERS_PER_PAGE   = 20;
