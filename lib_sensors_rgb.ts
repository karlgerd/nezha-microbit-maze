/**
 * Interne Treiberbibliothek für den TCS34725 RGB-Farbsensor am TCA9548A I2C-Multiplexer (Pa.Hub).
 * Nicht für Endbenutzer im Block-Menü sichtbar.
 */
namespace nezhaInternalSensors {
    const TCS34725_I2C_ADDR = 0x29;
    const CMD_BIT = 0x80;

    const REG_ENABLE = 0x00;
    const REG_ATIME = 0x01;
    const REG_CONTROL = 0x0F;
    const REG_CDATAL = 0x14;

    // Kanalspezifische Statusvariablen für 6 Multiplexer-Kanäle (0-5)
    let rgbStarted: boolean[] = [false, false, false, false, false, false];

    // Cache-Arrays für die Messwerte der 6 Kanäle
    let cachedC: number[] = [0, 0, 0, 0, 0, 0];
    let cachedR: number[] = [0, 0, 0, 0, 0, 0];
    let cachedG: number[] = [0, 0, 0, 0, 0, 0];
    let cachedB: number[] = [0, 0, 0, 0, 0, 0];

    function writeRgbReg(reg: number, val: number): void {
        pins.i2cWriteNumber(TCS34725_I2C_ADDR, (CMD_BIT | reg) << 8 | val, NumberFormat.UInt16BE);
    }

    export function startRgb(channel: number): void {
        if (channel < 0 || channel > 5) return;
        selectChannel(channel); 
        
        writeRgbReg(REG_ATIME, 0xEB);
        writeRgbReg(REG_CONTROL, 0x00);
        writeRgbReg(REG_ENABLE, 0x01 | 0x02);
        basic.pause(55);
        rgbStarted[channel] = true;
    }

    /**
     * Führt einen I2C-Burst-Read durch und aktualisiert die internen Cache-Variablen.
     */
    export function updateRgbValues(channel: number): void {
        if (channel < 0 || channel > 5) return;
        selectChannel(channel);
        if (!rgbStarted[channel]) {
            startRgb(channel);
        }

        // Lesezeiger auf erstes Register setzen
        pins.i2cWriteNumber(TCS34725_I2C_ADDR, CMD_BIT | REG_CDATAL, NumberFormat.UInt8BE);
        // 8 Bytes am Stück lesen
        let buf = pins.i2cReadBuffer(TCS34725_I2C_ADDR, 8);

        // Rekonstruktion und Speicherung der 16-Bit Werte im Cache
        cachedC[channel] = buf[0] | (buf[1] << 8);
        cachedR[channel] = buf[2] | (buf[3] << 8);
        cachedG[channel] = buf[4] | (buf[5] << 8);
        cachedB[channel] = buf[6] | (buf[7] << 8);
    }

    // --- Skalierte Werte aus dem Cache ---

    export function getRed(channel: number): number {
        let c = cachedC[channel];
        if (c === 0) return 0;
        return Math.min(255, Math.max(0, Math.round((cachedR[channel] / c) * 255)));
    }

    export function getGreen(channel: number): number {
        let c = cachedC[channel];
        if (c === 0) return 0;
        return Math.min(255, Math.max(0, Math.round((cachedG[channel] / c) * 255)));
    }

    export function getBlue(channel: number): number {
        let c = cachedC[channel];
        if (c === 0) return 0;
        return Math.min(255, Math.max(0, Math.round((cachedB[channel] / c) * 255)));
    }

    // --- Rohwerte aus dem Cache ---

    export function getCachedRedRaw(channel: number): number {
        return cachedR[channel];
    }

    export function getCachedGreenRaw(channel: number): number {
        return cachedG[channel];
    }

    export function getCachedBlueRaw(channel: number): number {
        return cachedB[channel];
    }

    export function getCachedClearRaw(channel: number): number {
        return cachedC[channel];
    }

    /**
     * Gibt alle vier Rohwerte (Rot, Grün, Blau, Clear) aus dem Zwischenspeicher als Liste zurück.
     * @param channel Der Pin am Pa.Hub (0-5)
     */
    export function getAllRawValues(channel: number): number[] {
        if (channel < 0 || channel > 5) return [0, 0, 0, 0];
        return [
            cachedR[channel], 
            cachedG[channel], 
            cachedB[channel], 
            cachedC[channel]
        ];
    }
}
