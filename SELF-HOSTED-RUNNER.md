# Dedicated self-hosted runner

This repository has one repository-scoped runner for translation and publication automation.

## Runner

- Name: `operator-translation-mac-arm64`
- Machine: owner’s Apple Silicon Mac, macOS, ARM64
- Labels: `self-hosted`, `operator-translation`, `macOS`, `ARM64`
- Local install: `/Users/zahraamohammedali/actions-runner-operator-translation`
- Registration scope: this repository only

Workflows must require the full label set above. Do not target generic `self-hosted` alone.

## Routed work

- `.github/workflows/translation-runner-smoke.yml` — harmless manual identity check.
- `ops/supplication-native-toc-2026-10-04/.github/workflows/supplication-native-toc.yml` — Google Docs native-TOC browser publication automation.
- Future translation, editorial, and browser-driven publication jobs belong on this runner when they use the same full labels.

## Zero-cost and queue policy

- Use no GitHub-hosted runner, including `ubuntu-latest` or `macos-latest`.
- If this runner is busy or offline, jobs must remain queued. Never add a paid or hosted fallback.
- Keep workflow permissions minimal; the smoke workflow uses `contents: read`.

## Security and maintenance

- Never commit or print runner registration tokens, credentials, or service secrets.
- Avoid running untrusted pull-request code on this persistent runner.
- Keep exactly one active registration for this repository and name. Check repository Settings → Actions → Runners before re-registering.
- Do not modify the existing Operator, Nexus, or userpkm runner installations.

## Restart behavior

The runner is installed and started through the generated user-level macOS launchd service:

`/Users/zahraamohammedali/Library/LaunchAgents/actions.runner.mohalizahraa-operator-translation.operator-translation-mac-arm64.plist`

It auto-starts when the Mac user session starts after an ordinary reboot. Verify with `./svc.sh status` from the install directory and in repository Settings → Actions → Runners.
