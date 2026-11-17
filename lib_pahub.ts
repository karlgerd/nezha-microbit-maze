/**
 * Interner Treiber für den M5Stack Pa.Hub 2.1 (TCA9548A I2C-Multiplexer).
 * Wird von den ToF- und RGB-Treibern genutzt. Nicht im Block-Menü sichtbar.
 */
namespace nezhaPaHub {
    const PAHUB_ADDR = 0x70;
    export const CHANNEL_COUNT = 6;

    /** Prüft, ob ein Kanal am Pa.Hub existiert (0-5). */
    export function isValidChannel(channel: number): boolean {
        return channel >= 0 && channel < CHANNEL_COUNT && channel === Math.floor(channel);
    }

    /** Schaltet den Multiplexer auf den gewünschten Kanal um. */
    export function selectChannel(channel: number): void {
        if (!isValidChannel(channel)) return;
        pins.i2cWriteNumber(PAHUB_ADDR, 1 << channel, NumberFormat.UInt8BE);
    }
}
