/**
 * Interne Treiberbibliothek für Elecfreaks Nezha V2 Smart-Motoren.
 * Wickelt die I2C-Kommunikation und Puffer-Generierung ab.
 */
namespace nezhaInternalMotors {
    export const I2C_ADDR = 0x10;

    export enum MotorPosition {
        M1 = 1,
        M2 = 2,
        M3 = 3,
        M4 = 4
    }

    export enum TurnDirection {
        CW = 1,
        CCW = 2
    }

    export enum MotionTargetMode {
        Turns = 1,
        Degrees = 2,
        Seconds = 3
    }

    let servoSpeedGlobal = 900;
    export let relativeAngleOffset = [0, 0, 0, 0];

    export function safeDelayUs(us: number): void {
        control.waitMicros(us);
    }

    export function waitForMotion(value: number, mode: MotionTargetMode): void {
        if (value <= 0 || servoSpeedGlobal <= 0) return;

        let delayMs = 0;
        if (mode === MotionTargetMode.Turns) {
            delayMs = (value * 360000.0) / servoSpeedGlobal + 500;
        } else if (mode === MotionTargetMode.Seconds) {
            delayMs = value * 1000;
        } else if (mode === MotionTargetMode.Degrees) {
            delayMs = (value * 1000.0) / servoSpeedGlobal + 500;
        }
        basic.pause(delayMs);
    }

