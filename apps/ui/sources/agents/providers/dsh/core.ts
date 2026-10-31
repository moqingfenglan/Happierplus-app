import type { AgentCoreConfig } from '@/agents/registry/registryCore';
import { buildCatalogProviderCliUiConfig } from '@/agents/providers/shared/buildCatalogProviderCliUiConfig';
import { buildAgentConnectedServicesUiConfig } from '@/agents/registry/buildAgentConnectedServicesUiConfig';
import { buildAgentResumeUiConfig } from '@/agents/registry/buildAgentResumeUiConfig';
import { buildAgentSessionStorageUiConfig } from '@/agents/registry/buildAgentSessionStorageUiConfig';
import { buildAgentToolsUiConfig } from '@/agents/registry/buildAgentToolsUiConfig';
import { getAgentModelConfig, getAgentSessionModesKind } from '@happier-dev/agents';

export const DSH_CORE: AgentCoreConfig = {
    id: 'dsh',
    displayNameKey: 'agentInput.agent.dsh',
    subtitleKey: 'profiles.aiBackend.dshSubtitleExperimental',
    permissionModeI18nPrefix: 'agentInput.codexPermissionMode',
    availability: { experimental: true },
    connectedServices: buildAgentConnectedServicesUiConfig({ agentId: 'dsh' }),
    uiConnectedService: { serviceId: null, label: 'DeepSeek Harness', connectRoute: null },
    flavorAliases: ['deepseek-harness', 'deepseekHarness'],
    cli: buildCatalogProviderCliUiConfig('dsh'),
    permissions: { modeGroup: 'codexLike', promptProtocol: 'codexDecision' },
    sessionModes: { kind: getAgentSessionModesKind('dsh') },
    model: getAgentModelConfig('dsh'),
    resume: buildAgentResumeUiConfig({
        agentId: 'dsh',
        uiVendorResumeIdLabelKey: 'sessionInfo.dshSessionId',
        uiVendorResumeIdCopiedKey: 'sessionInfo.dshSessionIdCopied',
    }),
    toolRendering: { hideUnknownToolsByDefault: false },
    tools: buildAgentToolsUiConfig({ agentId: 'dsh' }),
    sessionStorage: buildAgentSessionStorageUiConfig({ agentId: 'dsh' }),
    ui: {
        agentPickerIconName: 'hardware-chip-outline',
        cliGlyphScale: 1,
        profileCompatibilityGlyphScale: 1,
    },
};
