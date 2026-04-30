'use client';

import { useState, useMemo, useCallback } from 'react';
import { ToolTabWrapper } from '../../core/components/tool-tab-wrapper';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Check,
    Eye,
    EyeOff,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Shield,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { evaluateStrength, calculateEntropy } from '../utils/password-operations';
import type { TabComponentProps } from '../../core/types/tool';

interface CheckResult {
    label: string;
    passed: boolean;
    message: string;
}

function runChecks(password: string): CheckResult[] {
    if (!password) return [];

    const checks: CheckResult[] = [];

    checks.push({
        label: 'Length ≥ 8 characters',
        passed: password.length >= 8,
        message:
            password.length >= 8
                ? `${password.length} characters`
                : `Only ${password.length} characters`,
    });

    checks.push({
        label: 'Length ≥ 12 characters',
        passed: password.length >= 12,
        message:
            password.length >= 12
                ? `${password.length} characters`
                : `Only ${password.length} characters`,
    });

    checks.push({
        label: 'Contains lowercase letters',
        passed: /[a-z]/.test(password),
        message: /[a-z]/.test(password) ? 'Found' : 'Missing',
    });

    checks.push({
        label: 'Contains uppercase letters',
        passed: /[A-Z]/.test(password),
        message: /[A-Z]/.test(password) ? 'Found' : 'Missing',
    });

    checks.push({
        label: 'Contains numbers',
        passed: /[0-9]/.test(password),
        message: /[0-9]/.test(password) ? 'Found' : 'Missing',
    });

    checks.push({
        label: 'Contains special characters',
        passed: /[^a-zA-Z0-9]/.test(password),
        message: /[^a-zA-Z0-9]/.test(password) ? 'Found' : 'Missing',
    });

    const uniqueRatio = new Set(password).size / password.length;
    checks.push({
        label: 'Good character variety',
        passed: uniqueRatio >= 0.6,
        message: `${Math.round(uniqueRatio * 100)}% unique characters`,
    });

    const hasSequential = /(.)\1{2,}/.test(password);
    checks.push({
        label: 'No long repeated sequences',
        passed: !hasSequential,
        message: hasSequential ? 'Found repeated characters' : 'No long repeats',
    });

    const commonPatterns = [
        /^123+$/,
        /^abc+$/i,
        /^qwerty/i,
        /^password/i,
        /^letmein$/i,
        /^welcome$/i,
        /^monkey$/i,
        /^dragon$/i,
        /^master$/i,
    ];
    const matchesPattern = commonPatterns.some((p) => p.test(password));
    checks.push({
        label: 'Not a common pattern',
        passed: !matchesPattern,
        message: matchesPattern ? 'Matches a known pattern' : 'No common patterns detected',
    });

    return checks;
}

function getStrengthIcon(score: number) {
    if (score <= 1) return <ShieldX className="h-5 w-5 text-destructive" />;
    if (score === 2) return <ShieldAlert className="h-5 w-5 text-amber-500" />;
    if (score === 3) return <Shield className="h-5 w-5 text-blue-500" />;
    return <ShieldCheck className="h-5 w-5 text-green-500" />;
}

function getStrengthColor(score: number): string {
    if (score <= 1) return 'bg-destructive';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-green-500';
}

export default function StrengthCheckerTab({ readOnly }: TabComponentProps) {
    const [input, setInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const strength = useMemo(() => evaluateStrength(input), [input]);
    const entropy = useMemo(() => calculateEntropy(input), [input]);
    const checks = useMemo(() => runChecks(input), [input]);

    const passedCount = checks.filter((c) => c.passed).length;
    const totalChecks = checks.length;

    const handleCopy = useCallback(async () => {
        if (!input) return;
        await copy(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [copy, input]);

    const hasInput = input.length > 0;

    return (
        <ToolTabWrapper>
            <div className="flex flex-col gap-4 py-4">
                <div className="relative">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter a password to check its strength..."
                        className="h-10 pr-20 font-mono text-sm"
                        spellCheck={false}
                        readOnly={readOnly}
                        autoComplete="off"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        {input && (
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        )}
                        {input && (
                            <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {hasInput ? (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-3 mb-3">
                                {getStrengthIcon(strength.score)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm font-semibold">
                                            {strength.label}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] font-mono tabular-nums"
                                        >
                                            Score: {strength.score + 1}/5
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                                                style={{
                                                    width: `${((strength.score + 1) / 5) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                <span>
                                    Entropy:{' '}
                                    <span className="font-mono font-medium">{entropy} bits</span>
                                </span>
                                <span>
                                    Length:{' '}
                                    <span className="font-mono font-medium">
                                        {input.length} chars
                                    </span>
                                </span>
                                <span>
                                    Unique:{' '}
                                    <span className="font-mono font-medium">
                                        {new Set(input).size}/{input.length}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Checks
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-mono tabular-nums ${
                                        passedCount === totalChecks
                                            ? 'text-green-600 dark:text-green-400'
                                            : ''
                                    }`}
                                >
                                    {passedCount}/{totalChecks} passed
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                                {checks.map((check, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-2.5 py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors"
                                    >
                                        {check.passed ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                                        ) : (
                                            <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium">
                                                {check.label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground ml-1.5">
                                                {check.message}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {strength.score <= 1 && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-700 dark:text-amber-300">
                                    <span className="font-medium">Weak password.</span> This
                                    password would be easily cracked. Use a longer password with a
                                    mix of character types.
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Check password strength
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Enter a password above to analyze its security
                        </p>
                    </div>
                )}
            </div>
        </ToolTabWrapper>
    );
}
