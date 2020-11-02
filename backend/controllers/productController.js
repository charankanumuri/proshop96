import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc  : Fetch all products
// @access : Public
// @route : GET /api/products
const getProducts = asyncHandler(async (req, res) => {
	const pageSize = 10;
	const page = Number(req.query.pageNumber) || 1;
	const keyword = req.query.keyword
		? {
				name: {
					$regex: req.query.keyword,
					$options: 'i'
				}
			}
		: {};

	const count = await Product.countDocuments({ ...keyword });
	const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1));

	res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc  : Fetch single products
// @access : Public
// @route : GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (product) {
		res.json(product);
	} else {
		res.status(404);
		throw new Error('Product Not Found');
	}
});
// @desc  : Delete product by ID
// @access : Private/Admin
// @route : DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id);
	if (product) {
		await product.remove();
		res.json({ message: 'Product Removed' });
	} else {
		res.status(404);
		throw new Error('Product Not Found');
	}
});
// @desc  : Create a product
// @access : Private/Admin
// @route : POST /api/products
const createProduct = asyncHandler(async (req, res) => {
	const product = new Product({
		name: 'Sample Name',
		price: 0,
		user: req.user._id,
		brand: 'Sample Brand',
		category: 'Sample Category',
		image: '/images/sample.jpg',
		countInStock: 0,
		numReviews: 0,
		description: 'Sample Description'
	});
	const createdProduct = await product.save();
	res.status(201).json(createdProduct);
});
// @desc  : update a product
// @access : Private/Admin
// @route : PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
	const { name, price, description, image, brand, category, countInStock } = req.body;

	const product = await Product.findById(req.params.id);
	if (product) {
		product.name = name;
		product.price = price;
		product.description = description;
		product.image = image;
		product.brand = brand;
		product.category = category;
		product.countInStock = countInStock;
		const updatedProduct = await product.save();
		res.json(updatedProduct);
	} else {
		res.status(404);
		throw new Error('Product not found');
	}
});
// @desc  : create review for a product
// @access : Private
// @route : POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
	const { rating, comment } = req.body;

	const product = await Product.findById(req.params.id);
	if (product) {
		const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
		if (alreadyReviewed) {
			res.status(404);
			throw new Error('Product already reviewed');
		}
		const review = {
			name: req.user.name,
			comment,
			rating: Number(rating),
			user: req.user._id
		};
		product.reviews.push(review);
		product.numReviews = product.reviews.length;
		product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
		await product.save();
		res.status(201).json({ message: 'Review Added successfully!' });
	} else {
		res.status(404);
		throw new Error('Product not found');
	}
});

// @desc  : Get Top rated products
// @access : public
// @route : GET /api/products/top
const getTopProducts = asyncHandler(async (req, res) => {
	const products = await Product.find({}).sort({ rating: -1 }).limit(3);
	res.json(products);
});

export {
	getProducts,
	getProductById,
	deleteProduct,
	updateProduct,
	createProduct,
	createProductReview,
	getTopProducts
};
