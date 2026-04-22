'use client';

import { lazy, type ComponentType } from 'react';
import { Pipette, Palette } from 'lucide-react';
import { ToolPage } from '@/features/tools/core/components/tool-page';
import { createSharedTabPlugin } from '@/features/tools/core/plugins/shared';
import { createSavedTabPlugin } from '@/features/tools/core/plugins/saved';
import { createHistoryTabPlugin } from '@/features/tools/core/plugins/history';
import { registerTool } from '@/features/tools/core/config/tool-registry';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { TabComponentProps } from '@/features/tools/core/types/tool';

const PickerTab = lazy(
    () => import('@/features/tools/color/tabs/picker-tab'),
) as unknown as ComponentType<TabComponentProps>;

const PaletteTab = lazy(
    () => import('@/features/tools/color/tabs/palette-tab'),
) as unknown as ComponentType<TabComponentProps>;

const COLOR_COLOR = 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300';

const toolMapping = {
    picker: {
        name: 'Color Picker',
        icon: Pipette,
        color: COLOR_COLOR,
    },
    palette: {
        name: 'Palette Generator',
        icon: Palette,
        color: COLOR_COLOR,
    },
};

const COLOR_TOOL = registerToolAndGet();

function registerToolAndGet() {
    const definition = {
        pageName: 'color',
        label: 'Color Picker',
        icon: Pipette,
        defaultTab: 'picker',
        mainTabs: [
            {
                id: 'picker',
                label: 'Picker',
                icon: Pipette,
                component: PickerTab,
                contentType: 'text' as const,
            },
            {
                id: 'palette',
                label: 'Palette',
                icon: Palette,
                component: PaletteTab,
                contentType: 'text' as const,
            },
        ],
        plugins: {
            saved: createSavedTabPlugin({
                pageName: 'color',
                queryKey: 'color-saved',
                toolMapping,
                tabMapping: { picker: 'picker', palette: 'palette' },
                storageKeyMapping: {
                    picker: STORAGE_KEYS.COLOR_PICKER_HEX,
                    palette: STORAGE_KEYS.COLOR_PALETTE_BASE,
                },
            }),
            shared: createSharedTabPlugin({
                pageName: 'color',
                queryKey: 'color-shared',
                toolMapping,
                tabMapping: { picker: 'picker', palette: 'palette' },
            }),
            history: createHistoryTabPlugin({
                pageName: 'color',
                storageKeyFilter: (key) => key.startsWith('color-'),
                toolMapping,
                tabMapping: { picker: 'picker', palette: 'palette' },
            }),
        },
    };

    registerTool(definition);
    return definition;
}

export default function ColorPage() {
    return <ToolPage definition={COLOR_TOOL} />;
}
