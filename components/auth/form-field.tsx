import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from './password-input';

interface FormFieldProps {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password';
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
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
    minLength,
}: FormFieldProps) {
    const inputProps = {
        id,
        required,
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        placeholder,
        className: '',
        ...(maxLength !== undefined && { maxLength }),
        ...(minLength !== undefined && { minLength }),
    };

    return (
        <div>
            <Label className="mb-2" htmlFor={id}>
                {label}
            </Label>
            {type === 'password' ? (
                <PasswordInput {...inputProps} />
            ) : (
                <Input type={type} {...inputProps} />
            )}
        </div>
    );
}
