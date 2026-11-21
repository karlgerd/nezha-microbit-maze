/**
 * Motorsteuerung für den Labyrinth-Roboter (2 oder 4 Motoren, Panzerlenkung).
 */
//% color="#E8590C" icon="\uf085" block="Robo-Motoren" weight=115
//% groups='["Konfiguration", "Fahren", "Fahren (blockierend)", "Encoder", "Servo"]'
namespace motoren {

    export enum Motor {
        //% block="M1"
        M1 = 1,
        //% block="M2"
        M2 = 2,
        //% block="M3"
        M3 = 3,
        //% block="M4"
        M4 = 4
    }

    export enum Richtung {
        //% block="links"
        Links = 1,
        //% block="rechts"
        Rechts = 2
    }

    /** Signal-Pins der Nezha-Ports J1 bis J4. */
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

    // --- Zustand ---
    let vierMotoren = false;
    let motorVL: number = Motor.M1;
    let motorHL: number = Motor.M2;
    let motorVR: number = Motor.M3;
    let motorHR: number = Motor.M4;

    // Standardgeometrie des Referenzroboters (siehe Block "setze Fahrzeuggeometrie")
    let radumfang = 17.59;
    let drehdurchmesserCm = Math.sqrt(14.5 * 14.5 + 9.3 * 9.3);
    let schlupfFaktor = 1.0;

    let encoderOffset: number[] = [0, 0, 0, 0];

    function linkeMotoren(): number[] {
        return vierMotoren ? [motorVL, motorHL] : [motorVL];
    }

    function rechteMotoren(): number[] {
        return vierMotoren ? [motorVR, motorHR] : [motorVR];
    }

    /** Dreht alle Motoren geregelt um "grad" und wartet, bis die Bewegung beendet ist. */
    function bewegeGeregelt(grad: number, leistung: number, drehungLinks: number, drehungRechts: number): void {
        nezhaMotorDriver.setRegulatedSpeed(leistung);
        for (let m of linkeMotoren()) nezhaMotorDriver.moveDegrees(m, drehungLinks, grad);
        for (let m of rechteMotoren()) nezhaMotorDriver.moveDegrees(m, drehungRechts, grad);
        nezhaMotorDriver.waitForDegrees(grad);
        stoppeAlleMotoren();
    }

    // ==========================================
    // Konfiguration
    // ==========================================

    /**
     * Konfiguriert den Roboter für einen Antrieb mit 4 Motoren.
     */
    //% blockId=nezhamaze_config_4wd
    //% block="Motorkonfiguration 4 Motoren: vorne links $vl hinten links $hl vorne rechts $vr hinten rechts $hr"
    //% group="Konfiguration" weight=100
    //% vl.defl=motoren.Motor.M1 hl.defl=motoren.Motor.M2 vr.defl=motoren.Motor.M3 hr.defl=motoren.Motor.M4
    //% inlineInputMode=inline
    export function konfiguriere4Motoren(vl: Motor, hl: Motor, vr: Motor, hr: Motor): void {
        vierMotoren = true;
        motorVL = vl;
        motorHL = hl;
        motorVR = vr;
        motorHR = hr;
    }

    /**
     * Konfiguriert den Roboter für einen Antrieb mit 2 Motoren.
     */
    //% blockId=nezhamaze_config_2wd
    //% block="Motorkonfiguration 2 Motoren: links $links rechts $rechts"
    //% group="Konfiguration" weight=90
    //% links.defl=motoren.Motor.M1 rechts.defl=motoren.Motor.M2
    export function konfiguriere2Motoren(links: Motor, rechts: Motor): void {
        vierMotoren = false;
        motorVL = links;
        motorVR = rechts;
    }

