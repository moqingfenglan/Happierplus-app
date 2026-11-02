# HarnessLink

**A phone-first control room for DeepSeek Harness and other coding agents.**

HarnessLink is a focused fork of [Happier](https://github.com/happier-dev/happier) that makes
DeepSeek Harness (DSH) a first-class agent next to Codex/ChatGPT, Claude, OpenCode and any
ACP-compatible CLI. The Android app, the daemon and the DSH bridge live in this repository.

> Status: early but working. The current Android release is v0.1.6.

## Why HarnessLink

Happier is an excellent multi-device control room, but DSH is not one of its built-in agents.
HarnessLink closes that gap without replacing the parts of Happier that already work:

- a DSH provider inside the agent catalog, with the same session, approval and follow-up flow;
- an ACP bridge for DSH's automation-only `dsh --profile acp` server;
- a desktop plugin that puts ACP-created DSH sessions back into the DSH workspace sidebar;
- an in-app updater that ships new APKs from this repository's GitHub releases;
- HarnessLink branding and the DeepSeek whale mark in the agent picker.

## What changed from Happier

| Area | Happier | HarnessLink |
| --- | --- | --- |
| DeepSeek Harness | not a built-in agent | built-in `dsh` provider + `dsh-acp-bridge` |
| DSH desktop sidebar | ACP sessions are not grouped | `dsh-workspace-bridge` attaches them to workspaces |
| DSH model route | manual profile setup | `acp-dsh` profile defaults to the signed-in account model |
| Agent updates (Android) | store / OTA | checks this repo's GitHub releases and installs the APK |
| App version | upstream package version | independent `HARNESSLINK_APP_VERSION` |
| Branding | Happier | HarnessLink + DSH whale icon |
| Windows setup | generic CLI install | DSH-aware shims, fork CLI and service wrapper |

Everything else — the relay, E2E encryption, session UI, approvals, Git and terminal features —
comes from Happier and remains compatible with it.

## Architecture

```text
HarnessLink Android app
        │  E2E encrypted
Happier relay (hosted or self-hosted)
        │
HarnessLink daemon (fork CLI 0.2.17-dsh)
        ├─ dsh provider ── dsh-acp-bridge ── dsh --profile acp-dsh
        ├─ codex provider ─ codex app-server
        └─ other ACP agents
        │
DSH desktop ── dsh-workspace-bridge (workspace membership)
```

The bridge handles the parts where DSH's ACP surface differs from Happier's expectations:

- `session/load` → `session/resume`;
- history replay after resume;
- filtering non-protocol stdout;
- default model/profile selection for the installed account.

## What works today

- Android release APK, arm64, signed with the project's shared debug key.
- DeepSeek Harness sessions from the phone:
  - **Custom ACP** backend works with the stock Happier daemon;
  - **native `DeepSeek Harness`** works with the HarnessLink fork daemon (`0.2.17-dsh`).
- DSH desktop workspace visibility through `packages/dsh-workspace-bridge`.
- Codex / ChatGPT sessions through the Codex CLI (`codex app-server`).
- Completion and approval flow inherited from Happier.
- In-app update check: Settings → Updates → check → download → Android installer.

## Install

### Phone

1. Download `app-release.apk` from the [latest release](https://github.com/moqingfenglan/Happierplus-app/releases/latest).
2. Allow installation from unknown apps for HarnessLink.
3. Sign in with the same Happier account as the computer.

The app checks for new versions from this repository. Updating does not require reinstalling
manually after the first install.

### Windows computer

Requirements: Windows 10/11, Node.js 22, DeepSeek Harness desktop, and the Happier account.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1
```

This creates the DSH bridge shims under `%LOCALAPPDATA%\HarnessLink\bin` and prepares the
`acp-dsh` DSH profile. For the native DSH provider, install the HarnessLink fork CLI
(`0.2.17-dsh`) and point the daemon service at it; the official Happier daemon does not know
the `dsh` agent.

## Update flow

The Android app reads the latest GitHub release of this repository, compares its tag with
`HARNESSLINK_APP_VERSION`, downloads the release APK and opens Android's package installer.
First-time installation of an unknown app still requires the system permission prompt.

## Repository layout

```text
apps/ui/                         Android / iOS / web client
apps/cli/                        daemon and CLI
packages/agents/                 agent catalog, DSH provider
packages/dsh-acp-bridge/         ACP proxy for dsh --profile acp
packages/dsh-workspace-bridge/   DSH desktop workspace membership plugin
scripts/install-windows.ps1      Windows shims and DSH profile setup
```

## Build from source

```bash
yarn install
yarn build:packages
yarn workspace @happier-dev/ui android
```

Release builds are produced by `.github/workflows/android-apk.yml`. The Windows CLI build lives
in `.github/workflows/cli-windows.yml`.

## Known gaps

- FCM push notifications are not enabled yet; background delivery needs a Firebase
  `google-services.json` for `com.moqingfenglan.harnesslink`.
- Codex model discovery can fall back to `Default` when its app-server probe is unavailable.
- The APK is sideload-only and currently ARM64.
- iOS builds are not part of this fork yet.

## Credits

HarnessLink is based on Happier (MIT). DeepSeek Harness is a product of DeepSeek. The whale mark
in the agent picker follows the Simple Icons DeepSeek path. Codex and ChatGPT are products of
OpenAI. HarnessLink is not affiliated with or endorsed by any of them.

## License

MIT. See [LICENCE](LICENCE).
