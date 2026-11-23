/**
 * Interner Treiber für den Grove RGB-LED-Ring (WS2813, 20 LEDs) als Unterbodenbeleuchtung.
 * Nutzt die NeoPixel-Bibliothek von Microsoft. Nicht im Block-Menü sichtbar.
 */
namespace nezhaLedRing {
    export const LED_COUNT = 20;

    let ring: neopixel.Strip = null;
    let warned = false;

    /** Legt den Datenpin fest und schaltet alle LEDs aus. */
    export function init(pin: DigitalPin): void {
        ring = neopixel.create(pin, LED_COUNT, NeoPixelMode.RGB);
        // Volle Skala, damit die RGB-Werte 0-255 direkt der Helligkeit entsprechen
        ring.setBrightness(255);
        ring.clear();
        ring.show();
    }

    function ready(): boolean {
        if (ring) return true;
        // Einmalig darauf hinweisen, dass "initialisiere LED-Ring" fehlt
        if (!warned) {
            warned = true;
            basic.showString("L");
        }
        return false;
    }

    /** Schaltet "anzahl" LEDs gleichmäßig verteilt in der Farbe (r, g, b) ein, alle anderen aus. */
    export function light(anzahl: number, r: number, g: number, b: number): void {
        if (!ready()) return;
        anzahl = Math.clamp(0, LED_COUNT, Math.round(anzahl));
        let farbe = neopixel.rgb(Math.clamp(0, 255, r), Math.clamp(0, 255, g), Math.clamp(0, 255, b));
        ring.clear();
        for (let i = 0; i < anzahl; i++) {
            ring.setPixelColor(Math.round(i * LED_COUNT / anzahl) % LED_COUNT, farbe);
        }
        ring.show();
    }

    /** Schaltet alle LEDs aus. */
    export function off(): void {
        if (!ready()) return;
        ring.clear();
        ring.show();
    }
}