    /**
     * Legt die Abmessungen des Roboters fest. Sie werden für Drehungen um eine Gradzahl benötigt.
     * Bei 2 Motoren den Abstand vorne/hinten auf 0 setzen.
     * @param radumfangCm Umfang eines Rades in cm
     * @param abstandLinksRechtsCm Abstand zwischen linkem und rechtem Rad (Radmitte) in cm
     * @param abstandVorneHintenCm Abstand zwischen vorderer und hinterer Achse in cm
     */
    //% blockId=nezhamaze_config_geometry
    //% block="setze Fahrzeuggeometrie: Radumfang $radumfangCm cm|Abstand links-rechts $abstandLinksRechtsCm cm|Abstand vorne-hinten $abstandVorneHintenCm cm"
    //% group="Konfiguration" weight=80
    //% radumfangCm.defl=17.59 abstandLinksRechtsCm.defl=14.5 abstandVorneHintenCm.defl=9.3
    export function setzeFahrzeuggeometrie(radumfangCm: number, abstandLinksRechtsCm: number, abstandVorneHintenCm: number): void {
        radumfang = Math.max(0.1, radumfangCm);
        let lr = Math.max(0.1, abstandLinksRechtsCm);
        let vh = Math.max(0, abstandVorneHintenCm);
        // Bei 4 Motoren dreht der Roboter näherungsweise um die Diagonale
        drehdurchmesserCm = Math.sqrt(lr * lr + vh * vh);
    }

    /**
     * Korrekturfaktor für Drehungen um eine Gradzahl. Größer als 1, wenn der Roboter zu wenig dreht.
     * @param faktor Korrekturfaktor, z. B. 1.28
     */
    //% blockId=nezhamaze_config_slip
    //% block="setze Dreh-Korrekturfaktor auf $faktor"
    //% group="Konfiguration" weight=75
    //% faktor.defl=1.28
    export function setzeDrehKorrektur(faktor: number): void {
        schlupfFaktor = Math.max(0.1, faktor);
    }

    // ==========================================
    // Fahren (nicht blockierend)
    // ==========================================

    /**
     * Startet die Motoren mit der angegebenen Leistung. Sie laufen weiter, bis sie gestoppt werden.
     * Positive Werte fahren vorwärts, negative rückwärts.
     */
    //% blockId=nezhamaze_drive
    //% block="fahre mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Fahren" weight=100
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=50
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=50
    export function fahre(leistungLinks: number, leistungRechts: number): void {
        leistungLinks = Math.clamp(-100, 100, leistungLinks);
        leistungRechts = Math.clamp(-100, 100, leistungRechts);
        // Die linken Motoren sind spiegelverkehrt montiert und werden invertiert angesteuert
        for (let m of linkeMotoren()) nezhaMotorDriver.start(m, -leistungLinks);
        for (let m of rechteMotoren()) nezhaMotorDriver.start(m, leistungRechts);
    }

    /**
     * Stoppt sofort alle konfigurierten Motoren.
     */
    //% blockId=nezhamaze_stop
    //% block="stoppe alle Motoren"
    //% group="Fahren" weight=90
    export function stoppeAlleMotoren(): void {
        for (let m of linkeMotoren()) nezhaMotorDriver.stop(m);
        for (let m of rechteMotoren()) nezhaMotorDriver.stop(m);
    }

    // ==========================================
    // Fahren (blockierend)
    // ==========================================

    /**
     * Fährt eine Anzahl Radumdrehungen geradeaus und hält dann an.
     * Negative Leistung fährt rückwärts.
     */
    //% blockId=nezhamaze_drive_rotations
    //% block="fahre $umdrehungen Umdrehungen mit $leistung % Leistung"
    //% group="Fahren (blockierend)" weight=100
    //% umdrehungen.defl=1
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    export function fahreUmdrehungen(umdrehungen: number, leistung: number): void {
        leistung = Math.clamp(-100, 100, leistung);
        if (umdrehungen <= 0 || leistung === 0) return;
        let vorwaerts = leistung > 0;
        bewegeGeregelt(
            umdrehungen * 360,
            Math.abs(leistung),
            vorwaerts ? nezhaMotorDriver.Spin.CCW : nezhaMotorDriver.Spin.CW,
            vorwaerts ? nezhaMotorDriver.Spin.CW : nezhaMotorDriver.Spin.CCW
        );
    }

    /**
     * Fährt eine Strecke in cm geradeaus und hält dann an.
     * Nutzt den Radumfang aus "setze Fahrzeuggeometrie". Negative Leistung fährt rückwärts.
     */
    //% blockId=nezhamaze_drive_cm
    //% block="fahre $cm cm mit $leistung % Leistung"
    //% group="Fahren (blockierend)" weight=98
    //% cm.defl=30
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    export function fahreStrecke(cm: number, leistung: number): void {
        fahreUmdrehungen(cm / radumfang, leistung);
    }

