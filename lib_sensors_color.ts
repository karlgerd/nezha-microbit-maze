/**
 * Interner Treiber für den Farbsensor ams TCS3430 (Adafruit-Breakout), direkt am I2C-Bus.
 * Liefert die Normfarbwerte X, Y und Z. Nicht im Block-Menü sichtbar.
 * Registerfolge nach Adafruit_TCS3430 (https://github.com/adafruit/Adafruit_TCS3430).
 */
namespace nezhaColor {
    const I2C_ADDR = 0x39;
    const CHIP_ID = 0xDC;

    const REG_ENABLE = 0x80;   // Bit 0 PON, Bit 1 AEN
    const REG_ATIME = 0x81;    // Integrationszeit = (ATIME + 1) * 2,78 ms
    const REG_CFG1 = 0x90;     // Bit 0-1 Verstärkung, Bit 3 AMUX (0 = X)
    const REG_ID = 0x92;
    const REG_CH0DATAL = 0x94; // Z, Y, IR1, X als je 16 Bit (Little Endian)
    const REG_CFG2 = 0x9F;     // Bit 4 HGAIN

    // ca. 100 ms Integrationszeit, Verstärkung 16x (für Beleuchtung durch den LED-Ring)
    const ATIME = 35;
    const GAIN_16X = 0x02;

    /** Ergebnis der Initialisierung. */
    export enum InitResult {
        Ok = 0,
        /** Unter der Adresse 0x39 antwortet kein Gerät. */
        NoSensor = 1,
        /** Unter 0x39 antwortet ein Gerät, aber kein TCS3430. */
        WrongDevice = 2
    }

    /** Index der Kanäle im Datenblock. */
    export enum Channel {
        X = 3,
        Y = 1,
        Z = 0
    }

    let initialised = false;

    function writeReg(reg: number, value: number): boolean {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        return pins.i2cWriteBuffer(I2C_ADDR, buf) === 0;
    }

    function readReg(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE, true);
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt8BE);
    }

    /** Schaltet den Sensor ein und startet die fortlaufende Messung. */
    export function init(): InitResult {
        initialised = false;
        if (!writeReg(REG_ENABLE, 0x00)) return InitResult.NoSensor;
        if (readReg(REG_ID) !== CHIP_ID) return InitResult.WrongDevice;

        writeReg(REG_ATIME, ATIME);
        // Verstärkung 16x, AMUX auf X
        writeReg(REG_CFG1, (readReg(REG_CFG1) & ~0x0B) | GAIN_16X);
        // HGAIN aus
        writeReg(REG_CFG2, readReg(REG_CFG2) & ~0x10);
        // Power on und Messung ein
        writeReg(REG_ENABLE, 0x03);

        // Auf die erste vollständige Messung warten
        basic.pause((ATIME + 1) * 3 + 10);
        initialised = true;
        return InitResult.Ok;
    }

    /** Liest einen Kanal der zuletzt abgeschlossenen Messung (0-65535). */
    export function read(channel: Channel): number {
        if (!initialised && init() !== InitResult.Ok) return 0;
        pins.i2cWriteNumber(I2C_ADDR, REG_CH0DATAL, NumberFormat.UInt8BE, true);
        let buf = pins.i2cReadBuffer(I2C_ADDR, 8);
        return buf[channel * 2] | (buf[channel * 2 + 1] << 8);
    }
}
