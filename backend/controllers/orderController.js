import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc  : Create Order
// @access : private
// @route : POST /api/orders
const addOrderItems = asyncHandler(async (req, res) => {
	const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

	if (orderItems && orderItems.length === 0) {
		res.status(400);
		throw new Error('No order Items');
		return;
	} else {
		const order = new Order({
			orderItems,
			user: req.user._id,
			shippingAddress,
			paymentMethod,
			itemsPrice,
			shippingPrice,
			taxPrice,
			totalPrice
		});

		const createdOrder = await order.save();
		res.status(200).json(createdOrder);
	}
});

// @desc  : Get Order by ID
// @access : private
// @route : GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id).populate('user', 'name email');
	if (order) {
		res.json(order);
	} else {
		res.status(404);
		throw new Error('Order not Found');
	}
});

// @desc  : Update order to PAID
// @access : private
// @route : PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);
	if (order) {
		order.isPaid = true;
		order.paidAt = Date.now();
		order.paymentResult = {
			// Comes from PayPal
			id: req.body.id,
			status: req.body.status,
			update_time: req.body.update_time,
			email_address: req.body.payer.email_address
		};
		const updatedOrder = await order.save();
		res.json(updatedOrder);
	} else {
		res.status(404);
		throw new Error('Order not Found');
	}
});
// @desc  : Update order to DELIVERED
// @access : private/Admin
// @route : PUT /api/orders/:id/deliver
const updateOrderToDelivered = asyncHandler(async (req, res) => {
	const order = await Order.findById(req.params.id);
	if (order) {
		order.isDelivered = true;
		order.deliveredAt = Date.now();
		const updatedOrder = await order.save();
		res.json(updatedOrder);
	} else {
		res.status(404);
		throw new Error('Order not Found');
	}
});
// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({ user: req.user._id });
	res.json(orders);
});
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({}).populate('user', 'id name');
	res.json(orders);
});

export { addOrderItems, getOrderById, updateOrderToPaid, updateOrderToDelivered, getMyOrders, getOrders };
