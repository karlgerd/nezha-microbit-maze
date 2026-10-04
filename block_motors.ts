/**
 * Didaktisch reduzierte Motorsteuerung fuer den Roboter (2 oder 4 Motoren).
 */
//% color="#007ACC" icon="\uf085" block="Motoren" weight=100
namespace robotMotors {

    export enum MotorPort {
        //% block="M1"
        M1 = 1,
        //% block="M2"
        M2 = 2,
        //% block="M3"
        M3 = 3,
        //% block="M4"
        M4 = 4
    }

    // Interner Zustand fuer die Motorbelegung
    let isFourWheelDrive: boolean = false;
    let motorLeftFront: number = MotorPort.M1;
    let motorLeftRear: number = MotorPort.M3;
    let motorRightFront: number = MotorPort.M2;
    let motorRightRear: number = MotorPort.M4;

    /**
     * Konfiguriert den Roboter fuer 2 Antriebsmotoren (Standard: M1 links, M2 rechts).
     */
    //% group="Konfiguration"
    //% block="Setze Motorkonfiguration auf 2 Motoren: links %left rechts %right"
    //% left.defl=robotMotors.MotorPort.M1
    //% right.defl=robotMotors.MotorPort.M2
    //% weight=100
    export function setTwoMotors(left: MotorPort, right: MotorPort): void {
        isFourWheelDrive = false;
        motorLeftFront = left;
        motorRightFront = right;
    }

    /**
     * Konfiguriert den Roboter fuer 4 Antriebsmotoren (Allrad).
     */
    //% group="Konfiguration"
    //% block="Setze Motorkonfiguration auf 4 Motoren: vorne links %vl hinten links %hl vorne rechts %vr hinten rechts %hr"
    //% vl.defl=robotMotors.MotorPort.M1
    //% hl.defl=robotMotors.MotorPort.M2
    //% vr.defl=robotMotors.MotorPort.M3
    //% hr.defl=robotMotors.MotorPort.M4
    //% inlineInputMode=external
    //% weight=90
    export function setFourMotors(
        vl: MotorPort,
        hl: MotorPort,
        vr: MotorPort,
        hr: MotorPort
    ): void {
        isFourWheelDrive = true;
        motorLeftFront = vl;
        motorLeftRear = hl;
        motorRightFront = vr;
        motorRightRear = hr;
    }

    /**
     * Faehrt geradeaus vorwaerts (positive Leistung) oder rueckwaerts (negative Leistung).
     */
    //% group="Fahren"
    //% block="fahre mit Leistung %power \\%"
    //% power.min=-100 power.max=100
    //% power.defl=50
    //% weight=80
    export function drive(power: number): void {
        driveSteer(power, power);
    }
    
    /**
     * Faehrt geradeaus fuer eine angegebene Zeit in Millisekunden und stoppt dann.
     */
    //% group="Fahren"
    //% block="fahre mit Leistung %power \\% fuer %ms ms"
    //% power.min=-100 power.max=100 power.defl=50
    //% ms.shadow=timePicker ms.defl=1000
    //% weight=75
    export function driveForTime(power: number, ms: number): void {
        drive(power);
        basic.pause(ms);
        stop();
    }
    
    /**
     * Fährt exakt für eine bestimmte Anzahl an Radumdrehungen (mithilfe der Motor-Encoder) und stoppt dann.
     */
    //% group="Fahren"
    //% block="fahre mit Leistung %power \\% für %rotations Umdrehungen"
    //% power.min=-100 power.max=100 power.defl=50
    //% rotations.min=0.1 rotations.defl=1
    //% weight=74
    export function driveForRotations(power: number, rotations: number): void {
        if (power === 0 || rotations <= 0) return;
        
        // Encoder des vorderen linken Rades als Referenz auf 0 setzen
        nezhaInternalMotors.resetRelativeAngle(<nezhaInternalMotors.MotorPosition>motorLeftFront);
        
        drive(power);
        
        // Warten, bis der ausgelesene Winkel die geforderten Umdrehungen (in Grad) erreicht hat
        let targetDegrees = rotations * 360;
        while (Math.abs(nezhaInternalMotors.getRelativeAngle(<nezhaInternalMotors.MotorPosition>motorLeftFront)) < targetDegrees) {
            basic.pause(10);
        }
        
        stop();
    }
    
