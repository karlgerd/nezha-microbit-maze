/**
 * UI-Blöcke für die Motorsteuerung.
 * Diese Datei definiert ausschließlich die grafische Repräsentation in MakeCode 
 * und leitet die Befehle an die interne Motor-Bibliothek weiter.
 */
//% color=#d50000 icon="\uf2db" block="Motoren"
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
    export function setzeAntriebAuf4Motoren(vl: NezhaMotors.Motor, hl: NezhaMotors.Motor, vr: NezhaMotors.Motor, hr: NezhaMotors.Motor): void {
        NezhaMotors.setzeAntriebAuf4Motoren(vl, hl, vr, hr);
    }

    /**
     * Konfiguriert den Roboter für einen 2-Rad-Antrieb (2WD).
     */
    //% block="Setze Motorkonfiguration auf 2 Motoren: links $links rechts $rechts"
    //% group="Konfiguration"
    //% weight=90
    export function setzeAntriebAuf2Motoren(links: NezhaMotors.Motor, rechts: NezhaMotors.Motor): void {
        NezhaMotors.setzeAntriebAuf2Motoren(links, rechts);
    }

    /**
     * Legt die mechanischen Abmessungen des Roboters für präzise Drehungen fest.
     */
    //% block="Setze Fahrzeuggeometrie: Radumfang $radumfangCm cm | Radabstand $radabstandCm cm"
    //% group="Konfiguration"
    //% radumfangCm.defl=14.13
    //% radabstandCm.defl=12.0
    //% weight=80
    export function setzeFahrzeugGeometrie(radumfangCm: number, radabstandCm: number): void {
        NezhaMotors.setzeFahrzeugGeometrie(radumfangCm, radabstandCm);
    }


    // ==========================================
    // Gruppe: Bewegung (Dauerhaft)
    // ==========================================

    /**
     * Fährt dauerhaft geradeaus mit der gleichen Leistung auf beiden Seiten.
     */
    //% block="fahre mit $leistung % Leistung"
    //% group="Bewegung (Dauerhaft)"
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    //% weight=100
    export function fahre(leistung: number): void {
        NezhaMotors.fahreDauerhaft(leistung, leistung);
    }

    /**
     * Fährt dauerhaft eine Kurve mit asymmetrischer Leistung.
     */
    //% block="fahre Kurve mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Bewegung (Dauerhaft)"
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=-20
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=40
    //% weight=90
    export function fahreDauerhaft(leistungLinks: number, leistungRechts: number): void {
        NezhaMotors.fahreDauerhaft(leistungLinks, leistungRechts);
    }

    /**
     * Stoppt sofort alle konfigurierten Motoren.
     */
    //% block="stoppe alle Motoren"
    //% group="Bewegung (Dauerhaft)"
    //% weight=80
    export function stoppeAlleMotoren(): void {
        NezhaMotors.stoppeAlleMotoren();
    }


    // ==========================================
    // Gruppe: Bewegung (Präzise/Blockierend)
    // ==========================================

    /**
     * Dreht den Roboter präzise auf der Stelle um eine bestimmte Gradzahl.
     */
    //% block="drehe auf der Stelle um $grad ° nach $richtung mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% grad.defl=90
    //% leistung.min=1 leistung.max=100 leistung.defl=50
    //% weight=100
    export function dreheRoboterAufDerStelle(grad: number, richtung: NezhaMotors.TurnDirection, leistung: number): void {
        NezhaMotors.dreheRoboterAufDerStelle(grad, richtung, leistung);
    }

    /**
     * Fährt für eine vorgegebene Zeit (in Millisekunden) geradeaus.
     */
    //% block="fahre $ms ms mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% ms.shadow=timePicker ms.defl=500
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    //% weight=90
    export function fahreZeit(ms: number, leistung: number): void {
        NezhaMotors.fahreZeit(leistung, ms);
    }

    /**
     * Fährt für eine vorgegebene Zeit eine Kurve.
     */
    //% block="fahre fuer $ms ms Kurve mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Bewegung (Präzise/Blockierend)"
    //% ms.shadow=timePicker ms.defl=500
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=10
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=40
    //% weight=80
    export function fahreKurveZeit(ms: number, leistungLinks: number, leistungRechts: number): void {
        NezhaMotors.fahreKurveZeit(leistungLinks, leistungRechts, ms);
    }

    /**
     * Fährt geradeaus, basierend auf der Anzahl der Radumdrehungen.
     */
    //% block="fahre $umdrehungen Umdrehungen mit $leistung % Leistung"
    //% group="Bewegung (Präzise/Blockierend)"
    //% umdrehungen.defl=1
    //% leistung.min=-100 leistung.max=100 leistung.defl=50
    //% weight=70
    export function fahreUmdrehungen(umdrehungen: number, leistung: number): void {
        NezhaMotors.fahreUmdrehungen(leistung, umdrehungen);
    }

    /**
     * Fährt eine Kurve, basierend auf der Anzahl der Radumdrehungen des inneren Rades.
     */
    //% block="fahre für $umdrehungen Umdrehungen Kurve mit $leistungLinks % links und $leistungRechts % rechts"
    //% group="Bewegung (Präzise/Blockierend)"
    //% umdrehungen.defl=1
    //% leistungLinks.min=-100 leistungLinks.max=100 leistungLinks.defl=10
    //% leistungRechts.min=-100 leistungRechts.max=100 leistungRechts.defl=40
    //% weight=60
    export function fahreKurveUmdrehungen(umdrehungen: number, leistungLinks: number, leistungRechts: number): void {
        NezhaMotors.fahreKurveUmdrehungen(leistungLinks, leistungRechts, umdrehungen);
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
}
