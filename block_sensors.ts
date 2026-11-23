/**
 * Sensoren für den Labyrinth-Roboter: Abstand (ToF), Farbe (TCS3430) und Neigung.
 */
//% color="#B8460B" icon="\uf1de" block="Robo-Sensoren" weight=114
//% groups='["ToF-Abstandssensor", "Farbsensor", "Neigung"]'
namespace sensoren {

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
     * Bei einem Fehler zeigt der micro:bit einen Code: F = Farbsensor antwortet nicht,
     * ?F = an der Adresse 0x39 antwortet ein anderes Gerät.
     */
    //% blockId=nezhamaze_color_init
    //% block="initialisiere Farbsensor"
    //% group="Farbsensor" weight=100
    export function initialisiereFarbsensor(): void {
        let ergebnis = nezhaColor.init();
        if (ergebnis === nezhaColor.InitResult.NoSensor) {
            basic.showString("F");
        } else if (ergebnis === nezhaColor.InitResult.WrongDevice) {
            basic.showString("?F");
        }
    }

    /**
     * Gibt einen Farbwert der letzten Messung zurück (0 bis ca. 37000).
     * Der Sensor misst fortlaufend etwa alle 0,1 Sekunden.
     * X entspricht grob dem Rotanteil, Y der Helligkeit, Z dem Blauanteil.
     */
    //% blockId=nezhamaze_color_value
    //% block="Farbwert $kanal"
    //% group="Farbsensor" weight=90
    export function farbwert(kanal: Farbwert): number {
        return nezhaColor.read(kanal as number);
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
