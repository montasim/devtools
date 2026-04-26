import { generatePageMetadata } from '@/lib/seo/metadata';
import { buildWebSiteSchema, buildSoftwareAppSchema } from '@/lib/seo/structured-data';
import { AnimatedHomeContent } from '@/components/home/animated-home';

export const metadata = generatePageMetadata('home');

export default function HomePage() {
    return (
        <div className="flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([buildWebSiteSchema(), buildSoftwareAppSchema()]),
                }}
            />
            <AnimatedHomeContent />
        </div>
    );
}
