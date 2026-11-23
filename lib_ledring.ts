/**
 * Interner Treiber für den Grove RGB-LED-Ring (WS2813, 20 LEDs) als Unterbodenbeleuchtung.
 * Sendet die Farbdaten über light.sendWS2812Buffer aus dem micro:bit-Kern, ohne
 * zusätzliche Bibliotheken. Nicht im Block-Menü sichtbar.
 */
namespace nezhaLedRing {
    export const LED_COUNT = 20;

    // 3 Byte je LED in der Reihenfolge Grün, Rot, Blau (WS2812/WS2813)
    let buf: Buffer = null;
    let pin: DigitalPin;
    let warned = false;

    /** Legt den Datenpin fest und schaltet alle LEDs aus. */
    export function init(datenPin: DigitalPin): void {
        pin = datenPin;
        buf = pins.createBuffer(LED_COUNT * 3);
        show();
    }

    function show(): void {
        light.sendWS2812Buffer(buf, pin);
    }

    function ready(): boolean {
        if (buf) return true;
        // Einmalig darauf hinweisen, dass "initialisiere LED-Ring" fehlt
        if (!warned) {
            warned = true;
            basic.showString("L");
        }
        return false;
    }

    /** Schaltet "anzahl" LEDs gleichmäßig verteilt in der Farbe (r, g, b) ein, alle anderen aus. */
    export function illuminate(anzahl: number, r: number, g: number, b: number): void {
        if (!ready()) return;
        anzahl = Math.clamp(0, LED_COUNT, Math.round(anzahl));
        r = Math.clamp(0, 255, Math.round(r));
        g = Math.clamp(0, 255, Math.round(g));
        b = Math.clamp(0, 255, Math.round(b));
        buf.fill(0);
        for (let i = 0; i < anzahl; i++) {
            let led = Math.round(i * LED_COUNT / anzahl) % LED_COUNT;
            buf[led * 3] = g;
            buf[led * 3 + 1] = r;
            buf[led * 3 + 2] = b;
        }
        show();
    }

    /** Schaltet alle LEDs aus. */
    export function off(): void {
        if (!ready()) return;
        buf.fill(0);
        show();
    }
}
