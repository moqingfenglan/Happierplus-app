import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { RoundButton } from '@/components/ui/buttons/RoundButton';
import { Text } from '@/components/ui/text/Text';
import { t } from '@/text';

import {
    HARNESSLINK_APP_VERSION,
    compareVersions,
    formatVersion,
    parseReleaseVersion,
    type ParsedVersion,
} from './appUpdateVersion';

const RELEASE_API = 'https://api.github.com/repos/moqingfenglan/Happierplus-app/releases/latest';
const APK_NAME = 'app-release.apk';

type Release = Readonly<{ version: ParsedVersion; url: string }>;

type Phase = 'idle' | 'checking' | 'latest' | 'available' | 'downloading' | 'ready' | 'error';

function currentVersion(): ParsedVersion {
    return parseReleaseVersion(HARNESSLINK_APP_VERSION) ?? [0, 0, 0];
}

async function fetchLatestRelease(): Promise<Release | null> {
    const response = await fetch(RELEASE_API, {
        headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'HarnessLink',
        },
    });
    if (!response.ok) throw new Error(`GitHub release check failed: ${response.status}`);
    const body = await response.json() as {
        tag_name?: unknown;
        assets?: Array<{ name?: unknown; browser_download_url?: unknown }>;
    };
    const version = parseReleaseVersion(String(body.tag_name ?? ''));
    if (!version) throw new Error('Release tag is not a version');
    if (compareVersions(version, currentVersion()) <= 0) return null;
    const asset = (body.assets ?? []).find((candidate) => candidate.name === APK_NAME)
        ?? (body.assets ?? []).find((candidate) => typeof candidate.name === 'string' && candidate.name.endsWith('.apk'));
    if (!asset || typeof asset.browser_download_url !== 'string') throw new Error('Release has no APK asset');
    return { version, url: asset.browser_download_url };
}

export const AppUpdateCard = React.memo(function AppUpdateCard() {
    const { theme } = useUnistyles();
    const [phase, setPhase] = React.useState<Phase>('idle');
    const [release, setRelease] = React.useState<Release | null>(null);
    const [progress, setProgress] = React.useState(0);
    const [apkUri, setApkUri] = React.useState<string | null>(null);

    const check = React.useCallback(async () => {
        setPhase('checking');
        try {
            const next = await fetchLatestRelease();
            setRelease(next);
            setPhase(next ? 'available' : 'latest');
        } catch {
            setPhase('error');
        }
    }, []);

    React.useEffect(() => {
        if (Platform.OS !== 'android') return;
        void check();
    }, [check]);

    const download = React.useCallback(async () => {
        if (!release) return;
        setPhase('downloading');
        setProgress(0);
        try {
            const target = `${FileSystem.cacheDirectory ?? ''}harnesslink-${formatVersion(release.version)}.apk`;
            const task = FileSystem.createDownloadResumable(
                release.url,
                target,
                {},
                (event) => {
                    const total = event.totalBytesExpectedToWrite;
                    if (total > 0) setProgress(Math.floor((event.totalBytesWritten / total) * 100));
                },
            );
            const result = await task.downloadAsync();
            if (!result?.uri) throw new Error('Download produced no file');
            setApkUri(result.uri);
            setPhase('ready');
        } catch {
            setPhase('error');
        }
    }, [release]);

    const install = React.useCallback(async () => {
        if (!apkUri) return;
        try {
            const contentUri = await FileSystem.getContentUriAsync(apkUri);
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1,
                type: 'application/vnd.android.package-archive',
            });
        } catch {
            setPhase('error');
        }
    }, [apkUri]);

    if (Platform.OS !== 'android') return null;

    const status = (() => {
        switch (phase) {
            case 'checking':
                return t('updates.appUpdate.checking');
            case 'latest':
                return t('updates.appUpdate.latest');
            case 'available':
                return release ? t('updates.appUpdate.available', { version: formatVersion(release.version) }) : null;
            case 'downloading':
                return t('updates.appUpdate.downloading', { percent: progress });
            case 'ready':
                return t('updates.appUpdate.ready');
            case 'error':
                return t('updates.appUpdate.error');
            default:
                return null;
        }
    })();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface.base, borderColor: theme.colors.border.default }]} testID="app-update-card">
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t('updates.appUpdate.title')}</Text>
            <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
                {t('updates.appUpdate.current', { version: HARNESSLINK_APP_VERSION })}
            </Text>
            {status ? (
                <Text style={[styles.meta, { color: theme.colors.text.secondary }]} accessibilityLiveRegion="polite">
                    {status}
                </Text>
            ) : null}
            <View style={styles.actions}>
                {phase === 'available' ? (
                    <RoundButton size="small" title={t('updates.appUpdate.download')} onPress={() => void download()} />
                ) : phase === 'ready' ? (
                    <RoundButton size="small" title={t('updates.appUpdate.install')} onPress={() => void install()} />
                ) : (
                    <RoundButton
                        size="small"
                        title={phase === 'error' ? t('updates.appUpdate.retry') : t('updates.appUpdate.check')}
                        onPress={() => void check()}
                    />
                )}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    meta: {
        fontSize: 13,
    },
    actions: {
        marginTop: 4,
        flexDirection: 'row',
    },
});
