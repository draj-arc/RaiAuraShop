
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users as usersTable } from '../../shared/schema';

// In-memory user store
const users: any[] = [];

export async function getUserByEmail(email: string) {
	return users.find(u => u.email === email) || null;
}

export async function createUser(data: any) {
	// Check if user already exists
	if (users.find(u => u.email === data.email)) {
		throw new Error('User already exists');
	}
	// Hash password
	const hashedPassword = await bcrypt.hash(data.password, 10);
	const user = {
		id: uuidv4(),
		username: data.username,
		email: data.email,
		password: hashedPassword,
		isAdmin: false,
		createdAt: new Date().toISOString(),
	};
	users.push(user);
	// Never return password
	const { password, ...userWithoutPassword } = user;
	return userWithoutPassword;
}
