/**
 * Interne Treiberbibliothek für Elecfreaks Nezha V2 Smart-Motoren.
 * Nicht für Endbenutzer im Block-Menü sichtbar.
 */
namespace nezhaInternalMotors {
    const I2C_ADDR = 0x10;

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

    export enum DriveDirection {
        Forward = 1,
        Backward = 2
    }

    export enum MotionTargetMode {
        Turns = 1,
        Degrees = 2,
        Seconds = 3
    }

    export enum DistanceUnit {
        cm = 1,
        inch = 2
    }

    export enum RunUnit {
        Degrees = 2,
        Turns = 1,
        Seconds = 3,
        cm = 4,
        inch = 5
    }

    // Interne Zustandsvariablen
    let servoSpeedGlobal = 900;
    let relativeAngleOffset = [0, 0, 0, 0];
    let leftMotor = MotorPosition.M1;
    let rightMotor = MotorPosition.M2;
    let wheelCircumferenceCm = 0;
    let wheelBaseCm = 0;
    let turnCalibrationFactor = 1.0;

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

    export function stopAllMotors(): void {
        stopMotor(MotorPosition.M1);
        stopMotor(MotorPosition.M2);
        stopMotor(MotorPosition.M3);
        stopMotor(MotorPosition.M4);
    }

    export function rotateMotor(
        motor: MotorPosition,
        speed: number,
        direction: TurnDirection,
        value: number,
        mode: MotionTargetMode,
        wait: boolean = true
    ): void {
        if (speed <= 0 || value <= 0) return;

        setInternalSpeed(speed);

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

        if (wait) {
            waitForMotion(value, mode);
        }
    }

    export function getAbsoluteAngle(motor: MotorPosition): number {
        let raw = readRawAngle(motor);
        while (raw < 0) raw += 3600;
        return (raw % 3600) * 0.1;
    }

    export function getRelativeAngle(motor: MotorPosition): number {
        return (readRawAngle(motor) - relativeAngleOffset[motor - 1]) * 0.1;
    }

    export function resetRelativeAngle(motor: MotorPosition): void {
        relativeAngleOffset[motor - 1] = readRawAngle(motor);
    }

    export function getSpeedRps(motor: MotorPosition): number {
        safeDelayUs(4000);
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x47;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(I2C_ADDR, buf);
        safeDelayUs(4000);

        let data = pins.i2cReadBuffer(I2C_ADDR, 2);
        let rawSpeed = (data[1] << 8) | data[0];
        return Math.floor(rawSpeed / 3.6) * 0.01;
    }

    export function setupDriveMotors(left: MotorPosition, right: MotorPosition): void {
        leftMotor = left;
        rightMotor = right;
    }

    export function setWheelCircumference(value: number, unit: DistanceUnit): void {
        let val = Math.max(0, value);
        wheelCircumferenceCm = unit === DistanceUnit.inch ? val * 2.54 : val;
    }

    export function setWheelBase(value: number, unit: DistanceUnit): void {
        let val = Math.max(0, value);
        wheelBaseCm = unit === DistanceUnit.inch ? val * 2.54 : val;
    }

    export function driveContinuous(direction: DriveDirection, speed: number): void {
        speed = Math.clamp(0, 100, speed);
        let leftSpeed = direction === DriveDirection.Forward ? -speed : speed;
        let rightSpeed = direction === DriveDirection.Forward ? speed : -speed;
        startMotor(leftMotor, leftSpeed);
        startMotor(rightMotor, rightSpeed);
    }

    export function stopDrive(): void {
        stopMotor(leftMotor);
        stopMotor(rightMotor);
    }

    export function driveDistance(
        direction: DriveDirection,
        speed: number,
        value: number,
        unit: RunUnit
    ): void {
        if (speed <= 0 || value <= 0) return;

        setInternalSpeed(speed);
        let mode = MotionTargetMode.Degrees;
        let targetValue = value;

        switch (unit) {
            case RunUnit.Turns:
                mode = MotionTargetMode.Turns;
                break;
            case RunUnit.Seconds:
                mode = MotionTargetMode.Seconds;
                break;
            case RunUnit.Degrees:
                mode = MotionTargetMode.Degrees;
                break;
            case RunUnit.cm:
                if (wheelCircumferenceCm > 0) {
                    targetValue = (360 * value) / wheelCircumferenceCm;
                }
                mode = MotionTargetMode.Degrees;
                break;
            case RunUnit.inch:
                if (wheelCircumferenceCm > 0) {
                    targetValue = (360 * value * 2.54) / wheelCircumferenceCm;
                }
                mode = MotionTargetMode.Degrees;
                break;
        }

        if (direction === DriveDirection.Forward) {
            rawMove(leftMotor, TurnDirection.CCW, targetValue, mode);
            rawMove(rightMotor, TurnDirection.CW, targetValue, mode);
        } else {
            rawMove(leftMotor, TurnDirection.CW, targetValue, mode);
            rawMove(rightMotor, TurnDirection.CCW, targetValue, mode);
        }

        waitForMotion(targetValue, mode);
    }

    export function rotateChassis(angle: number, speed: number): void {
        if (speed <= 0 || angle === 0 || wheelBaseCm <= 0 || wheelCircumferenceCm <= 0) return;

        let absAngle = Math.abs(angle);
        let radians = (absAngle * Math.PI) / 180;
        let arcDistance = radians * (wheelBaseCm / 2);
        let motorDegrees = ((arcDistance * 360) * turnCalibrationFactor) / wheelCircumferenceCm;

        setInternalSpeed(speed);

        if (angle > 0) {
            rawMove(leftMotor, TurnDirection.CCW, motorDegrees, MotionTargetMode.Degrees);
            rawMove(rightMotor, TurnDirection.CCW, motorDegrees, MotionTargetMode.Degrees);
        } else {
            rawMove(leftMotor, TurnDirection.CW, motorDegrees, MotionTargetMode.Degrees);
            rawMove(rightMotor, TurnDirection.CW, motorDegrees, MotionTargetMode.Degrees);
        }

        waitForMotion(motorDegrees, MotionTargetMode.Degrees);
    }

    export function setInternalSpeed(speed: number): void {
        let scaledSpeed = Math.clamp(0, 100, speed) * 9;
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

    function rawMove(motor: MotorPosition, direction: TurnDirection, value: number, mode: MotionTargetMode): void {
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

    function readRawAngle(motor: MotorPosition): number {
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
        return (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | arr[0];
    }
}
