import {
    argon2id as argon2idHash,
    argon2i as argon2iHash,
    argon2d as argon2dHash,
    argon2Verify,
    bcrypt as bcryptHash,
    bcryptVerify,
} from 'hash-wasm';

export type PasswordAlgorithm = 'bcrypt' | 'argon2id' | 'argon2i' | 'argon2d';

export interface AlgorithmOption {
    value: PasswordAlgorithm;
    label: string;
    description: string;
}

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
    { value: 'bcrypt', label: 'bcrypt', description: 'Cost factor 4-12, industry standard' },
    { value: 'argon2id', label: 'Argon2id', description: 'Recommended for passwords' },
    { value: 'argon2i', label: 'Argon2i', description: 'Side-channel resistant' },
    { value: 'argon2d', label: 'Argon2d', description: 'GPU-resistant' },
];

export interface BcryptOptions {
    rounds: number;
}

export interface Argon2Options {
    iterations: number;
    memorySize: number;
    parallelism: number;
    hashLength: number;
}

export const DEFAULT_BCRYPT_OPTIONS: BcryptOptions = { rounds: 10 };
export const DEFAULT_ARGON2_OPTIONS: Argon2Options = {
    iterations: 3,
    memorySize: 65536,
    parallelism: 4,
    hashLength: 32,
};

export const BCRYPT_ROUNDS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export interface HashResult {
    algorithm: PasswordAlgorithm;
    hash: string;
    timeMs: number;
}

function randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

export async function hashPassword(
    password: string,
    algorithm: PasswordAlgorithm,
    bcryptOpts: BcryptOptions = DEFAULT_BCRYPT_OPTIONS,
    argon2Opts: Argon2Options = DEFAULT_ARGON2_OPTIONS,
): Promise<HashResult> {
    const start = performance.now();
    let hash: string;

    if (algorithm === 'bcrypt') {
        hash = await bcryptHash({
            password,
            salt: randomBytes(16),
            costFactor: bcryptOpts.rounds,
            outputType: 'encoded',
        });
    } else {
        const opts = {
            password,
            salt: randomBytes(16),
            iterations: argon2Opts.iterations,
            parallelism: argon2Opts.parallelism,
            memorySize: argon2Opts.memorySize,
            hashLength: argon2Opts.hashLength,
            outputType: 'encoded' as const,
        };

        switch (algorithm) {
            case 'argon2id':
                hash = await argon2idHash(opts);
                break;
            case 'argon2i':
                hash = await argon2iHash(opts);
                break;
            case 'argon2d':
                hash = await argon2dHash(opts);
                break;
        }
    }

    const timeMs = Math.round(performance.now() - start);
    return { algorithm, hash, timeMs };
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<{ match: boolean; timeMs: number }> {
    const start = performance.now();
    let match: boolean;

    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        match = await bcryptVerify({ password, hash });
    } else if (hash.startsWith('$argon2')) {
        match = await argon2Verify({ password, hash });
    } else {
        throw new Error(
            'Unsupported hash format. Expected bcrypt ($2a$/$2b$/$2y$) or Argon2 ($argon2...)',
        );
    }

    const timeMs = Math.round(performance.now() - start);
    return { match, timeMs };
}

export function detectHashType(hash: string): PasswordAlgorithm | null {
    if (/^\$2[aby]\$/.test(hash)) return 'bcrypt';
    if (hash.startsWith('$argon2id$')) return 'argon2id';
    if (hash.startsWith('$argon2i$')) return 'argon2i';
    if (hash.startsWith('$argon2d$')) return 'argon2d';
    return null;
}