    export function startMotor(motor: MotorPosition, speed: number): void {
        speed = Math.clamp(-100, 100, speed);
        let dir = speed >= 0 ? TurnDirection.CW : TurnDirection.CCW;
        let absSpeed = Math.floor(Math.abs(speed));

        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = dir;
        buf[4] = 0x60;
        buf[5] = absSpeed;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    export function stopMotor(motor: MotorPosition): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5F;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    export function setInternalSpeed(speed: number): void {
        let scaledSpeed = Math.floor(Math.clamp(0, 100, speed) * 9);
        servoSpeedGlobal = scaledSpeed;

        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x77;
        buf[5] = (scaledSpeed >> 8) & 0xFF;
        buf[6] = 0x00;
        buf[7] = scaledSpeed & 0xFF;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    export function rawMove(motor: MotorPosition, direction: TurnDirection, value: number, mode: MotionTargetMode): void {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = direction;
        buf[4] = 0x70;
        buf[5] = (value >> 8) & 0xFF;
        buf[6] = mode;
        buf[7] = value & 0xFF;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
    }

    export function readRawAngle(motor: MotorPosition): number {
        safeDelayUs(4000);
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x46;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
        safeDelayUs(4000);

        let arr = pins.i2cReadBuffer(I2C_ADDR, 4);
        // Rückgabe des kontinuierlichen 32-Bit Integer Encoder-Werts
        return (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | arr[0];
    }
    
    export function resetRelativeAngle(motor: MotorPosition): void {
        relativeAngleOffset[motor - 1] = readRawAngle(motor);
    }
}

/**
 * Öffentliche API für den Rescue Maze Roboter.
 * Diese Funktionen werden in der Block-Definitions-Datei aufgerufen.
 */
namespace NezhaMotors {

    export enum Motor {
        M1 = 1,
        M2 = 2,
        M3 = 3,
        M4 = 4
    }

    export enum TurnDirection {
        Left = 1,
        Right = 2
    }

    // --- Zustandsvariablen ---
    let _ist4WD: boolean = false;
    let _motorVL: Motor = Motor.M1;
    let _motorHL: Motor = Motor.M2;
    let _motorVR: Motor = Motor.M3;
    let _motorHR: Motor = Motor.M4;
    
    let _radumfangCm: number = 17.59; // Standardwerte, falls keine eigenen konfiguriert wurden
    let _radabstandCm: number = 14.5;

    // --- Konfiguration & Geometrie ---
    export function setzeAntriebAuf4Motoren(vl: Motor, hl: Motor, vr: Motor, hr: Motor): void {
        _ist4WD = true;
        _motorVL = vl;
        _motorHL = hl;
        _motorVR = vr;
        _motorHR = hr;
    }

    export function setzeAntriebAuf2Motoren(links: Motor, rechts: Motor): void {
        _ist4WD = false;
        _motorVL = links;
        _motorVR = rechts;
    }


    export function setzeFahrzeugGeometrie(radumfangCm: number, abstandLinksRechtsCm: number, abstandVorneHintenCm: number): void {
        _radumfangCm = Math.max(0.1, radumfangCm);
        let lr = Math.max(0.1, abstandLinksRechtsCm);
        let vh = Math.max(0.1, abstandVorneHintenCm);
        
        // Berechnung des effektiven Rotationsdurchmessers (Diagonale) über Pythagoras
        _radabstandCm = Math.sqrt((lr * lr) + (vh * vh));
    }

    let _slipFaktor: number = 1.0;

    export function setzeSlipFaktor(faktor: number): void {
        _slipFaktor = Math.max(0.1, faktor);
    }

    // --- Dauerhaftes Fahren ---
    export function fahreDauerhaft(leistungLinks: number, leistungRechts: number): void {
        leistungLinks = Math.clamp(-100, 100, leistungLinks);
        leistungRechts = Math.clamp(-100, 100, leistungRechts);
        
        // Linke Seite invertieren (CCW ist bei PlanetX die Vorwärtsrichtung)
        nezhaInternalMotors.startMotor(_motorVL as number, -leistungLinks);
        nezhaInternalMotors.startMotor(_motorVR as number, leistungRechts);
        
        if (_ist4WD) {
            nezhaInternalMotors.startMotor(_motorHL as number, -leistungLinks);
            nezhaInternalMotors.startMotor(_motorHR as number, leistungRechts);
        }
    }

    export function stoppeAlleMotoren(): void {
        nezhaInternalMotors.stopMotor(_motorVL as number);
        nezhaInternalMotors.stopMotor(_motorVR as number);
        if (_ist4WD) {
            nezhaInternalMotors.stopMotor(_motorHL as number);
            nezhaInternalMotors.stopMotor(_motorHR as number);
        }
    }

    // --- Präzise Rotationen auf der Stelle ---
    export function dreheRoboterAufDerStelle(grad: number, richtung: TurnDirection, leistung: number): void {
        if (grad <= 0) return;
        leistung = Math.clamp(1, 100, Math.abs(leistung));
        let bogenlaenge = (grad / 360.0) * (Math.PI * _radabstandCm) * _slipFaktor;
        let motorGrad = (bogenlaenge / _radumfangCm) * 360.0;

        nezhaInternalMotors.setInternalSpeed(leistung);

        // Turn Right = Linke & Rechte Räder drehen beide CCW bzgl. Modul
        let dirAll = richtung === TurnDirection.Right ? nezhaInternalMotors.TurnDirection.CCW : nezhaInternalMotors.TurnDirection.CW;

        nezhaInternalMotors.rawMove(_motorVL as number, dirAll, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        nezhaInternalMotors.rawMove(_motorVR as number, dirAll, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        if (_ist4WD) {
            nezhaInternalMotors.rawMove(_motorHL as number, dirAll, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
            nezhaInternalMotors.rawMove(_motorHR as number, dirAll, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        }

        nezhaInternalMotors.waitForMotion(motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        stoppeAlleMotoren();
    }

    // --- Zeitbasierte Fahrbefehle ---
    export function fahreZeit(leistung: number, ms: number): void {
        fahreKurveZeit(leistung, leistung, ms);
    }

    export function fahreKurveZeit(leistungLinks: number, leistungRechts: number, ms: number): void {
        if (ms <= 0) return;
        fahreDauerhaft(leistungLinks, leistungRechts);
        basic.pause(ms);
        stoppeAlleMotoren();
    }

    // --- Umdrehungsbasierte Fahrbefehle ---
    export function fahreUmdrehungen(leistung: number, umdrehungen: number): void {
        if (umdrehungen <= 0) return;
        leistung = Math.clamp(-100, 100, leistung);
        let absLeistung = Math.abs(leistung);
        if (absLeistung === 0) return;

        // Umrechnung in Grad, um den Float-Verlust bei der I2C-Übertragung zu umgehen
        let motorGrad = umdrehungen * 360.0;

        nezhaInternalMotors.setInternalSpeed(absLeistung);
        
        let dirL = leistung >= 0 ? nezhaInternalMotors.TurnDirection.CCW : nezhaInternalMotors.TurnDirection.CW;
        let dirR = leistung >= 0 ? nezhaInternalMotors.TurnDirection.CW : nezhaInternalMotors.TurnDirection.CCW;

        // Nutzung des Modus Degrees anstelle von Turns
        nezhaInternalMotors.rawMove(_motorVL as number, dirL, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        nezhaInternalMotors.rawMove(_motorVR as number, dirR, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        if (_ist4WD) {
            nezhaInternalMotors.rawMove(_motorHL as number, dirL, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
            nezhaInternalMotors.rawMove(_motorHR as number, dirR, motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        }
        
        nezhaInternalMotors.waitForMotion(motorGrad, nezhaInternalMotors.MotionTargetMode.Degrees);
        stoppeAlleMotoren();
    }

    // --- Encoder-Hilfsfunktionen ---
    export function leseAbsolutenWinkel(motor: Motor): number {
        let raw = nezhaInternalMotors.readRawAngle(motor as number);
        let offset = nezhaInternalMotors.relativeAngleOffset[(motor as number) - 1];
        // Ausgabe in durchlaufenden Graden, verrechnet mit individuellem Offset
        return (raw - offset) * 0.1;
    }

    export function setzeEncoderAufNull(motor: Motor): void {
        nezhaInternalMotors.resetRelativeAngle(motor as number);
    }
}
