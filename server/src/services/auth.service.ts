import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

export class AuthService {
    static async register(email: string, passwordRaw: string) {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordRaw, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        // Exclude password from return
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async login(email: string, passwordRaw: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(passwordRaw, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
