const Customer = require('../models/Customer');
const logAudit = require('../utils/auditLogger');

/**
 * @desc    Create a customer
 * @route   POST /api/customers
 * @access  Private (Admin, Manager, Staff)
 */
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone'
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address
    });

    await logAudit(req.user._id, 'CREATE_CUSTOMER', 'Customer', customer._id, `Customer created: ${customer.name}`);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private (Admin, Manager, Staff)
 */
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private (Admin, Manager, Staff)
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private (Admin, Manager, Staff)
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (status !== undefined) customer.status = status;

    const updatedCustomer = await customer.save();

    await logAudit(req.user._id, 'UPDATE_CUSTOMER', 'Customer', customer._id, `Customer updated: ${updatedCustomer.name}`);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private (Admin, Manager)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    await logAudit(req.user._id, 'DELETE_CUSTOMER', 'Customer', req.params.id, `Customer deleted: ${customer.name}`);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
