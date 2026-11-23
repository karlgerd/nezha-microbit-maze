/**
 * Sensoren für den Labyrinth-Roboter: Abstand (ToF), Farbe (TCS3430) mit Beleuchtung und Neigung.
 */
//% color="#B8460B" icon="\uf1de" block="Robo-Sensoren" weight=114
//% groups='["ToF-Abstandssensor", "Farbsensor", "Beleuchtung", "Neigung"]'
namespace sensoren {

    /** J-Ports des Nezha-Boards für Grove-Geräte: Signal an Pin 4 des Ports. */
    export enum GrovePort {
        //% block="J1"
        J1 = DigitalPin.P1,
        //% block="J2"
        J2 = DigitalPin.P2,
        //% block="J3"
        J3 = DigitalPin.P13,
        //% block="J4"
        J4 = DigitalPin.P15
    }

    export enum Verstaerkung {
        //% block="1x"
        X1 = 0,
        //% block="4x"
        X4 = 1,
        //% block="16x"
        X16 = 2,
        //% block="64x"
        X64 = 3,
        //% block="128x"
        X128 = 4
    }

    export enum Farbwert {
        //% block="X"
        X = 3,
        //% block="Y"
        Y = 1,
        //% block="Z"
        Z = 0
    }

    // ==========================================
    // ToF-Abstandssensor
    // ==========================================

    /**
     * Initialisiert einen ToF-Abstandssensor am Pa.Hub. Gehört in "beim Start".
     * Bei einem Fehler zeigt der micro:bit einen Code: H = Pa.Hub antwortet nicht,
     * T und Port = kein ToF-Sensor am Port, ? und Port = anderes Gerät am Port.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_tof_init
    //% block="initialisiere ToF-Sensor an Pa.Hub-Port $port"
    //% group="ToF-Abstandssensor" weight=100
    //% port.min=0 port.max=5 port.defl=0
    export function initialisiereToF(port: number): void {
        let ergebnis = nezhaToF.init(port);
        if (ergebnis === nezhaToF.InitResult.NoHub) {
            basic.showString("H");
        } else if (ergebnis === nezhaToF.InitResult.NoSensor) {
            basic.showString("T" + port);
        } else if (ergebnis === nezhaToF.InitResult.WrongDevice) {
            basic.showString("?" + port);
        }
    }

    /**
     * Misst den Abstand in Millimetern.
     * Liefert 9999, wenn kein Hindernis in Reichweite ist, und -1, wenn der Sensor nicht antwortet.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_tof_distance
    //% block="Abstand in mm an Port $port"
    //% group="ToF-Abstandssensor" weight=90
    //% port.min=0 port.max=5 port.defl=0
    export function abstandMm(port: number): number {
        return nezhaToF.readSingle(port);
    }

    // ==========================================
    // Farbsensor (TCS3430)
    // ==========================================

    /**
     * Initialisiert den Farbsensor. Gehört in "beim Start".
     * Der Sensor hängt direkt an einem I2C-Anschluss des Nezha-Boards (nicht am Pa.Hub).
     * Höhere Verstärkung und längere Messzeit ergeben größere Werte. Bei zu viel Licht
     * bleiben die Werte am Maximum hängen, dann Verstärkung oder Messzeit verringern.
     * Bei einem Fehler zeigt der micro:bit einen Code: F = Farbsensor antwortet nicht,
     * ?F = an der Adresse 0x39 antwortet ein anderes Gerät.
     * @param verstaerkung Verstärkung des Sensors
     * @param messzeit Messzeit in ms (3 bis 711)
     */
    //% blockId=nezhamaze_color_init
    //% block="initialisiere Farbsensor mit Verstärkung $verstaerkung Messzeit $messzeit ms"
    //% verstaerkung.defl=sensoren.Verstaerkung.X16
    //% messzeit.min=3 messzeit.max=711 messzeit.defl=100
    //% group="Farbsensor" weight=100
    export function initialisiereFarbsensor(verstaerkung: Verstaerkung, messzeit: number): void {
        let ergebnis = nezhaColor.init(verstaerkung as number, messzeit);
        if (ergebnis === nezhaColor.InitResult.NoSensor) {
            basic.showString("F");
        } else if (ergebnis === nezhaColor.InitResult.WrongDevice) {
            basic.showString("?F");
        }
    }

