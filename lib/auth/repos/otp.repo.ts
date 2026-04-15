import { prisma } from '@/lib/prisma';

export interface CreateOTPData {
    email: string;
    codeHash: string;
    intent: 'REGISTER' | 'PASSWORD_RESET';
}

export async function createOTP(data: CreateOTPData) {
    // Calculate expiry: 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return await prisma.userOtp.create({
        data: {
            email: data.email,
            codeHash: data.codeHash,
            intent: data.intent,
            expiresAt,
        },
    });
}

export async function getValidOTP(email: string, intent: string, codeHash: string) {
    return await prisma.userOtp.findFirst({
        where: {
            email,
            intent,
            codeHash,
            used: false,
            expiresAt: {
                gte: new Date(),
            },
        },
    });
}

export async function markOTPUsed(otpId: string) {
    return await prisma.userOtp.update({
        where: { id: otpId },
        data: { used: true },
    });
}

export async function cleanupExpiredOTPs() {
    return await prisma.userOtp.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

export async function deleteOldOTPs(minutesOld: number = 60) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - minutesOld);

    return await prisma.userOtp.deleteMany({
        where: {
            createdAt: {
                lt: cutoff,
            },
        },
    });
}
