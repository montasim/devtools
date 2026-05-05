'use client';

import type { TabComponentProps } from '../../core/types/tool';
import { DomainListTab } from '../../shared/domain-checker';
import rawDomains from '../data/domains.json';
import precomputedStats from '../data/stats.json';

export default function SampleDataTab({ readOnly }: TabComponentProps) {
    return (
        <DomainListTab
            readOnly={readOnly}
            domains={rawDomains as string[]}
            stats={
                precomputedStats as {
                    total: number;
                    uniqueTlds: number;
                    tldDistribution: { name: string; value: number }[];
                    keywordClusters: { name: string; value: number }[];
                }
            }
            title="Free Email Provider Domains"
            downloadFilename="free-email-domains"
        />
    );
}
