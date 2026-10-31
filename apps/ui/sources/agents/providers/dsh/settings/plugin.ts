import { createNoopProviderSettingsPlugin } from '@/agents/providers/shared/createNoopProviderSettingsPlugin';

export const DSH_PROVIDER_SETTINGS_PLUGIN = createNoopProviderSettingsPlugin({
    providerId: 'dsh',
    title: { key: 'settingsProviders.plugins.dsh.title' },
    icon: { ionName: 'hardware-chip-outline', color: { kind: 'theme', token: 'purple' } },
});
