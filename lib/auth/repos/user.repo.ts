import { prisma } from '@/lib/prisma';

export interface CreateUserData {
    email: string;
    passwordHash: string;
    name: string;
}

export async function createUser(data: CreateUserData) {
    return await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
            emailVerified: new Date(), // Mark as verified after OTP verification
        },
    });
}

export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
}

export async function markEmailVerified(userId: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
    });
}

export async function userExists(email: string): Promise<boolean> {
    const user = await getUserByEmail(email);
    return user !== null;
}
