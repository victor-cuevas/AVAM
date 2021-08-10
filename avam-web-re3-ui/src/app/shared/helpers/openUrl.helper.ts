export function openUrl(windowName, windowConfig, url: any): void {
    if (url) {
        const winPop: Window = window.open(url, windowName, windowConfig);
        if (winPop && winPop.focus) {
            winPop.focus();
        }
    }
}
