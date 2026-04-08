import { config } from '@/config/config';
import { Terminal } from 'lucide-react';

export const Logo = () => (
    <div className="flex items-center gap-2">
        <Terminal className="h-8 w-8" />
        {config.app.title}
    </div>
);
