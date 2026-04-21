# YouTube Music Wrapper (Electron)

Application Electron ultra simple qui encapsule `https://music.youtube.com` dans une fenetre desktop.

## Prerequis

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Lancement en local

```bash
npm run dev
```

## Scripts disponibles

- `npm run dev` : lance l'application en mode developpement
- `npm run start` : lance l'application (equivalent local)
- `npm run build` : build pour la plateforme courante
- `npm run build:mac` : genere un package macOS (`.dmg`)
- `npm run build:win` : genere un package Windows (NSIS `.exe`)

Les artefacts sont produits dans `dist/`.

## Structure

- `src/main.js` : processus principal Electron (fenetre, menu, regles de navigation)
- `src/preload.js` : preload minimal avec isolation activee
- `package.json` : scripts + configuration `electron-builder`

## Securite appliquee

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- Liens externes hors domaines Google/YouTube rediriges vers le navigateur systeme

## Notes packaging

- macOS : un build `.dmg` est genere sans signature par defaut
- Windows : installateur NSIS genere
- Si tu veux distribuer publiquement, il faudra ajouter signature/certificats
