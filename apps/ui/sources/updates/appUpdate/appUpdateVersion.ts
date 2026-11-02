/**
 * HarnessLink's own app version, independent of the upstream Happier package
 * version. Bump this for every published APK; the in-app updater compares the
 * GitHub release tag against it.
 */
export const HARNESSLINK_APP_VERSION = '0.1.7';

export type ParsedVersion = readonly [number, number, number];

export function parseReleaseVersion(tag: string): ParsedVersion | null {
    const match = /^v?(\d+)\.(\d+)\.(\d+)/i.exec(tag.trim());
    if (!match) return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(left: ParsedVersion, right: ParsedVersion): number {
    for (let index = 0; index < 3; index += 1) {
        const difference = left[index] - right[index];
        if (difference !== 0) return difference > 0 ? 1 : -1;
    }
    return 0;
}

export function formatVersion(version: ParsedVersion): string {
    return version.join('.');
}
