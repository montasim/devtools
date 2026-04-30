'use client';

import { MailCheck, MailQuestion, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { DomainCheckerTab } from '../../shared/domain-checker';
import type { CheckerTheme, DomainCheckResult } from '../../shared/domain-checker';
import { getDomainFromEmail } from '../utils/email-checker';
import rawDomains from '../data/domains.json';

const FREE_EMAIL_THEME: CheckerTheme = {
    matchedBorder: 'border-amber-500/30',
    matchedBg: 'bg-amber-500/5',
    unmatchedBorder: 'border-green-500/30',
    unmatchedBg: 'bg-green-500/5',
    matchedIcon: MailQuestion,
    matchedIconClass: 'text-amber-600 dark:text-amber-400',
    unmatchedIcon: MailCheck,
    unmatchedIconClass: 'text-green-600 dark:text-green-400',
    matchedBadgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    unmatchedBadgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    matchedTitle: 'Free Email Provider',
    unmatchedTitle: 'Not a Free Provider',
    matchedBadge: 'PERSONAL',
    unmatchedBadge: 'BUSINESS',
    matchedWarningIcon: AlertTriangle,
    matchedWarningIconClass: 'text-amber-600 dark:text-amber-400',
    unmatchedInfoIcon: ShieldAlert,
    unmatchedInfoIconClass: 'text-green-600 dark:text-green-400',
    matchedWarningTitle: 'This domain belongs to a free email provider.',
    matchedWarningText:
        'Emails from this domain are freely available to anyone. For business sign-ups or user verification, you may want to require a corporate or paid email address.',
    unmatchedInfoTitle: 'This domain is not in the free email provider list.',
    unmatchedInfoText:
        'It may be a corporate, custom domain, or paid email service. Suitable for business registration and verification flows.',
    matchedWarningBorder: 'border-amber-200 dark:border-amber-900',
    matchedWarningBg: 'bg-amber-50 dark:bg-amber-950/30',
    matchedWarningTextClass: 'text-amber-700 dark:text-amber-300',
    unmatchedInfoBorder: 'border-green-200 dark:border-green-900',
    unmatchedInfoBg: 'bg-green-50 dark:bg-green-950/30',
    unmatchedInfoTextClass: 'text-green-700 dark:text-green-300',
    dbLabel: 'known free email provider domains',
    emptyStateIcon: MailQuestion,
    emptyStateTitle: 'Check if an email uses a free provider',
    emptyStateDesc: 'Enter an email address or domain name to check against our database',
    historyMatchedIcon: MailQuestion,
    historyMatchedIconClass: 'text-amber-500',
    historyUnmatchedIcon: MailCheck,
    historyUnmatchedIconClass: 'text-green-500',
    historyMatchedBadgeClass: 'text-amber-600 dark:text-amber-400',
    historyUnmatchedBadgeClass: 'text-green-600 dark:text-green-400',
    historyMatchedLabel: 'Free',
    historyUnmatchedLabel: 'Business',
};

function checkFreeEmailDomain(
    domain: string,
    domainSet: Set<string>,
): DomainCheckResult {
    const d = domain.trim().toLowerCase();
    if (domainSet.has(d)) return { matched: true, domain: d };
    const parts = d.split('.');
    for (let i = 1; i < parts.length; i++) {
        const sub = parts.slice(i).join('.');
        if (domainSet.has(sub)) return { matched: true, domain: sub };
    }
    return { matched: false, domain: d };
}

export default function CheckerTab({ readOnly }: TabComponentProps) {
    return (
        <DomainCheckerTab
            readOnly={readOnly}
            domains={rawDomains as string[]}
            checkDomain={checkFreeEmailDomain}
            getDomainFromEmail={getDomainFromEmail}
            theme={FREE_EMAIL_THEME}
        />
    );
}
