import Link from 'next/link';

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 36"
                fill="none"
                className="h-8 w-8 text-primary"
                aria-hidden="true"
            >
                <path
                    d="M11 24.5h9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-[blink_1s_step-end_infinite]"
                />
                <path
                    d="m7 20 7-7-7-7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="bg-linear-to-r from-primary via-primary/70 to-primary bg-size-[200%_auto] bg-clip-text font-medium text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
                DevTools
            </span>
        </Link>
    );
}
