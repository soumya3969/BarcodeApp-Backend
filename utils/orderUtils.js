const MenuItem = require('../models/MenuItem.model');
const logger = require('./logger');

/**
 * Calculate total amount for an order with validation
 * @param {Array} orderItems Array of order items with menuItem, quantity, and price
 * @param {Boolean} validatePrices Whether to validate prices against the database
 * @returns {Promise<{totalAmount: number, validatedItems: Array}>}
 */
exports.calculateOrderTotal = async (orderItems, validatePrices = true) => {
  let totalAmount = 0;
  let validatedItems = [...orderItems]; // Clone the array
  
  if (validatePrices) {
    // Get all menu item IDs
    const menuItemIds = orderItems.map(item => item.menuItem);
    
    // Fetch menu items from database to validate prices
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();
    
    // Create a map for quick lookup
    const menuItemMap = new Map();
    menuItems.forEach(item => {
      menuItemMap.set(item._id.toString(), item);
    });
    
    // Validate and calculate total
    validatedItems = orderItems.map(item => {
      const menuItem = menuItemMap.get(item.menuItem.toString());
      
      if (!menuItem) {
        logger.warn(`Menu item not found: ${item.menuItem}`);
        throw new Error(`Menu item not found: ${item.menuItem}`);
      }
      
      // Use the correct price from database
      const price = menuItem.price;
      const quantity = item.quantity || 1;
      totalAmount += (price * quantity);
      
      return {
        ...item,
        price // Override with correct price
      };
    });
  } else {
    // Just calculate total from the provided items without validation
    orderItems.forEach(item => {
      totalAmount += (item.price * (item.quantity || 1));
    });
  }
  
  return {
    totalAmount,
    validatedItems
  };
};

/**
 * Validate that table exists
 * @param {Object} Table Mongoose Table model
 * @param {String} tableId Table ID to validate
 * @returns {Promise<Object>} The table if found
 * @throws {Error} If table not found
 */
exports.validateTable = async (Table, tableId) => {
  const table = await Table.findById(tableId);
  if (!table) {
    logger.warn(`Table not found: ${tableId}`);
    throw new Error('Table not found');
  }
  return table;
};
