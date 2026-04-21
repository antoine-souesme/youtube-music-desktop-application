const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const YOUTUBE_MUSIC_URL = "https://music.youtube.com";
const isDev = !app.isPackaged;

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

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 980,
        minHeight: 640,
        backgroundColor: "#0f0f0f",
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
            mainWindow.setTitle("YouTube Music Wrapper (dev)");
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
