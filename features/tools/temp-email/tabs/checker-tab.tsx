'use client';

import { MailCheck, MailX, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { TabComponentProps } from '../../core/types/tool';
import { DomainCheckerTab } from '../../shared/domain-checker';
import type { CheckerTheme, DomainCheckResult } from '../../shared/domain-checker';
import { getDomainFromEmail } from '../utils/email-checker';
import rawDomains from '../data/domains.json';

const TEMP_EMAIL_THEME: CheckerTheme = {
    matchedBorder: 'border-destructive/30',
    matchedBg: 'bg-destructive/5',
    unmatchedBorder: 'border-green-500/30',
    unmatchedBg: 'bg-green-500/5',
    matchedIcon: MailX,
    matchedIconClass: 'text-destructive',
    unmatchedIcon: MailCheck,
    unmatchedIconClass: 'text-green-600 dark:text-green-400',
    matchedBadgeClass: 'bg-destructive/10 text-destructive',
    unmatchedBadgeClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    matchedTitle: 'Disposable / Temporary Email',
    unmatchedTitle: 'Not Disposable',
    matchedBadge: 'HIGH RISK',
    unmatchedBadge: 'LOW RISK',
    matchedWarningIcon: AlertTriangle,
    matchedWarningIconClass: 'text-amber-600 dark:text-amber-400',
    unmatchedInfoIcon: ShieldCheck,
    unmatchedInfoIconClass: 'text-green-600 dark:text-green-400',
    matchedWarningTitle: 'This domain is a known disposable email provider.',
    matchedWarningText:
        'Emails from this domain are typically used for temporary sign-ups and may indicate fraudulent activity. Consider blocking or flagging this domain in your registration flow.',
    unmatchedInfoTitle: 'This domain is not in the disposable email list.',
    unmatchedInfoText:
        'However, this does not guarantee it is a legitimate provider. Always use additional verification methods for critical operations.',
    matchedWarningBorder: 'border-amber-200 dark:border-amber-900',
    matchedWarningBg: 'bg-amber-50 dark:bg-amber-950/30',
    matchedWarningTextClass: 'text-amber-700 dark:text-amber-300',
    unmatchedInfoBorder: 'border-green-200 dark:border-green-900',
    unmatchedInfoBg: 'bg-green-50 dark:bg-green-950/30',
    unmatchedInfoTextClass: 'text-green-700 dark:text-green-300',
    dbLabel: 'known disposable email domains',
    emptyStateIcon: MailCheck,
    emptyStateTitle: 'Check if an email is disposable',
    emptyStateDesc: 'Enter an email address or domain name to check against our database',
    historyMatchedIcon: MailX,
    historyMatchedIconClass: 'text-destructive',
    historyUnmatchedIcon: MailCheck,
    historyUnmatchedIconClass: 'text-green-500',
    historyMatchedBadgeClass: 'text-destructive',
    historyUnmatchedBadgeClass: 'text-green-600 dark:text-green-400',
    historyMatchedLabel: 'Disposable',
    historyUnmatchedLabel: 'Safe',
};

function checkDisposableDomain(domain: string, domainSet: Set<string>): DomainCheckResult {
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
            checkDomain={checkDisposableDomain}
            getDomainFromEmail={getDomainFromEmail}
            theme={TEMP_EMAIL_THEME}
        />
    );
}
