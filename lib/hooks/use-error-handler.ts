import { toast } from 'sonner';

export function handleApiError(message: string, error?: unknown) {
    console.error(message, error);
    const displayMessage = error instanceof Error ? error.message : message;
    toast.error(displayMessage);
}

export function handleFormError(error: unknown) {
    console.error(error);
    if (error instanceof Error) {
        toast.error(error.message);
    } else {
        toast.error('An unexpected error occurred');
    }
}
