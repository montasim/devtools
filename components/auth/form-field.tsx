import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';

interface FormFieldProps {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password';
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    pattern?: string;
    className?: string;
}

export function FormField({
    id,
    label,
    type,
    value,
    onChange,
    placeholder,
    required = false,
    maxLength,
    pattern,
    className,
}: FormFieldProps) {
    const baseClassName = 'mt-2 placeholder:text-gray-400 dark:placeholder:text-gray-500';

    const inputProps = {
        id,
        required,
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        placeholder,
        className: className || baseClassName,
        ...(maxLength !== undefined && { maxLength }),
        ...(pattern !== undefined && { pattern }),
    };

    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            {type === 'password' ? (
                <PasswordInput {...inputProps} />
            ) : (
                <Input type={type} {...inputProps} />
            )}
        </div>
    );
}
