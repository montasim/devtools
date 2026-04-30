let domainSet: Set<string> | null = null;

export async function loadDomains(): Promise<Set<string>> {
    if (domainSet) return domainSet;
    const data = await import('../data/domains.json');
    domainSet = new Set(data.default as string[]);
    return domainSet;
}

export function getDomainFromEmail(email: string): string {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length < 2) return '';
    return parts[parts.length - 1];
}

export function checkDomain(
    domain: string,
    domains: Set<string>,
): { isFree: boolean; domain: string } {
    const d = domain.trim().toLowerCase();
    if (domains.has(d)) return { isFree: true, domain: d };
    const parts = d.split('.');
    for (let i = 1; i < parts.length; i++) {
        const sub = parts.slice(i).join('.');
        if (domains.has(sub)) return { isFree: true, domain: sub };
    }
    return { isFree: false, domain: d };
}
