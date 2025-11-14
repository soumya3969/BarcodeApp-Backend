const MenuItem = require('../models/MenuItem.model');
const Table = require('../models/Table.model');
const Category = require('../models/Category.model');
const Order = require('../models/Order.model');

// Get all menu items (public access)
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific menu item (public access)
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu categories (public access)
exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get table information (public access)
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get menu for specific table (public access)
exports.getTableMenu = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Get the menu items relevant to this table
    const menuItems = await MenuItem.find({ isActive: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public endpoint to create an order
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, customerName, customerEmail, notes } = req.body;

    // Validate table
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(400).json({ message: 'Invalid table' });
    }

    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += (item.price * (item.quantity || 1));
    });

    const newOrder = new Order({
      table: tableId,  // Set as table field to match schema
      customer: {
        name: customerName || 'Guest',
        email: customerEmail
      },
      items,
      totalAmount,     // Changed from totalPrice to totalAmount
      notes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    const order = await newOrder.save();
    
    // Populate references for response
    const populatedOrder = await Order.findById(order._id)
      .populate('table')
      .populate('items.menuItem');
      
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Public endpoint to get order by ID (for tracking)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Public endpoint to get orders by table ID (for order history)
exports.getOrdersByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { includeCompleted } = req.query; // Optional: include completed orders
    
    // Validate table
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Build query
    const query = { table: tableId };
    
    // Filter out completed+paid orders older than 24 hours unless explicitly requested
    if (includeCompleted !== 'true') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.$or = [
        // Include orders that are not completed
        { status: { $ne: 'completed' } },
        // Include orders that are completed but not paid
        { paymentStatus: { $ne: 'paid' } },
        // Include completed+paid orders that are less than 24 hours old
        {
          status: 'completed',
          paymentStatus: 'paid',
          updatedAt: { $gte: twentyFourHoursAgo }
        }
      ];
    }
    
    const orders = await Order.find(query)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy')
      .sort({ createdAt: -1 })
      .limit(20); // Limit to last 20 orders
    
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};