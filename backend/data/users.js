import bcrypt from 'bcryptjs';

const users = [
	{
		name: 'Admin User',
		email: 'admin@example.com',
		isAdmin: true,
		password: bcrypt.hashSync('123456', 10)
	},
	{
		name: 'user1',
		email: 'user1@example.com',
		password: bcrypt.hashSync('123456', 10)
	},
	{
		name: 'user2',
		email: 'user2@example.com',
		password: bcrypt.hashSync('123456', 10)
	},
	{
		name: 'user3',
		email: 'user3@example.com',
		password: bcrypt.hashSync('123456', 10)
	}
];

export default users;
