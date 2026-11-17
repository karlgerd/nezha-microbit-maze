/**
 * Interne Neigungserkennung über den Beschleunigungssensor des micro:bit.
 * Läuft im Hintergrund, sobald ein Neigungs-Ereignis registriert wurde.
 * Nicht im Block-Menü sichtbar.
 */
namespace nezhaTilt {
    const STATE_UNKNOWN = -99;
    const STATE_DOWN = -1;
    const STATE_FLAT = 0;
    const STATE_UP = 1;

    /** Ein Zustand muss so lange stabil sein, bevor das Ereignis auslöst. */
    export const STABLE_TIME_MS = 1000;
    /** Toleranz für "waagerecht" in mg (ca. 11,5°). */
    export const FLAT_THRESHOLD_MG = 200;

    let onDown: () => void;
    let onUp: () => void;
    let onFlat: () => void;

    let downThresholdMg = -260;
    let upThresholdMg = 260;
    let running = false;

    /** Rechnet einen Neigungswinkel in Grad in einen Beschleunigungswert (mg) um. */
    export function degreesToMg(degrees: number): number {
        return Math.sin(degrees * Math.PI / 180) * 1024;
    }

    function startMonitoring(): void {
        if (running) return;
        running = true;
        control.inBackground(function () {
            let currentState = STATE_UNKNOWN;
            let pendingState = STATE_UNKNOWN;
            let pendingSince = 0;

            while (true) {
                let y = input.acceleration(Dimension.Y);
                let now = input.runningTime();

                // Zwischen den Schwellen (Hysterese) bleibt der bisherige Messzustand erhalten
                let measured = pendingState;
                if (y < downThresholdMg) measured = STATE_DOWN;
                else if (y > upThresholdMg) measured = STATE_UP;
                else if (Math.abs(y) < FLAT_THRESHOLD_MG) measured = STATE_FLAT;

                if (measured !== pendingState) {
                    pendingState = measured;
                    pendingSince = now;
                } else if (pendingState !== currentState) {
                    // Oben an der Rampe angekommen: sofort melden, damit der Roboter nicht weiterkippt
                    let requiredMs = (pendingState === STATE_FLAT && currentState === STATE_UP) ? 0 : STABLE_TIME_MS;
                    if (now - pendingSince >= requiredMs) {
                        currentState = pendingState;
                        if (currentState === STATE_DOWN && onDown) onDown();
                        else if (currentState === STATE_UP && onUp) onUp();
                        else if (currentState === STATE_FLAT && onFlat) onFlat();
                    }
                }
                basic.pause(50);
            }
        });
    }

    export function registerDown(thresholdMg: number, handler: () => void): void {
        downThresholdMg = -Math.abs(thresholdMg);
        onDown = handler;
        startMonitoring();
    }

    export function registerUp(thresholdMg: number, handler: () => void): void {
        upThresholdMg = Math.abs(thresholdMg);
        onUp = handler;
        startMonitoring();
    }

    export function registerFlat(handler: () => void): void {
        onFlat = handler;
        startMonitoring();
    }
}
