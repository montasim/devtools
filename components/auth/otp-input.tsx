'use client';

import { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const digits = value.padEnd(length, ' ').split('').slice(0, length);

    const setRef = useCallback(
        (index: number) => (el: HTMLInputElement | null) => {
            inputs.current[index] = el;
        },
        [],
    );

    function focusInput(index: number) {
        const clamped = Math.max(0, Math.min(index, length - 1));
        inputs.current[clamped]?.focus();
        setFocusedIndex(clamped);
    }

    function handleChange(index: number, char: string) {
        const digit = char.replace(/\D/g, '').slice(-1);
        if (!digit && char !== '') return;

        const newDigits = [...digits];
        newDigits[index] = digit || ' ';

        const newValue = newDigits.join('').trimEnd();
        onChange(newValue);

        if (digit) {
            focusInput(index + 1);
        }
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace') {
            if (digits[index] === ' ' || digits[index] === '') {
                focusInput(index - 1);
            } else {
                const newDigits = [...digits];
                newDigits[index] = ' ';
                onChange(newDigits.join('').trimEnd());
            }
        } else if (e.key === 'ArrowLeft') {
            focusInput(index - 1);
        } else if (e.key === 'ArrowRight') {
            focusInput(index + 1);
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pasted) {
            onChange(pasted);
            focusInput(Math.min(pasted.length, length - 1));
        }
    }

    return (
        <div className="flex gap-2">
            {Array.from({ length }, (_, i) => {
                const isFilled = digits[i] !== ' ' && digits[i] !== '';
                const isFocused = focusedIndex === i;
                return (
                    <Input
                        key={i}
                        ref={setRef(i)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={isFilled ? digits[i] : ''}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={() => setFocusedIndex(i)}
                        onPaste={handlePaste}
                        className={`h-9 w-9 text-center text-lg transition-colors ${
                            isFocused
                                ? 'border-primary ring-1 ring-primary'
                                : isFilled
                                  ? 'border-primary/50'
                                  : ''
                        }`}
                    />
                );
            })}
        </div>
    );
}