    /**
     * Gibt einen Farbwert der letzten Messung zurück. Der größte mögliche Wert hängt
     * von der Messzeit ab: etwa 1024 je 2,78 ms, höchstens 65535 (bei 100 ms ca. 36800).
     * Der Sensor misst fortlaufend, ein neuer Wert liegt jeweils nach der Messzeit vor.
     * X entspricht grob dem Rotanteil, Y der Helligkeit, Z dem Blauanteil.
     */
    //% blockId=nezhamaze_color_value
    //% block="Farbwert $kanal"
    //% group="Farbsensor" weight=90
    export function farbwert(kanal: Farbwert): number {
        return nezhaColor.read(kanal as number);
    }

    // ==========================================
    // Beleuchtung (LED-Ring unter dem Farbsensor)
    // ==========================================

    /**
     * Initialisiert den LED-Ring (20 LEDs) an einem J-Port und schaltet ihn aus.
     * Gehört in "beim Start". Das Signal liegt an Pin 4 des Ports
     * (J1 = P1, J2 = P2, J3 = P13, J4 = P15).
     */
    //% blockId=nezhamaze_ring_init
    //% block="initialisiere LED-Ring an Port $port"
    //% port.defl=sensoren.GrovePort.J1
    //% group="Beleuchtung" weight=40
    export function initialisiereLedRing(port: GrovePort): void {
        nezhaLedRing.init(<number>port);
    }

    /**
     * Schaltet eine Anzahl LEDs gleichmäßig verteilt ein, alle anderen aus.
     * Die Helligkeit ergibt sich aus den Farbwerten, z. B. 100, 100, 100 = gedimmtes Weiß.
     * @param anzahl Anzahl der leuchtenden LEDs (0-20)
     * @param rot Rotanteil (0-255)
     * @param gruen Grünanteil (0-255)
     * @param blau Blauanteil (0-255)
     */
    //% blockId=nezhamaze_ring_light
    //% block="Beleuchtung: $anzahl LEDs mit R $rot G $gruen B $blau"
    //% anzahl.min=0 anzahl.max=20 anzahl.defl=5
    //% rot.min=0 rot.max=255 rot.defl=255
    //% gruen.min=0 gruen.max=255 gruen.defl=255
    //% blau.min=0 blau.max=255 blau.defl=255
    //% inlineInputMode=inline
    //% group="Beleuchtung" weight=30
    export function beleuchtung(anzahl: number, rot: number, gruen: number, blau: number): void {
        nezhaLedRing.light(anzahl, rot, gruen, blau);
    }

    /**
     * Schaltet alle LEDs des Rings aus.
     */
    //% blockId=nezhamaze_ring_off
    //% block="Beleuchtung aus"
    //% group="Beleuchtung" weight=20
    export function beleuchtungAus(): void {
        nezhaLedRing.off();
    }

    // ==========================================
    // Neigung
    // ==========================================

    /**
     * Löst aus, wenn der Roboter 1 Sekunde lang nach vorne (bergab) geneigt ist.
     * Der USB-Anschluss des micro:bit muss nach vorne zeigen.
     */
    //% blockId=nezhamaze_tilt_down
    //% block="wenn bergab (mehr als $grad °)"
    //% group="Neigung" weight=100
    //% grad.min=5 grad.max=60 grad.defl=15
    export function wennBergab(grad: number, handler: () => void): void {
        nezhaTilt.registerDown(nezhaTilt.degreesToMg(grad), handler);
    }

    /**
     * Löst aus, wenn der Roboter 1 Sekunde lang nach hinten (bergauf) geneigt ist.
     * Der USB-Anschluss des micro:bit muss nach vorne zeigen.
     */
    //% blockId=nezhamaze_tilt_up
    //% block="wenn bergauf (mehr als $grad °)"
    //% group="Neigung" weight=90
    //% grad.min=5 grad.max=60 grad.defl=15
    export function wennBergauf(grad: number, handler: () => void): void {
        nezhaTilt.registerUp(nezhaTilt.degreesToMg(grad), handler);
    }

    /**
     * Löst aus, wenn der Roboter wieder waagerecht steht (Neigung unter ca. 11,5°).
     * Nach einer Fahrt bergauf sofort, sonst nach 1 Sekunde.
     */
    //% blockId=nezhamaze_tilt_flat
    //% block="wenn waagerecht"
    //% group="Neigung" weight=80
    export function wennWaagerecht(handler: () => void): void {
        nezhaTilt.registerFlat(handler);
    }
}
