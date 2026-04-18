import { prisma } from '@/lib/db/prisma';

export async function createOtp(data: {
    email: string;
    codeHash: string;
    intent: string;
    expiresAt: Date;
    userId?: string;
}) {
    return prisma.userOtp.create({ data });
}

export async function findValidOtp(
    email: string,
    intent: string,
    code: string,
    verifyFn: (code: string, hash: string) => boolean,
) {
    const otps = await prisma.userOtp.findMany({
        where: {
            email,
            intent,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    for (const otp of otps) {
        if (verifyFn(code, otp.codeHash)) {
            return otp;
        }
    }
    return null;
}

export async function markOtpUsed(id: string) {
    return prisma.userOtp.update({ where: { id }, data: { used: true } });
}

export async function invalidateOtps(email: string, intent: string) {
    return prisma.userOtp.updateMany({
        where: { email, intent, used: false },
        data: { used: true },
    });
}
