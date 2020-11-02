import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc  : Auth User and get Token
// @access : Public
// @route : POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id)
		});
	} else {
		res.status(401);
		throw new Error('Email or Password Not Valid');
	}
});

// @desc  : Register a new User
// @access : Public
// @route : POST /api/users
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error('User already Exists');
	}

	const user = await User.create({
		name,
		email,
		password
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id)
		});
	} else {
		res.status(400);
		throw new Error('Invalid User Data');
	}
});

// @desc  : get user profile
// @access : Private
// @route : GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);
	if (user) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin
		});
	} else {
		res.status(404);
		throw new Error('User Not Found');
	}
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;
		if (req.body.password) {
			user.password = req.body.password;
		}

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			token: generateToken(updatedUser._id)
		});
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});

// @desc  : Get user profile
// @access : Private/admin
// @route : GET /api/users/profile
const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

// @desc  : Delete user
// @access : Private/admin
// @route : DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	if (user) {
		await user.remove();
		res.json({ message: 'User removed' });
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});

// @desc  : Get user by ID
// @access : Private/admin
// @route : GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');
	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});

// @desc  : update user
// @access : Private/Admimn
// @route : PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);
	user.name = req.body.name || user.name;
	user.email = req.body.email || user.email;
	user.isAdmin = req.body.isAdmin;
	const updatedUsder = await user.save();

	if (user) {
		res.json({
			_id: updatedUsder._id,
			name: updatedUsder.name,
			email: updatedUsder.email,
			isAdmin: updatedUsder.isAdmin
		});
	} else {
		res.status(404);
		throw new Error('User Not Found');
	}
});

export { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getUserById, updateUser };
