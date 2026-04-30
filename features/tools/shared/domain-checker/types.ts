import type { LucideIcon } from 'lucide-react';

export interface DomainCheckResult {
    matched: boolean;
    domain: string;
}

export interface CheckerTheme {
    matchedBorder: string;
    matchedBg: string;
    unmatchedBorder: string;
    unmatchedBg: string;
    matchedIcon: LucideIcon;
    matchedIconClass: string;
    unmatchedIcon: LucideIcon;
    unmatchedIconClass: string;
    matchedBadgeClass: string;
    unmatchedBadgeClass: string;
    matchedTitle: string;
    unmatchedTitle: string;
    matchedBadge: string;
    unmatchedBadge: string;
    matchedWarningIcon: LucideIcon;
    matchedWarningIconClass: string;
    unmatchedInfoIcon: LucideIcon;
    unmatchedInfoIconClass: string;
    matchedWarningTitle: string;
    matchedWarningText: string;
    unmatchedInfoTitle: string;
    unmatchedInfoText: string;
    matchedWarningBorder: string;
    matchedWarningBg: string;
    matchedWarningTextClass: string;
    unmatchedInfoBorder: string;
    unmatchedInfoBg: string;
    unmatchedInfoTextClass: string;
    dbLabel: string;
    emptyStateIcon: LucideIcon;
    emptyStateTitle: string;
    emptyStateDesc: string;
    historyMatchedIcon: LucideIcon;
    historyMatchedIconClass: string;
    historyUnmatchedIcon: LucideIcon;
    historyUnmatchedIconClass: string;
    historyMatchedBadgeClass: string;
    historyUnmatchedBadgeClass: string;
    historyMatchedLabel: string;
    historyUnmatchedLabel: string;
}

export interface DomainListStats {
    total: number;
    uniqueTlds: number;
    tldDistribution: { name: string; value: number }[];
    keywordClusters: { name: string; value: number }[];
}

export type DomainCheckFn = (
    domain: string,
    domainSet: Set<string>,
) => DomainCheckResult;

export type GetDomainFn = (input: string) => string;

export interface DomainCheckerProps {
    readOnly?: boolean;
    domains: string[];
    checkDomain: DomainCheckFn;
    getDomainFromEmail: GetDomainFn;
    theme: CheckerTheme;
}

export interface DomainListProps {
    readOnly?: boolean;
    domains: string[];
    stats: DomainListStats;
    title: string;
}
