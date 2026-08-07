
import { db } from '../db.js';

const ROLE_ALIASES = {
  owner: 'owner',
  super_admin: 'owner',
  admin: 'owner',
  accountant: 'financier',
  financier: 'financier',
  finance: 'financier',
  billing: 'cashier',
  cashier: 'cashier',
  'cashier (billing)': 'cashier',
  stock_manager: 'store_manager',
  store_manager: 'store_manager',
  'store manager': 'store_manager',
  'store management': 'store_manager',
  'stock management': 'store_manager',
};

export function normalizeRole(role) {
  if (!role) return 'owner'; // Default to owner in development/fallback
  const clean = String(role).toLowerCase().trim().replace(/_/g, ' ');
  const directKey = String(role).toLowerCase().trim();
  if (ROLE_ALIASES[directKey]) return ROLE_ALIASES[directKey];
  if (clean.includes('financ') || clean.includes('account')) return 'financier';
  if (clean.includes('cashier') || clean.includes('bill')) return 'cashier';
  if (clean.includes('stock') || clean.includes('store') || clean.includes('manag')) return 'store_manager';
  return ROLE_ALIASES[clean] || clean;
}

/**
 * Middleware factory to restrict route access to specific roles.
 * Usage: router.post('/sensitive', requireRoles(['owner', 'financier']), (req, res) => ...)
 *
 * @param {string[]} allowedRoles Array of normalized roles allowed to access the route
 */
export function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    const headerRole = req.headers['x-user-role'] || req.query.role || (req.body && req.body.userRole);
    const userRole = normalizeRole(headerRole);

    // Normalize allowed roles list
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    // Business Owner always has root access unless specifically restricted
    if (userRole === 'owner' || normalizedAllowed.includes(userRole)) {
      req.authenticatedUserRole = userRole;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access Denied: Your assigned role ('${userRole}') does not have permission to perform this action.`,
      requiredRoles: allowedRoles,
      assignedRole: userRole,
    });
  };
}

/**
 * Permissions matrix helper for fine-grained entity actions
 */
export const PERMISSIONS = {
  // Inventory
  INVENTORY_READ: ['owner', 'financier', 'cashier', 'store_manager'],
  INVENTORY_WRITE: ['owner', 'store_manager'],
  INVENTORY_DELETE: ['owner'],

  // Employees & Staff
  EMPLOYEES_MANAGE: ['owner'],
  EMPLOYEES_READ: ['owner'],

  // Invoices & Billing
  BILLING_CREATE: ['owner', 'cashier'],
  INVOICES_READ: ['owner', 'financier', 'cashier'],
  INVOICES_UPLOAD: ['owner'],

  // Expenses & Cash Out
  EXPENSES_READ: ['owner', 'financier'],
  EXPENSES_WRITE: ['owner', 'financier'],

  // Transactions & Cash In
  TRANSACTIONS_READ: ['owner', 'financier'],
  TRANSACTIONS_WRITE: ['owner', 'financier'],

  // Compliance & GST
  COMPLIANCE_READ: ['owner', 'financier'],
  COMPLIANCE_WRITE: ['owner', 'financier'],

  // AI Assistant & Deep Insights
  AI_ACCESS: ['owner'],

  // Settings & System Configuration
  SETTINGS_MANAGE: ['owner'],
};

/**
 * Shop Isolation Middleware
 * Enforces that owners can only view their own data, and employees can only view data from their owner's shop.
 */
export function validateShopIsolation() {
  return (req, res, next) => {
    const headerRole = req.headers['x-user-role'] || req.query.role || (req.body && req.body.userRole);
    const userId = req.headers['x-user-id'] || req.query.userId || (req.body && req.body.userId);
    const shopId = req.headers['x-shop-id'] || req.query.shopId || (req.body && req.body.shopId) || userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing User ID headers.' });
    }

    const userRole = normalizeRole(headerRole);
    req.shopId = shopId;
    req.userId = userId;
    req.userRole = userRole;

    if (userRole === 'owner') {
      // Owner can only access their own shop data
      if (userId !== shopId) {
        return res.status(403).json({ success: false, error: 'Forbidden: Owner user ID must match the Shop ID.' });
      }
      return next();
    }

    // For employees (financier, cashier, store_manager), verify in DB that they belong to this shop
    const users = db.getTable('users');
    const user = users.find(u => u.user_id === userId || u.email === userId);
    if (!user) {
      return res.status(403).json({ success: false, error: 'Forbidden: Employee user record not found.' });
    }

    if (user.owner_id && user.owner_id !== shopId) {
      return res.status(403).json({ success: false, error: 'Forbidden: Employee does not belong to this shop.' });
    }

    return next();
  };
}
