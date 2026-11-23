/**
 * Interner Treiber für den M5Stack Pa.Hub 2.1 (TCA9548A I2C-Multiplexer).
 * Wird vom ToF-Treiber genutzt. Nicht im Block-Menü sichtbar.
 */
namespace nezhaPaHub {
    const PAHUB_ADDR = 0x70;
    export const CHANNEL_COUNT = 6;

    /** Prüft, ob ein Kanal am Pa.Hub existiert (0-5). */
    export function isValidChannel(channel: number): boolean {
        return channel >= 0 && channel < CHANNEL_COUNT && channel === Math.floor(channel);
    }

    /**
     * Schaltet den Multiplexer auf den gewünschten Kanal um.
     * @returns true, wenn der Pa.Hub den Befehl bestätigt hat
     */
    export function selectChannel(channel: number): boolean {
        if (!isValidChannel(channel)) return false;
        let buf = pins.createBuffer(1);
        buf[0] = 1 << channel;
        return pins.i2cWriteBuffer(PAHUB_ADDR, buf) === 0;
    }
}