    /**
     * Fährt für eine bestimmte Zeit geradeaus und hält dann an.
     */
    //% blockId=nezhamaze_drive_time
    //% block="fahre $ms ms mit $leistung % Leistung"
    //% group="Fahren (blockierend)" weight=95
    //% ms.defl=500 ms.shadow=timePicker
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    export function fahreZeit(ms: number, leistung: number): void {
        fahreKurveZeit(ms, leistung, leistung);
    }

    /**
     * Fährt für eine bestimmte Zeit mit getrennter Leistung links und rechts und hält dann an.
     */
    //% blockId=nezhamaze_drive_curve_time
    //% block="fahre $ms ms mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Fahren (blockierend)" weight=90
    //% ms.defl=500 ms.shadow=timePicker
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=50
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=50
    export function fahreKurveZeit(ms: number, leistungLinks: number, leistungRechts: number): void {
        if (ms <= 0) return;
        fahre(leistungLinks, leistungRechts);
        basic.pause(ms);
        stoppeAlleMotoren();
    }

    /**
     * Dreht den Roboter auf der Stelle um eine Gradzahl.
     * Die Genauigkeit hängt von Fahrzeuggeometrie und Dreh-Korrekturfaktor ab.
     */
    //% blockId=nezhamaze_turn_degrees
    //% block="drehe auf der Stelle um $grad ° nach $richtung mit $leistung % Leistung"
    //% group="Fahren (blockierend)" weight=80
    //% grad.defl=90
    //% leistung.min=1 leistung.max=100 leistung.defl=50
    export function dreheGrad(grad: number, richtung: Richtung, leistung: number): void {
        if (grad <= 0) return;
        let bogenCm = (grad / 360) * Math.PI * drehdurchmesserCm * schlupfFaktor;
        let motorGrad = (bogenCm / radumfang) * 360;
        // Bei einer Rechtsdrehung laufen links vorwärts (CCW) und rechts rückwärts (CCW)
        let drehung = richtung === Richtung.Rechts ? nezhaMotorDriver.Spin.CCW : nezhaMotorDriver.Spin.CW;
        bewegeGeregelt(motorGrad, Math.clamp(1, 100, Math.abs(leistung)), drehung, drehung);
    }

    /**
     * Dreht den Roboter für eine bestimmte Zeit auf der Stelle.
     */
    //% blockId=nezhamaze_turn_time
    //% block="drehe auf der Stelle $ms ms nach $richtung mit $leistung % Leistung"
    //% group="Fahren (blockierend)" weight=70
    //% ms.defl=500 ms.shadow=timePicker
    //% leistung.min=1 leistung.max=100 leistung.defl=30
    export function dreheZeit(ms: number, richtung: Richtung, leistung: number): void {
        leistung = Math.clamp(0, 100, Math.abs(leistung));
        if (richtung === Richtung.Links) fahreKurveZeit(ms, -leistung, leistung);
        else fahreKurveZeit(ms, leistung, -leistung);
    }

    // ==========================================
    // Encoder
    // ==========================================

    /**
     * Gibt zurück, um wie viel Grad sich der Motor seit dem letzten Zurücksetzen gedreht hat.
     */
    //% blockId=nezhamaze_encoder_read
    //% block="Winkel von Motor $motor (°)"
    //% group="Encoder" weight=100
    export function winkel(motor: Motor): number {
        return nezhaMotorDriver.readAngle(motor) - encoderOffset[motor - 1];
    }

    /**
     * Setzt den Winkel des Motors auf 0 zurück.
     */
    //% blockId=nezhamaze_encoder_reset
    //% block="setze Winkel von Motor $motor auf 0"
    //% group="Encoder" weight=90
    export function setzeWinkelZurueck(motor: Motor): void {
        encoderOffset[motor - 1] = nezhaMotorDriver.readAngle(motor);
    }

    // ==========================================
    // Servo
    // ==========================================

    /**
     * Stellt einen Micro-Servo auf einen Winkel (0-180°) und wartet 800 ms, bis er angekommen ist.
     */
    //% blockId=nezhamaze_servo
    //% block="setze Servo an Port $port auf $winkel °"
    //% group="Servo" weight=50
    //% winkel.min=0 winkel.max=180 winkel.defl=90
    export function setzeServo(port: ServoPort, winkel: number): void {
        pins.servoWritePin(<number>port, Math.clamp(0, 180, winkel));
        basic.pause(800);
    }
}
