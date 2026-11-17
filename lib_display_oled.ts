/**
 * Interner Treiber für das Grove OLED 128x64 (SSD1315 / SSD1306, I2C 0x3C).
 * Reine Textausgabe: 8 Zeilen mit je 25 Zeichen (5x5-Schrift).
 * Nicht im Block-Menü sichtbar.
 */
namespace nezhaOled {
    const DISPLAY_ADDR = 0x3C;
    export const LINES = 8;
    export const CHARS_PER_LINE = 25;
    const CHAR_WIDTH = 5;

    // 5x5-Zeichensatz für ASCII 0-127. Bit (5 * Spalte + Zeile) ist ein gesetzter Pixel.
    const font: number[] = [
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x00000000, 0x000002e0, 0x00018060, 0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060,
        0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200, 0x00021080, 0x00000100, 0x00111110,
        0x0007462e, 0x00087e40, 0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88, 0x00119531,
        0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00, 0x0008a880, 0x00052940, 0x00022a20, 0x0022d422,
        0x00e4d62e, 0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf, 0x000094bf, 0x00cac62e,
        0x000f909f, 0x000047f1, 0x0017c629, 0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e,
        0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21, 0x0007c20f, 0x00744107, 0x01f4111f,
        0x000d909b, 0x00117041, 0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440, 0x01084210,
        0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c, 0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2,
        0x000c109f, 0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e, 0x000e085e, 0x00064a4c,
        0x0002295e, 0x000f2944, 0x0001085c, 0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e,
        0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0, 0x000013f1, 0x00841080, 0x0022d422
    ];
    // Ersatzzeichen für unbekannte Zeichen (Kästchen)
    const UNKNOWN_GLYPH = 0x0022d422;

    let initialised = false;
    // 1 Steuerbyte + 8 Seiten x 128 Spalten
    let screenBuf = pins.createBuffer(1025);

    /** Liefert das Pixelmuster eines Zeichens, inklusive deutscher Sonderzeichen. */
    function glyph(code: number): number {
        if (code < 128) return font[code];
        switch (code) {
            case 0xE4: return 0x010fca4d; // ä
            case 0xF6: return 0x0006ca4d; // ö
            case 0xFC: return 0x010ec20d; // ü
            case 0xC4: return 0x000ea95d; // Ä
            case 0xD6: return 0x0006ca4d; // Ö
            case 0xDC: return 0x0006c20d; // Ü
            case 0xDF: return 0x000d543e; // ß
            case 0xB0: return 0x000008a2; // °
            default: return UNKNOWN_GLYPH;
        }
    }

    function command(value: number): void {
        pins.i2cWriteNumber(DISPLAY_ADDR, value, NumberFormat.UInt16BE);
    }

    function commands(values: number[]): void {
        for (let v of values) command(v);
    }

    function setPosition(column: number, page: number): void {
        commands([0xB0 | page, 0x00 | (column & 0x0F), 0x10 | (column >> 4)]);
    }

    export function init(): void {
        if (initialised) return;
        commands([
            0xAE,               // Display aus
            0xA4,               // Anzeige folgt RAM-Inhalt
            0xD5, 0xF0,         // Taktteiler
            0xA8, 0x3F,         // Multiplex 1:64
            0xD3, 0x00,         // kein Display-Offset
            0x40,               // Startzeile 0
            0x8D, 0x14,         // Ladungspumpe an
            0x20, 0x00,         // horizontale Adressierung
            0x21, 0, 127,       // Spaltenbereich
            0x22, 0, 63,        // Seitenbereich
            0xA1,               // Segmente spiegeln
            0xC8,               // COM-Scan umgekehrt
            0xDA, 0x12,         // COM-Pins
            0x81, 0xCF,         // Kontrast
            0xD9, 0xF1,         // Precharge
            0xDB, 0x40,         // VCOM-Pegel
            0xA6,               // normale (nicht invertierte) Darstellung
            0xD6, 0x00,         // Zoom aus (SSD1315)
            0xAF                // Display an
        ]);
        initialised = true;
        clear();
    }

    export function clear(): void {
        if (!initialised) init();
        screenBuf.fill(0);
        screenBuf[0] = 0x40;
        setPosition(0, 0);
        pins.i2cWriteBuffer(DISPLAY_ADDR, screenBuf);
    }

    /**
     * Schreibt einen Text in eine Zeile (1-8). Die Zeile wird vollständig
     * überschrieben: kürzere Texte werden mit Leerzeichen aufgefüllt,
     * längere nach 25 Zeichen abgeschnitten.
     */
    export function writeLine(text: string, line: number): void {
        if (!initialised) init();
        let page = Math.clamp(1, LINES, Math.floor(line)) - 1;
        let base = page * 128;

        for (let i = 0; i < CHARS_PER_LINE; i++) {
            let bits = i < text.length ? glyph(text.charCodeAt(i)) : 0;
            for (let x = 0; x < CHAR_WIDTH; x++) {
                let column = 0;
                for (let y = 0; y < 5; y++) {
                    if (bits & (1 << (CHAR_WIDTH * x + y))) column |= 1 << (y + 1);
                }
                screenBuf[base + i * CHAR_WIDTH + x + 1] = column;
            }
        }

        // Eine komplette Seite (128 Spalten) mit vorangestelltem Datensteuerbyte senden
        let pageBuf = screenBuf.slice(base, 129);
        pageBuf[0] = 0x40;
        setPosition(0, page);
        pins.i2cWriteBuffer(DISPLAY_ADDR, pageBuf);
    }
}
