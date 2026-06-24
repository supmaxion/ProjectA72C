/**
 * Thin wrapper around the static overlay DOM elements (info box, HUD
 * label, click-to-start prompt). For now the HUD text is static --
 * dynamic readouts (speed, distance to planet) are planned for a
 * later pass once physics is in place and there is real velocity/
 * distance data to display.
 */
export function getOverlayElements() {
    return {
        info: document.getElementById('info'),
        hud: document.getElementById('hud'),
        clickToStart: document.getElementById('clickToStart'),
    };
}
