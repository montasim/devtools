'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
    GitBranch,
    Copy,
    RefreshCw,
    Sparkles,
    Wrench,
    Flame,
    FileText,
    CheckCircle,
    Settings,
    Zap,
    Palette,
    Cpu,
    Slash,
    Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import { useClipboard } from '@/lib/hooks/use-clipboard';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

const ISSUE_TYPES = [
    { value: 'none', label: 'None', color: 'bg-slate-500', icon: Slash },
    { value: 'feature', label: 'Feature', color: 'bg-green-500', icon: Sparkles },
    { value: 'fix', label: 'Bug Fix', color: 'bg-red-500', icon: Wrench },
    { value: 'hotfix', label: 'Hotfix', color: 'bg-orange-500', icon: Flame },
    { value: 'refactor', label: 'Refactor', color: 'bg-blue-500', icon: RefreshCw },
    { value: 'docs', label: 'Docs', color: 'bg-purple-500', icon: FileText },
    { value: 'test', label: 'Test', color: 'bg-yellow-500', icon: CheckCircle },
    { value: 'chore', label: 'Chore', color: 'bg-gray-500', icon: Settings },
    { value: 'perf', label: 'Perf', color: 'bg-pink-500', icon: Zap },
    { value: 'style', label: 'Style', color: 'bg-indigo-500', icon: Palette },
    { value: 'ci', label: 'CI/CD', color: 'bg-cyan-500', icon: Cpu },
];

const EXAMPLES = [
    { branch: 'feature/123/add-user-auth', label: 'Feature with issue ID' },
    { branch: 'fix/fix-login-bug', label: 'Bug fix without ID' },
    { branch: 'docs/JIRA-456/update-api-docs', label: 'Docs with JIRA ID' },
];

export default function GitBranchGeneratorPage() {
    const [issueType, setIssueType] = useLocalStorage('git-branch-type', 'none');
    const [issueId, setIssueId] = useState('');
    const [description, setDescription] = useState('');
    const [generatedBranch, setGeneratedBranch] = useLocalStorage(
        STORAGE_KEYS.GIT_BRANCH_LAST_GENERATED,
        '',
    );
    const [copied, setCopied] = useState(false);
    const { copy } = useClipboard();

    const generateBranchName = useCallback(() => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        const cleanedDescription = description
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);

        let branchName = '';
        if (issueType !== 'none') {
            branchName = `${issueType}`;
        }
        if (issueId.trim()) {
            branchName += (branchName ? '/' : '') + issueId.trim();
        }
        branchName += (branchName ? '/' : '') + cleanedDescription;

        setGeneratedBranch(branchName);
    }, [description, issueType, issueId, setGeneratedBranch]);

    const handleCopy = () => {
        if (!generatedBranch) {
            toast.error('No branch name to copy');
            return;
        }
        copy(generatedBranch);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetForm = () => {
        setIssueType('none');
        setIssueId('');
        setDescription('');
        setGeneratedBranch('');
    };

    return (
        <div className="mx-auto py-4">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    <GitBranch className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Git Branch Name Generator</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate consistent and well-formatted git branch names
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <Label className="mb-3 block text-sm font-semibold">Issue Type</Label>
                    <div className="flex flex-wrap gap-2">
                        {ISSUE_TYPES.map((type) => {
                            const Icon = type.icon;
                            const active = issueType === type.value;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => setIssueType(type.value)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        active
                                            ? `${type.color} text-white shadow-md`
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <Label htmlFor="issue-id" className="mb-2 block text-sm font-semibold">
                        Issue ID{' '}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                        id="issue-id"
                        type="text"
                        value={issueId}
                        onChange={(e) => setIssueId(e.target.value)}
                        placeholder="e.g., 123, JIRA-123"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Ticket number or issue identifier
                    </p>
                </div>

                <div>
                    <Label htmlFor="description" className="mb-2 block text-sm font-semibold">
                        Description
                    </Label>
                    <Input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Add user authentication"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') generateBranchName();
                        }}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Brief description of the changes
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button onClick={generateBranchName} className="gap-2">
                        <GitBranch className="h-4 w-4" />
                        Generate
                    </Button>
                    <Button onClick={resetForm} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {generatedBranch && (
                    <div className="rounded-lg border bg-primary/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <Label className="text-sm font-semibold">Generated Branch Name</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="gap-1.5"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <div className="rounded-md border bg-background p-3">
                            <code className="break-all font-mono text-sm">{generatedBranch}</code>
                        </div>
                    </div>
                )}

                <div className="rounded-lg border p-4">
                    <h2 className="mb-3 text-sm font-semibold">Examples</h2>
                    <div className="space-y-2">
                        {EXAMPLES.map((ex) => (
                            <div key={ex.branch} className="flex items-center gap-3 text-sm">
                                <code className="rounded bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                                    {ex.branch}
                                </code>
                                <span className="text-muted-foreground">{ex.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
