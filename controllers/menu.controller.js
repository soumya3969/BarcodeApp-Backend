const MenuItem = require('../models/MenuItem.model');
const Category = require('../models/Category.model');

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    // First try to get categories from Category model
    const categories = await Category.find().sort({ name: 1 });
    if (categories && categories.length > 0) {
      return res.json(categories);
    }
    
    // If no categories found in Category model, extract from menu items
    const distinctCategories = await MenuItem.distinct('category');
    
    // Format the response to match expected structure
    const formattedCategories = await Promise.all(
      distinctCategories
        .filter(catId => catId) // Filter out null/undefined
        .map(async (catId) => {
          const item = await MenuItem.findOne({ category: catId });
          return {
            _id: catId,
            name: item?.categoryName || 'Uncategorized'
          };
        })
    );
    
    res.json(formattedCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, newCategory } = req.body;
    const dietaryInfo = {
      isVegetarian: req.body.isVegetarian === 'true',
      isVegan: req.body.isVegan === 'true',
      isGlutenFree: req.body.isGlutenFree === 'true'
    };

    // Handle custom category if specified
    let categoryId = category;
    let categoryName = '';

    if (newCategory === 'true' && category) {
      // Create a new category
      try {
        const newCat = new Category({
          name: category
        });
        const savedCategory = await newCat.save();
        categoryId = savedCategory._id;
        categoryName = savedCategory.name;
      } catch (catError) {
        console.error('Failed to create category:', catError);
        // Continue with the original category value if category creation fails
      }
    }

    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      category: categoryId,
      categoryName: categoryName, // Store category name for easy reference
      dietaryInfo,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const menuItem = await newMenuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, newCategory } = req.body;
    
    // Handle custom category if specified
    let categoryId = category;
    let categoryName = '';

    if (newCategory === 'true' && category) {
      // Create a new category
      try {
        const newCat = new Category({
          name: category
        });
        const savedCategory = await newCat.save();
        categoryId = savedCategory._id;
        categoryName = savedCategory.name;
      } catch (catError) {
        console.error('Failed to create category:', catError);
        // Continue with the original category value if category creation fails
      }
    } else if (category) {
      // Get existing category name
      try {
        const existingCategory = await Category.findById(category);
        if (existingCategory) {
          categoryName = existingCategory.name;
        }
      } catch (err) {
        console.error('Error finding category:', err);
      }
    }

    const dietaryInfo = {
      isVegetarian: req.body.isVegetarian === 'true',
      isVegan: req.body.isVegan === 'true',
      isGlutenFree: req.body.isGlutenFree === 'true'
    };

    const menuItemFields = {
      name,
      description,
      price,
      category: categoryId,
      categoryName: categoryName, // Store category name for easy reference
      dietaryInfo
    };

    if (req.file) {
      menuItemFields.image = `/uploads/${req.file.filename}`;
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: menuItemFields },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};