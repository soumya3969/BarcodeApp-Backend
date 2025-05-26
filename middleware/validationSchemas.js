const Joi = require('joi');

// User validation schemas
const userSchemas = {
  // Login schema
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Registration schema
  register: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('owner', 'manager', 'staff').default('staff')
  }),

  // Update user schema
  updateUser: Joi.object({
    name: Joi.string(),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).allow('').messages({
      'string.min': 'Password must be at least 6 characters long'
    }),
    role: Joi.string().valid('owner', 'manager', 'staff')
  })
};

// Menu item validation schemas
const menuItemSchemas = {
  // Create/update menu item schema
  createOrUpdate: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be positive',
      'any.required': 'Price is required'
    }),
    category: Joi.string().allow(''),
    newCategory: Joi.string().valid('true', 'false').default('false'),
    isVegetarian: Joi.string().valid('true', 'false').default('false'),
    isVegan: Joi.string().valid('true', 'false').default('false'),
    isGlutenFree: Joi.string().valid('true', 'false').default('false')
  })
};

// Table validation schemas
const tableSchemas = {
  // Create/update table schema
  createOrUpdate: Joi.object({
    tableNumber: Joi.string().required().messages({
      'any.required': 'Table number is required'
    }),
    capacity: Joi.number().integer().positive().required().messages({
      'number.base': 'Capacity must be a number',
      'number.integer': 'Capacity must be an integer',
      'number.positive': 'Capacity must be positive',
      'any.required': 'Capacity is required'
    }),
    section: Joi.string().default('Main'),
    isActive: Joi.boolean().default(true)
  })
};

// Order validation schemas
const orderSchemas = {
  // Create order schema
  create: Joi.object({
    tableId: Joi.string().required().messages({
      'any.required': 'Table ID is required'
    }),
    items: Joi.array().items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        price: Joi.number().positive().required(),
        notes: Joi.string().allow('')
      })
    ).min(1).required().messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    }),
    customerName: Joi.string().allow(''),
    customerEmail: Joi.string().email().allow('').messages({
      'string.email': 'Please provide a valid email address'
    }),
    notes: Joi.string().allow('')
  }),

  // Update order status schema
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'preparing', 'served', 'completed', 'cancelled')
      .required()
      .messages({
        'any.only': 'Status must be one of: pending, preparing, served, completed, cancelled',
        'any.required': 'Status is required'
      })
  }),

  // Update payment status schema
  updatePayment: Joi.object({
    paymentStatus: Joi.string()
      .valid('unpaid', 'paid')
      .required()
      .messages({
        'any.only': 'Payment status must be either unpaid or paid',
        'any.required': 'Payment status is required'
      })
  })
};

// Offer validation schema
const offerSchemas = {
  // Create/update offer schema
  createOrUpdate: Joi.object({
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    discount: Joi.number().positive().max(100).required().messages({
      'number.base': 'Discount must be a number',
      'number.positive': 'Discount must be positive',
      'number.max': 'Discount cannot exceed 100%',
      'any.required': 'Discount is required'
    }),
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    })
  })
};

// QR Code validation schema
const qrCodeSchemas = {
  // Create global QR code schema
  createGlobal: Joi.object({
    section: Joi.string().required().messages({
      'any.required': 'Section is required'
    }),
    url: Joi.string().uri().required().messages({
      'string.uri': 'URL must be a valid URI',
      'any.required': 'URL is required'
    })
  }),

  // Create global menu QR code schema
  createGlobalMenu: Joi.object({
    baseUrl: Joi.string().uri().required().messages({
      'string.uri': 'Base URL must be a valid URI',
      'any.required': 'Base URL is required'
    })
  })
};

module.exports = {
  userSchemas,
  menuItemSchemas,
  tableSchemas,
  orderSchemas,
  offerSchemas,
  qrCodeSchemas
};
