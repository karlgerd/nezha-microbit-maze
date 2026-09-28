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
     * Faehrt eine Kurve mit getrennter Leistungsangabe fuer linke und rechte Seite (-100% bis 100%).
     */
    //% group="Fahren"
    //% block="fahre Kurve mit links %left \\% und rechts %right \\%"
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
     * Stoppt sofort alle Motoren des Roboters.
     */
    //% group="Fahren"
    //% block="stoppe alle Motoren"
    //% weight=60
    export function stop(): void {
        nezhaInternalMotors.stopAllMotors();
    }
}
