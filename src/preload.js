"use strict";

const { ipcRenderer } = require("electron");

const BACK_BUTTON_ID = "ytmda-window-back-button";
const BACK_BUTTON_STYLE_ID = "ytmda-window-back-button-style";
const TITLEBAR_ID = "ytmda-window-titlebar";
const TITLEBAR_SPACER_ID = "ytmda-window-titlebar-spacer";
const isSupportedPlatform = process.platform === "darwin" || process.platform === "win32";
const TITLEBAR_HEIGHT = process.platform === "darwin" ? "32px" : "36px";

let uiConfig = {
    homeUrl: "https://music.youtube.com",
    backIconDataUrl: ""
};

let lastKnownUrl = "";

const FALLBACK_BACK_ICON_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xMiAxOS03LTcgNy03Ii8+PHBhdGggZD0iTTE5IDEySDUiLz48L3N2Zz4=";

function getBackButtonOffsets() {
    if (process.platform === "darwin") {
        return {
            top: "2px",
            left: "70px"
        };
    }

    return {
        top: "4px",
        left: "8px"
    };
}

function isHomeUrl(targetUrl) {
    try {
        const parsedHomeUrl = new URL(uiConfig.homeUrl);
        const parsedTargetUrl = new URL(targetUrl);

        return (
            parsedTargetUrl.origin === parsedHomeUrl.origin
            && (parsedTargetUrl.pathname === "/" || parsedTargetUrl.pathname === "")
            && parsedTargetUrl.search === ""
        );
    } catch {
        return false;
    }
}

function canNavigateBack() {
    return window.history.length > 1;
}

function ensureBackButtonStyle() {
    if (!isSupportedPlatform || document.getElementById(BACK_BUTTON_STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = BACK_BUTTON_STYLE_ID;
    style.textContent = `
        :root {
            --ytmda-titlebar-height: ${TITLEBAR_HEIGHT};
        }

        #${TITLEBAR_ID} {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2147483646;
            display: flex;
            align-items: center;
            height: var(--ytmda-titlebar-height);
            background: rgba(15, 15, 15, 0.96);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            box-sizing: border-box;
            -webkit-app-region: drag;
            backdrop-filter: blur(20px);
        }

        #${TITLEBAR_SPACER_ID} {
            display: block;
            width: 100%;
            height: var(--ytmda-titlebar-height);
            pointer-events: none;
        }

        #${BACK_BUTTON_ID} {
            position: absolute;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            padding: 0;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #ffffff;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            -webkit-app-region: no-drag;
            transition: opacity 120ms ease, background-color 120ms ease, transform 120ms ease;
        }

        #${BACK_BUTTON_ID} img {
            width: 16px;
            height: 16px;
            pointer-events: none;
            display: block;
            filter: brightness(0) invert(1);
        }

        #${BACK_BUTTON_ID}.is-visible {
            opacity: 1;
            pointer-events: auto;
        }

        #${BACK_BUTTON_ID}:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        #${BACK_BUTTON_ID}:focus-visible {
            outline: 2px solid rgba(255, 255, 255, 0.72);
            outline-offset: 2px;
        }
    `;

    document.head.appendChild(style);
}

function getBackButton() {
    return document.getElementById(BACK_BUTTON_ID);
}

function getTitlebar() {
    return document.getElementById(TITLEBAR_ID);
}

function getTitlebarSpacer() {
    return document.getElementById(TITLEBAR_SPACER_ID);
}

function ensureTitlebarSpacer() {
    if (!document.body || getTitlebarSpacer()) {
        return;
    }

    const spacer = document.createElement("div");
    spacer.id = TITLEBAR_SPACER_ID;
    const titlebar = getTitlebar();

    if (titlebar?.nextSibling) {
        document.body.insertBefore(spacer, titlebar.nextSibling);
        return;
    }

    document.body.appendChild(spacer);
}

function ensureTitlebar() {
    if (!isSupportedPlatform || !document.body) {
        return null;
    }

    const existingTitlebar = getTitlebar();

    if (existingTitlebar) {
        return existingTitlebar;
    }

    const titlebar = document.createElement("div");
    titlebar.id = TITLEBAR_ID;
    document.body.insertBefore(titlebar, document.body.firstChild);
    ensureTitlebarSpacer();

    return titlebar;
}

function navigateBack() {
    if (canNavigateBack()) {
        window.history.back();
        return;
    }

    window.location.assign(uiConfig.homeUrl);
}

function createBackIcon() {
    const icon = document.createElement("img");
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.src = uiConfig.backIconDataUrl || FALLBACK_BACK_ICON_DATA_URL;
    return icon;
}

function ensureBackButton() {
    if (!isSupportedPlatform || !document.documentElement) {
        return null;
    }

    const existingButton = getBackButton();

    if (existingButton) {
        return existingButton;
    }

    ensureBackButtonStyle();

    const button = document.createElement("button");
    const offsets = getBackButtonOffsets();
    const titlebar = ensureTitlebar();

    if (!titlebar) {
        return null;
    }

    button.id = BACK_BUTTON_ID;
    button.type = "button";
    button.title = "Back";
    button.setAttribute("aria-label", "Go back");
    button.style.top = offsets.top;
    button.style.left = offsets.left;
    button.addEventListener("click", navigateBack);
    button.appendChild(createBackIcon());

    titlebar.appendChild(button);
    ensureTitlebarSpacer();

    return button;
}

function syncBackButtonVisibility() {
    const button = ensureBackButton();

    if (!button) {
        return;
    }

    const shouldShow = !isHomeUrl(window.location.href);
    button.disabled = !shouldShow;
    button.classList.toggle("is-visible", shouldShow);
}

function syncBackButtonForUrlChange() {
    const currentUrl = window.location.href;

    if (currentUrl === lastKnownUrl) {
        return;
    }

    lastKnownUrl = currentUrl;
    syncBackButtonVisibility();
}

function initNavigationTracking() {
    lastKnownUrl = window.location.href;
    window.addEventListener("popstate", syncBackButtonVisibility);
    window.addEventListener("hashchange", syncBackButtonVisibility);
    window.setInterval(syncBackButtonForUrlChange, 250);
}

async function initBackButton() {
    if (!isSupportedPlatform) {
        return;
    }

    try {
        uiConfig = {
            ...uiConfig,
            ...(await ipcRenderer.invoke("window-ui-config"))
        };
    } catch {
        uiConfig.backIconDataUrl = FALLBACK_BACK_ICON_DATA_URL;
    }

    initNavigationTracking();
    ensureBackButton();
    syncBackButtonVisibility();
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initBackButton, { once: true });
} else {
    initBackButton();
}
