'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/constants';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ISSUE_TYPES = [
    { value: 'none', label: 'None', color: 'bg-slate-500', icon: Slash },
    { value: 'feature', label: 'Feature', color: 'bg-green-500', icon: Sparkles },
    { value: 'fix', label: 'Bug Fix', color: 'bg-red-500', icon: Wrench },
    { value: 'hotfix', label: 'Hotfix', color: 'bg-orange-500', icon: Flame },
    { value: 'refactor', label: 'Refactor', color: 'bg-blue-500', icon: RefreshCw },
    { value: 'docs', label: 'Documentation', color: 'bg-purple-500', icon: FileText },
    { value: 'test', label: 'Test', color: 'bg-yellow-500', icon: CheckCircle },
    { value: 'chore', label: 'Chore', color: 'bg-gray-500', icon: Settings },
    { value: 'perf', label: 'Performance', color: 'bg-pink-500', icon: Zap },
    { value: 'style', label: 'Style', color: 'bg-indigo-500', icon: Palette },
    { value: 'ci', label: 'CI/CD', color: 'bg-cyan-500', icon: Cpu },
];

export default function GitBranchGeneratorPage() {
    const [issueType, setIssueType] = useState('none');
    const [issueId, setIssueId] = useState('');
    const [description, setDescription] = useState('');
    const [generatedBranch, setGeneratedBranch] = useState(() => {
        // Load saved branch name on initial render
        try {
            return localStorage.getItem(STORAGE_KEYS.GIT_BRANCH_LAST_GENERATED) || '';
        } catch (error) {
            console.error('Failed to load saved branch name:', error);
            return '';
        }
    });

    const generateBranchName = () => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        // Clean and format the description
        const cleanedDescription = description
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .substring(0, 50); // Limit to 50 characters

        let branchName = '';

        // Only add issue type prefix if it's not "none"
        if (issueType !== 'none') {
            branchName = `${issueType}`;
        }

        if (issueId.trim()) {
            branchName += (branchName ? '/' : '') + issueId.trim();
        }

        branchName += (branchName ? '/' : '') + cleanedDescription;

        setGeneratedBranch(branchName);

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEYS.GIT_BRANCH_LAST_GENERATED, branchName);
        } catch (error) {
            console.error('Failed to save branch name:', error);
        }
    };

    const copyToClipboard = () => {
        if (!generatedBranch) {
            toast.error('No branch name to copy');
            return;
        }

        navigator.clipboard.writeText(generatedBranch);
        toast.success('Branch name copied to clipboard');
    };

    const resetForm = () => {
        setIssueType('none');
        setIssueId('');
        setDescription('');
        setGeneratedBranch('');

        // Clear from localStorage
        try {
            localStorage.removeItem(STORAGE_KEYS.GIT_BRANCH_LAST_GENERATED);
        } catch (error) {
            console.error('Failed to clear saved branch name:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            {/* Header */}
            <div className="mx-auto border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <GitBranch className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Git Branch Name Generator
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Generate consistent and well-formatted git branch names
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto py-4">
                <div className="mx-auto">
                    <div className="py-4">
                        {/* Issue Type */}
                        <div className="mb-6">
                            <Label
                                htmlFor="issue-type"
                                className="text-base font-semibold mb-3 block"
                            >
                                Issue Type
                            </Label>
                            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
                                {ISSUE_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.value}
                                            onClick={() => setIssueType(type.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                                                issueType === type.value
                                                    ? `${type.color} text-white shadow-md`
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Issue ID */}
                        <div className="mb-6">
                            <Label
                                htmlFor="issue-id"
                                className="text-base font-semibold mb-2 block"
                            >
                                Issue ID{' '}
                                <span className="text-sm font-normal text-gray-500">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                id="issue-id"
                                type="text"
                                value={issueId}
                                onChange={(e) => setIssueId(e.target.value)}
                                placeholder="e.g., 123, JIRA-123"
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ticket number or issue identifier
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <Label
                                htmlFor="description"
                                className="text-base font-semibold mb-2 block"
                            >
                                Description
                            </Label>
                            <Input
                                id="description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Add user authentication"
                                className="w-full"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        generateBranchName();
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Brief description of the changes
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <Button onClick={generateBranchName} className="gap-2" size="lg">
                                <GitBranch className="w-4 h-4" />
                                Generate Branch Name
                            </Button>
                            <Button
                                onClick={resetForm}
                                variant="outline"
                                className="gap-2"
                                size="lg"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </Button>
                        </div>

                        {/* Generated Branch Name */}
                        {generatedBranch && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-base font-semibold text-green-900 dark:text-green-100">
                                        Generated Branch Name
                                    </Label>
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </Button>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                    <code className="text-sm sm:text-base font-mono text-green-700 dark:text-green-300 break-all">
                                        {generatedBranch}
                                    </code>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                    Press Enter in the description field or click Generate to create
                                    the branch name
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Examples */}
                    <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Examples
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                                    feature/123/add-user-auth
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Feature with issue ID
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                                    fix/fix-login-bug
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Bug fix without ID
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="font-mono bg-purple-600 dark:bg-purple-400 text-white px-2 py-1 rounded">
                                    docs/JIRA-456-update-api-docs
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Documentation with JIRA ID
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
