/**
 * UI-Blöcke für die Motorsteuerung.
 * Diese Datei definiert ausschließlich die grafische Repräsentation in MakeCode 
 * und leitet die Befehle an die interne Motor-Bibliothek weiter.
 */
//% color="#0A7ACC" icon="\uf085" block="Motoren" weight=100
namespace Motoren {

    // ==========================================
    // Gruppe: Konfiguration
    // ==========================================

    /**
     * Konfiguriert den Roboter für einen 4-Rad-Antrieb (4WD).
     */
    //% block="Setze Motorkonfiguration auf 4 Motoren: vorne links $vl hinten links $hl vorne rechts $vr hinten rechts $hr"
    //% group="Konfiguration"
    //% weight=100
    //% vl.defl=NezhaMotors.Motor.M1
    //% hl.defl=NezhaMotors.Motor.M2
    //% vr.defl=NezhaMotors.Motor.M3
    //% hr.defl=NezhaMotors.Motor.M4
    export function setzeAntriebAuf4Motoren(vl: NezhaMotors.Motor, hl: NezhaMotors.Motor, vr: NezhaMotors.Motor, hr: NezhaMotors.Motor): void {
        NezhaMotors.setzeAntriebAuf4Motoren(vl, hl, vr, hr);
    }

    /**
     * Konfiguriert den Roboter für einen 2-Rad-Antrieb (2WD).
     */
    //% block="Setze Motorkonfiguration auf 2 Motoren: links $links rechts $rechts"
    //% group="Konfiguration"
    //% weight=90
    //% links.defl=NezhaMotors.Motor.M1
    //% rechts.defl=NezhaMotors.Motor.M2
    export function setzeAntriebAuf2Motoren(links: NezhaMotors.Motor, rechts: NezhaMotors.Motor): void {
        NezhaMotors.setzeAntriebAuf2Motoren(links, rechts);
    }
    
    /**
     * Legt die mechanischen Abmessungen des Roboters für präzise Drehungen fest.
     * Berechnet automatisch die Diagonale für die 4WD-Panzerlenkung.
     */
    //% block="Setze Fahrzeuggeometrie: Radumfang $radumfangCm cm | Radabstand (L/R) $abstandLinksRechtsCm cm | Radabstand (V/H) $abstandVorneHintenCm cm"
    //% group="Konfiguration"
    //% radumfangCm.defl=17.59
    //% abstandLinksRechtsCm.defl=14.5
    //% abstandVorneHintenCm.defl=9.3
    //% weight=80
    export function setzeFahrzeugGeometrie(radumfangCm: number, abstandLinksRechtsCm: number, abstandVorneHintenCm: number): void {
        NezhaMotors.setzeFahrzeugGeometrie(radumfangCm, abstandLinksRechtsCm, abstandVorneHintenCm);
    }

    // ==========================================
    // Gruppe: Bewegung (Dauerhaft)
    // ==========================================

    /**
     * Fährt dauerhaft mit angegebener Leistung.
     */
    //% block="fahre dauerhaft mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Bewegung (Dauerhaft)"
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=50
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=50
    //% weight=100
    export function fahreDauerhaft(leistungLinks: number, leistungRechts: number): void {
        NezhaMotors.fahreDauerhaft(leistungLinks, leistungRechts);
    }

    /**
     * Stoppt sofort alle konfigurierten Motoren.
     */
    //% block="stoppe alle Motoren"
    //% group="Bewegung (Dauerhaft)"
    //% weight=90
    export function stoppeAlleMotoren(): void {
        NezhaMotors.stoppeAlleMotoren();
    }

    // ==========================================
    // Gruppe: Bewegung (Präzise/Blockierend)
    // ==========================================

    /**
     * Fährt geradeaus, basierend auf der Anzahl der Radumdrehungen.
     * Nutzt die Hardware-Regelung der Motoren und blockiert den I2C-Bus nicht.
     */
    //% block="fahre geradeaus für $umdrehungen Umdrehungen mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% umdrehungen.defl=1
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    //% weight=100
    export function fahreUmdrehungen(umdrehungen: number, leistung: number): void {
        NezhaMotors.fahreUmdrehungen(leistung, umdrehungen);
    }
    
    /**
     * Fährt für eine vorgegebene Zeit mit angegebener Leistung.
     */
    //% block="fahre für $ms ms mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Bewegung (Präzise/Blockierend)"
    //% ms.defl=500
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=50
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=50
    //% weight=90
    export function fahreKurveZeit(ms: number, leistungLinks: number, leistungRechts: number): void {
        NezhaMotors.fahreKurveZeit(leistungLinks, leistungRechts, ms);
    }

    /**
     * Dreht den Roboter auf der Stelle um eine bestimmte Gradzahl.
     */
    //% block="drehe auf der Stelle um $grad ° nach $richtung mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% grad.defl=90
    //% leistung.min=1 leistung.max=100 leistung.defl=50
    //% weight=80
    export function dreheRoboterAufDerStelle(grad: number, richtung: NezhaMotors.TurnDirection, leistung: number): void {
        NezhaMotors.dreheRoboterAufDerStelle(grad, richtung, leistung);
    }
    
    /**
     * Dreht den Roboter auf der Stelle für eine bestimmte Zeit.
     */
    //% block="drehe auf der Stelle für $ms ms nach $richtung mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% ms.defl=500
    //% leistung.min=1 leistung.max=100 leistung.defl=30
    //% weight=70
    export function dreheAufDerStelleZeit(ms: number, richtung: NezhaMotors.TurnDirection, leistung: number): void {
        let lLinks = richtung === NezhaMotors.TurnDirection.Left ? -leistung : leistung;
        let lRechts = richtung === NezhaMotors.TurnDirection.Left ? leistung : -leistung;
        NezhaMotors.fahreKurveZeit(lLinks, lRechts, ms);
    }

    // ==========================================
    // Gruppe: Encoder
    // ==========================================

    /**
     * Liest den aktuellen absoluten Winkel des Encoders für den gewählten Motor aus.
     */
    //% block="lese absoluten Winkel von Motor $motor"
    //% group="Encoder"
    //% weight=100
    export function leseAbsolutenWinkel(motor: NezhaMotors.Motor): number {
        return NezhaMotors.leseAbsolutenWinkel(motor);
    }

    /**
     * Setzt den internen Zähler (Encoder) des gewählten Motors auf Null zurück.
     */
    //% block="setze Encoder von Motor $motor auf Null"
    //% group="Encoder"
    //% weight=90
    export function setzeEncoderAufNull(motor: NezhaMotors.Motor): void {
        NezhaMotors.setzeEncoderAufNull(motor);
    }
    
    // ==========================================
    // Gruppe: Micro-Servo (Rescue Kit)
    // ==========================================

    /**
     * Zuordnung der Ports J1 bis J4 auf Pin 3 (Signal) des Nezha-Boards.
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
    //% block="setze Servo an Port $port auf $angle Grad"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% weight=50
    export function setServoAngle(port: ServoPort, angle: number): void {
        angle = Math.max(0, Math.min(180, angle));
        pins.servoWritePin(<number>port, angle);
        basic.pause(800);
    }
}
