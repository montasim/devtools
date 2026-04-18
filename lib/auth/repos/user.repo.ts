import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export async function createUser(email: string, password: string, name: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return prisma.user.create({
        data: { email, passwordHash, name },
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function updateUserName(id: string, name: string) {
    return prisma.user.update({ where: { id }, data: { name } });
}

export async function updateUserPassword(id: string, password: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return prisma.user.update({ where: { id }, data: { passwordHash } });
}

export async function verifyUserEmail(id: string) {
    return prisma.user.update({ where: { id }, data: { emailVerified: new Date() } });
}