    /**
     * Faehrt eine Kurve mit getrennter Leistungsangabe fuer linke und rechte Seite (-100% bis 100%).
     */
    //% group="Fahren"
    //% block="fahre Kurve mit %left \\% links und %right \\% rechts"
    //% left.min=-100 left.max=100 left.defl=30
    //% right.min=-100 right.max=100 right.defl=60
    //% inlineInputMode=inline
    //% weight=70
    export function driveSteer(left: number, right: number): void {
        left = Math.clamp(-100, 100, left);
        right = Math.clamp(-100, 100, right);

        let actualLeftSpeed = -left;
        let actualRightSpeed = right;

        if (isFourWheelDrive) {
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorLeftFront, actualLeftSpeed);
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorLeftRear, actualLeftSpeed);
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorRightFront, actualRightSpeed);
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorRightRear, actualRightSpeed);
        } else {
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorLeftFront, actualLeftSpeed);
            nezhaInternalMotors.startMotor(<nezhaInternalMotors.MotorPosition>motorRightFront, actualRightSpeed);
        }
    }
    
    /**
     * Faehrt eine Kurve fuer eine angegebene Zeit in Millisekunden und stoppt dann.
     */
    //% group="Fahren"
    //% block="fahre Kurve mit %left \\% links und %right \\% rechts fuer %ms ms"
    //% left.min=-100 left.max=100 left.defl=30
    //% right.min=-100 right.max=100 right.defl=60
    //% ms.shadow=timePicker ms.defl=1000
    //% inlineInputMode=inline
    //% weight=60
    export function driveSteerForTime(left: number, right: number, ms: number): void {
        driveSteer(left, right);
        basic.pause(ms);
        stop();
    }

    /**
     * Fährt eine Kurve für eine bestimmte Anzahl an Radumdrehungen.
     * Gemessen wird an dem Rad, das die längere Strecke (höhere Leistung) zurücklegt.
     */
    //% group="Fahren"
    //% block="fahre Kurve mit %left \\% links und %right \\% rechts für %rotations Umdrehungen"
    //% left.min=-100 left.max=100 left.defl=30
    //% right.min=-100 right.max=100 right.defl=60
    //% rotations.min=0.1 rotations.defl=1
    //% inlineInputMode=inline
    //% weight=55
    export function driveSteerForRotations(left: number, right: number, rotations: number): void {
        if (left === 0 && right === 0) return;
        if (rotations <= 0) return;
        
        // Den schnelleren Motor (mit der höheren Leistung) als Referenz festlegen
        let refMotor = motorLeftFront;
        if (Math.abs(right) > Math.abs(left)) {
            refMotor = motorRightFront;
        }

        // Encoder des Referenzmotors zurücksetzen
        nezhaInternalMotors.resetRelativeAngle(<nezhaInternalMotors.MotorPosition>refMotor);
        
        driveSteer(left, right);
        
        // Warten, bis der äußere Motor die Ziel-Umdrehungen gefahren ist
        let targetDegrees = rotations * 360;
        while (Math.abs(nezhaInternalMotors.getRelativeAngle(<nezhaInternalMotors.MotorPosition>refMotor)) < targetDegrees) {
            basic.pause(10);
        }        
        stop();
    }
    
    /**
     * Stoppt sofort alle Motoren des Roboters.
     */
    //% group="Fahren"
    //% block="stoppe alle Motoren"
    //% weight=50
    export function stop(): void {
        nezhaInternalMotors.stopAllMotors();
    }

    // --- Erweiterung für Micro-Servo an J1-J4 ---

    /**
     * Zuordnung der Ports J1 bis J4 auf die jeweiligen Signal-Pins (Pin 3).
     */
    export enum ServoPort {
        //% block="J1"
        J1 = AnalogPin.P8,
        //% block="J2"
        J2 = AnalogPin.P12,
        //% block="J3"
        J3 = AnalogPin.P14,
        //% block="J4"
        J4 = AnalogPin.P16
    }

    /**
     * Setzt den Micro-Servo auf einen bestimmten Winkel zwischen 0 und 180 Grad.
     * Pausiert das Programm anschließend für 800ms.
     */
    //% group="Micro-Servo"
    //% color="#00008B"
    //% block="setze Servo an Port %port auf %angle Grad"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% weight=40
    export function setServoAngle(port: ServoPort, angle: number): void {
        angle = Math.clamp(0, 180, angle);
        pins.servoWritePin(port, angle);
        basic.pause(800);
    }
}

