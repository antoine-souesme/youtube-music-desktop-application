# YouTube Music Desktop Application

Ultra simple Electron application that encapsulates `https://music.youtube.com` in a desktop window. Nothing more.

<img width="1473" height="1095" alt="Capture d’écran 2026-04-22 à 09 22 28" src="https://github.com/user-attachments/assets/0f74527c-0da3-412a-86a3-26feefbd7c47" />

### Why

I built it because I was tired of having to switch accounts every time I watched YouTube. This solves it.

# Development

## Install Deps

```bash
npm install
```

## Local Dev

```bash
npm run dev
```

## Build Scripts

- `npm run build` : Build for current platform
- `npm run build:mac` : Build for macOS (`.dmg`)
- `npm run build:win` : Build Windows (NSIS `.exe`)

Artefacts are build into `dist/`.
