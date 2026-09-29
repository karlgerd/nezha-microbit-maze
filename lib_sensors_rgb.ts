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

    function writeRgbReg(reg: number, val: number): void {
        pins.i2cWriteNumber(TCS34725_I2C_ADDR, (CMD_BIT | reg) << 8 | val, NumberFormat.UInt16BE);
    }

    function readRgb16(reg: number): number {
        pins.i2cWriteNumber(TCS34725_I2C_ADDR, CMD_BIT | reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(TCS34725_I2C_ADDR, NumberFormat.UInt16LE);
    }

    // Initialisierung unter Angabe des Pa.Hub-Ports
    export function startRgb(channel: number): void {
        if (channel < 0 || channel > 5) return;
        
        // Nutzt die selectChannel-Funktion, die in der ToF-Bibliothek deklariert ist
        selectChannel(channel); 
        
        writeRgbReg(REG_ATIME, 0xEB);
        writeRgbReg(REG_CONTROL, 0x00);
        writeRgbReg(REG_ENABLE, 0x01 | 0x02);
        basic.pause(55);
        rgbStarted[channel] = true;
    }

    // Abfrage der Werte unter Angabe des Pa.Hub-Ports
    function getRgbScaled(channel: number, colorChannelReg: number): number {
        if (channel < 0 || channel > 5) return 0;
        selectChannel(channel);
        
        // Automatische Initialisierung, falls diese vergessen wurde
        if (!rgbStarted[channel]) {
            startRgb(channel);
        }
        
        let c = readRgb16(REG_CDATAL);
        if (c === 0) return 0;

        let val = readRgb16(colorChannelReg);
        let scaled = Math.round((val / c) * 255);
        return Math.min(255, Math.max(0, scaled));
    }

    export function getRed(channel: number): number {
        return getRgbScaled(channel, 0x16);
    }

    export function getGreen(channel: number): number {
        return getRgbScaled(channel, 0x18);
    }

    export function getBlue(channel: number): number {
        return getRgbScaled(channel, 0x1A);
    }

    function getRawChannel(channel: number, reg: number): number {
        if (channel < 0 || channel > 5) return 0;
        selectChannel(channel);
        if (!rgbStarted[channel]) {
            startRgb(channel);
        }
        return readRgb16(reg);
    }

    export function getRedRaw(channel: number): number {
        return getRawChannel(channel, 0x16);
    }

    export function getGreenRaw(channel: number): number {
        return getRawChannel(channel, 0x18);
    }

    export function getBlueRaw(channel: number): number {
        return getRawChannel(channel, 0x1A);
    }

    export function getClearRaw(channel: number): number {
        return getRawChannel(channel, 0x14);
    }
}
