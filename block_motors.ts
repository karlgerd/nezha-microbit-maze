/**
 * Didaktisch reduzierte Motorsteuerung fuer den Roboter (2 oder 4 Motoren).
 */
//% color="#0D47A1" icon="\uf1b9" block="Motoren" weight=100
namespace robotMotors {

    // interner Zustand fuer die Motorbelegung
    let isFourWheelDrive: boolean = false;
    let motorLeftFront: nezhaInternalMotors.MotorPosition = nezhaInternalMotors.MotorPosition.M1;
    let motorLeftRear: nezhaInternalMotors.MotorPosition = nezhaInternalMotors.MotorPosition.M3;
    let motorRightFront: nezhaInternalMotors.MotorPosition = nezhaInternalMotors.MotorPosition.M2;
    let motorRightRear: nezhaInternalMotors.MotorPosition = nezhaInternalMotors.MotorPosition.M4;

    /**
     * Konfiguriert den Roboter fuer 2 Antriebsmotoren (Standard: M1 links, M2 rechts).
     */
    //% group="Konfiguration"
    //% block="Setze Motorkonfiguration auf 2 Motoren: links %left rechts %right"
    //% left.defl=nezhaInternalMotors.MotorPosition.M1
    //% right.defl=nezhaInternalMotors.MotorPosition.M2
    //% weight=100
    export function setTwoMotors(
        left: nezhaInternalMotors.MotorPosition,
        right: nezhaInternalMotors.MotorPosition
    ): void {
        isFourWheelDrive = false;
        motorLeftFront = left;
        motorRightFront = right;
    }

    /**
     * Konfiguriert den Roboter fuer 4 Antriebsmotoren (Allrad).
     */
    //% group="Konfiguration"
    //% block="Setze Motorkonfiguration auf 4 Motoren: vorne links %vl hinten links %hl vorne rechts %vr hinten rechts %hr"
    //% vl.defl=nezhaInternalMotors.MotorPosition.M1
    //% hl.defl=nezhaInternalMotors.MotorPosition.M3
    //% vr.defl=nezhaInternalMotors.MotorPosition.M2
    //% hr.defl=nezhaInternalMotors.MotorPosition.M4
    //% inlineInputMode=external
    //% weight=90
    export function setFourMotors(
        vl: nezhaInternalMotors.MotorPosition,
        hl: nezhaInternalMotors.MotorPosition,
        vr: nezhaInternalMotors.MotorPosition,
        hr: nezhaInternalMotors.MotorPosition
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
    //% block="fahre Kurve mit %left \\% links und %right \\% rechts"
    //% left.min=-100 left.max=100 left.defl=30
    //% right.min=-100 right.max=100 right.defl=60
    //% inlineInputMode=inline
    //% weight=70
    export function driveSteer(left: number, right: number): void {
        left = Math.clamp(-100, 100, left);
        right = Math.clamp(-100, 100, right);

        // Die linke Seite ist mechanisch gespiegelt/verdreht montiert:
        // Daher Vorzeichenumkehr (-left), waehrend rechts normal laeuft (+right).
        let actualLeftSpeed = -left;
        let actualRightSpeed = right;

        if (isFourWheelDrive) {
            nezhaInternalMotors.startMotor(motorLeftFront, actualLeftSpeed);
            nezhaInternalMotors.startMotor(motorLeftRear, actualLeftSpeed);
            nezhaInternalMotors.startMotor(motorRightFront, actualRightSpeed);
            nezhaInternalMotors.startMotor(motorRightRear, actualRightSpeed);
        } else {
            nezhaInternalMotors.startMotor(motorLeftFront, actualLeftSpeed);
            nezhaInternalMotors.startMotor(motorRightFront, actualRightSpeed);
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
