/**
 * Interner Treiber für TCS34725 RGB-Farbsensoren am Pa.Hub (Kanäle 0-5).
 * Messwerte werden pro Kanal zwischengespeichert. Nicht im Block-Menü sichtbar.
 */
namespace nezhaRgb {
    const I2C_ADDR = 0x29;
    const CMD_BIT = 0x80;

    const REG_ENABLE = 0x00;
    const REG_ATIME = 0x01;
    const REG_CONTROL = 0x0F;
    const REG_CDATAL = 0x14;

    let started: boolean[] = [false, false, false, false, false, false];

    // Zwischenspeicher der Rohwerte je Kanal
    let cachedR: number[] = [0, 0, 0, 0, 0, 0];
    let cachedG: number[] = [0, 0, 0, 0, 0, 0];
    let cachedB: number[] = [0, 0, 0, 0, 0, 0];
    let cachedC: number[] = [0, 0, 0, 0, 0, 0];

    function writeReg(reg: number, val: number): void {
        pins.i2cWriteNumber(I2C_ADDR, (CMD_BIT | reg) << 8 | val, NumberFormat.UInt16BE);
    }

    /** Schaltet den Sensor ein (Integrationszeit ca. 50 ms, Verstärkung 1x). */
    export function start(channel: number): void {
        if (!nezhaPaHub.isValidChannel(channel)) return;
        nezhaPaHub.selectChannel(channel);
        writeReg(REG_ATIME, 0xEB);
        writeReg(REG_CONTROL, 0x00);
        writeReg(REG_ENABLE, 0x01 | 0x02);
        basic.pause(55);
        started[channel] = true;
    }

    /** Liest alle vier Farbkanäle und speichert sie zwischen. */
    export function update(channel: number): void {
        if (!nezhaPaHub.isValidChannel(channel)) return;
        if (!started[channel]) start(channel);
        nezhaPaHub.selectChannel(channel);

        pins.i2cWriteNumber(I2C_ADDR, CMD_BIT | REG_CDATAL, NumberFormat.UInt8BE);
        let buf = pins.i2cReadBuffer(I2C_ADDR, 8);

        cachedC[channel] = buf[0] | (buf[1] << 8);
        cachedR[channel] = buf[2] | (buf[3] << 8);
        cachedG[channel] = buf[4] | (buf[5] << 8);
        cachedB[channel] = buf[6] | (buf[7] << 8);
    }

    /** Rohwert eines Farbkanals: 0 = Rot, 1 = Grün, 2 = Blau, 3 = Helligkeit. */
    export function raw(channel: number, component: number): number {
        if (!nezhaPaHub.isValidChannel(channel)) return 0;
        if (component === 0) return cachedR[channel];
        if (component === 1) return cachedG[channel];
        if (component === 2) return cachedB[channel];
        return cachedC[channel];
    }

    /** Farbanteil (0-255) relativ zur Gesamthelligkeit: 0 = Rot, 1 = Grün, 2 = Blau. */
    export function relative(channel: number, component: number): number {
        let c = raw(channel, 3);
        if (c === 0) return 0;
        return Math.clamp(0, 255, Math.round((raw(channel, component) / c) * 255));
    }
}
