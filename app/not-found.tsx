import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-24">
            <h1 className="text-4xl font-bold sm:text-6xl">404</h1>
            <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
            <Link href="/" className="mt-6 text-primary underline hover:no-underline">
                Go back home
            </Link>
        </div>
    );
}
