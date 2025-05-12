const Order = require('../models/Order.model');
const Table = require('../models/Table.model');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, table } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (table) query.table = table;  // Using 'table' instead of 'tableId'
    
    const orders = await Order.find(query)
      .populate('table')  // Changed from 'tableId' to 'table'
      .populate('items.menuItem')
      .populate('servedBy')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single order by ID
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

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, customerName, customerEmail, notes } = req.body;
    
    // Validate input
    if (!tableId || !items || !items.length) {
      return res.status(400).json({ message: 'Table ID and at least one item are required' });
    }
    
    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += (item.price * item.quantity);
    });
    
    const newOrder = new Order({
      table: tableId,  // Changed from 'tableId' to 'table'
      customer: {
        name: customerName || 'Guest',
        email: customerEmail
      },
      items,
      totalAmount,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });
    
    const savedOrder = await newOrder.save();
    
    // Populate references for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('table')
      .populate('items.menuItem');
      
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'served', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order is locked
    if (order.status === 'completed' && order.paymentStatus === 'paid') {
      const lastUpdateTime = new Date(order.updatedAt);
      const currentTime = new Date();
      const minutesElapsed = (currentTime - lastUpdateTime) / (1000 * 60);
      
      if (minutesElapsed >= 5) {
        return res.status(403).json({ message: 'Order is locked. No further changes allowed.' });
      }
    }
    
    // Update order status
    order.status = status;
    
    // If status is "served" or "completed", assign staff member who served it
    if (['served', 'completed'].includes(status)) {
      order.servedBy = req.user._id;
    }
    
    await order.save();
    
    const updatedOrder = await Order.findById(req.params.id)
      .populate('table')
      .populate('items.menuItem')
      .populate('servedBy');
      
    res.json(updatedOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus || !['unpaid', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Valid payment status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order is locked
    if (order.status === 'completed' && order.paymentStatus === 'paid') {
      const lastUpdateTime = new Date(order.updatedAt);
      const currentTime = new Date();
      const minutesElapsed = (currentTime - lastUpdateTime) / (1000 * 60);
      
      if (minutesElapsed >= 5) {
        return res.status(403).json({ message: 'Order is locked. No further changes allowed.' });
      }
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};