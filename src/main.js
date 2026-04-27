const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

const YOUTUBE_MUSIC_URL = "https://music.youtube.com";
const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";
const APP_ICON_PATH = path.join(__dirname, "..", "build", "icons", "icon.png");
const BACK_ICON_PATH = path.join(__dirname, "..", "assets", "icons", "arrow-left.svg");
const BACK_ICON_SVG = fs.readFileSync(BACK_ICON_PATH, "utf8");
const BACK_ICON_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(BACK_ICON_SVG).toString("base64")}`;

const allowedHosts = new Set([
    "music.youtube.com",
    "www.youtube.com",
    "youtube.com",
    "accounts.google.com",
    "consent.youtube.com"
]);

function isAllowedNavigation(targetUrl) {
    try {
        const parsed = new URL(targetUrl);

        if (parsed.protocol !== "https:") {
            return false;
        }

        if (allowedHosts.has(parsed.hostname)) {
            return true;
        }

        if (parsed.hostname.endsWith(".youtube.com")) {
            return true;
        }

        if (parsed.hostname.endsWith(".google.com")) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

function createMenu(mainWindow) {
    const template = [
        {
            label: "App",
            submenu: [{ role: "quit" }]
        },
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "pasteAndMatchStyle" },
                { role: "delete" },
                { role: "selectAll" }
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click: () => mainWindow.webContents.reload()
                },
                ...(isDev
                    ? [
                          {
                              label: "Toggle Developer Tools",
                              accelerator: "Alt+CmdOrCtrl+I",
                              click: () => mainWindow.webContents.toggleDevTools()
                          }
                      ]
                    : []),
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { role: "togglefullscreen" }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

ipcMain.handle("window-ui-config", () => {
    return {
        homeUrl: YOUTUBE_MUSIC_URL,
        backIconDataUrl: BACK_ICON_DATA_URL
    };
});

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 980,
        minHeight: 640,
        icon: APP_ICON_PATH,
        backgroundColor: "#0f0f0f",
        ...(isMac
            ? {
                  titleBarStyle: "hiddenInset"
              }
            : {}),
        ...(isWindows
            ? {
                  titleBarStyle: "hidden",
                  titleBarOverlay: {
                      color: "#0f0f0f",
                      symbolColor: "#ffffff",
                      height: 40
                  }
              }
            : {}),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (isAllowedNavigation(url)) {
            return { action: "allow" };
        }

        shell.openExternal(url);
        return { action: "deny" };
    });

    mainWindow.webContents.on("will-navigate", (event, url) => {
        if (isAllowedNavigation(url)) {
            return;
        }

        event.preventDefault();
        shell.openExternal(url);
    });

    mainWindow.loadURL(YOUTUBE_MUSIC_URL);

    if (isDev) {
        mainWindow.webContents.on("did-finish-load", () => {
            mainWindow.setTitle("YouTube Music Desktop Application (dev)");
        });
    }

    return mainWindow;
}

app.whenReady().then(() => {
    const mainWindow = createMainWindow();
    createMenu(mainWindow);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            const window = createMainWindow();
            createMenu(window);
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
