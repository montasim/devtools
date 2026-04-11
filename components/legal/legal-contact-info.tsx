import { Mail, MapPin, Globe } from 'lucide-react';

export interface LegalContactInfoProps {
    email?: string;
    website?: string;
    address?: string;
    companyName?: string;
}

export function LegalContactInfo({
    email = 'legal@devtools.com',
    website = 'https://devtools.com',
    address,
    companyName = 'DevTools',
}: LegalContactInfoProps) {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Contact Information
            </h3>
            <div className="space-y-3">
                {email && (
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Email
                            </p>
                            <a
                                href={`mailto:${email}`}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                            >
                                {email}
                            </a>
                        </div>
                    </div>
                )}
                {website && (
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Website
                            </p>
                            <a
                                href={website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                            >
                                {website}
                            </a>
                        </div>
                    </div>
                )}
                {address && (
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Address
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{address}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-gray-100">{companyName}</strong>
                </p>
            </div>
        </div>
    );
}
