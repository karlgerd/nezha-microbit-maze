/**
 * Interner Treiber für die Elecfreaks Nezha V2 Smart-Motoren.
 * Kapselt das I2C-Protokoll des Nezha-Boards. Nicht im Block-Menü sichtbar.
 */
namespace nezhaMotorDriver {
    const I2C_ADDR = 0x10;

    /** Drehrichtung aus Sicht des Motormoduls. */
    export enum Spin {
        CW = 1,
        CCW = 2
    }

    // Aktuelle Geschwindigkeit der geregelten Bewegungen in °/s (0-900)
    let regulatedSpeedDegPerSec = 900;

    function send(motor: number, b3: number, cmd: number, b5: number, b6: number, b7: number): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = b3;
        buf[4] = cmd;
        buf[5] = b5;
        buf[6] = b6;
        buf[7] = b7;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    /** Startet einen Motor dauerhaft. speed: -100 bis 100 (positiv = CW). */
    export function start(motor: number, speed: number): void {
        speed = Math.clamp(-100, 100, speed);
        let spin = speed >= 0 ? Spin.CW : Spin.CCW;
        send(motor, spin, 0x60, Math.floor(Math.abs(speed)), 0xF5, 0x00);
    }

    /** Stoppt einen Motor. */
    export function stop(motor: number): void {
        send(motor, 0x00, 0x5F, 0x00, 0xF5, 0x00);
    }

    /** Legt die Geschwindigkeit für geregelte Bewegungen fest (0-100 %). */
    export function setRegulatedSpeed(percent: number): void {
        let speed = Math.floor(Math.clamp(0, 100, percent) * 9);
        regulatedSpeedDegPerSec = speed;
        send(0x00, 0x00, 0x77, (speed >> 8) & 0xFF, 0x00, speed & 0xFF);
    }

    /** Dreht einen Motor geregelt um eine Anzahl Grad (0-65535). */
    export function moveDegrees(motor: number, spin: Spin, degrees: number): void {
        let value = Math.clamp(0, 65535, Math.round(degrees));
        send(motor, spin, 0x70, (value >> 8) & 0xFF, 0x02, value & 0xFF);
    }

    /**
     * Wartet, bis eine geregelte Bewegung voraussichtlich beendet ist.
     * Die Dauer wird aus Weg und Geschwindigkeit geschätzt (+500 ms Reserve).
     */
    export function waitForDegrees(degrees: number): void {
        if (degrees <= 0 || regulatedSpeedDegPerSec <= 0) return;
        basic.pause((degrees * 1000) / regulatedSpeedDegPerSec + 500);
    }

    /** Liest den fortlaufenden Encoder-Wert eines Motors in Grad. */
    export function readAngle(motor: number): number {
        control.waitMicros(4000);
        send(motor, 0x00, 0x46, 0x00, 0xF5, 0x00);
        control.waitMicros(4000);
        let arr = pins.i2cReadBuffer(I2C_ADDR, 4);
        // 32-Bit-Wert mit Vorzeichen in Zehntelgrad
        return ((arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | arr[0]) / 10;
    }
}
