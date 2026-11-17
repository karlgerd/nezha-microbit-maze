/**
 * Sensoren für den Labyrinth-Roboter: Abstand (ToF), Farbe (RGB) und Neigung.
 */
//% color="#942222" icon="\uf1de" block="Sensoren" weight=95
//% groups='["ToF-Abstandssensor", "RGB-Farbsensor", "Neigung"]'
namespace sensoren {

    export enum Farbe {
        //% block="Rot"
        Rot = 0,
        //% block="Grün"
        Gruen = 1,
        //% block="Blau"
        Blau = 2
    }

    export enum Farbkanal {
        //% block="Rot"
        Rot = 0,
        //% block="Grün"
        Gruen = 1,
        //% block="Blau"
        Blau = 2,
        //% block="Helligkeit"
        Helligkeit = 3
    }

    // ==========================================
    // ToF-Abstandssensor
    // ==========================================

    /**
     * Initialisiert einen ToF-Abstandssensor am Pa.Hub. Gehört in "beim Start".
     * Antwortet der Sensor nicht, zeigt der micro:bit ein X und die Portnummer an.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_tof_init
    //% block="initialisiere ToF-Sensor an Pa.Hub-Port $port"
    //% group="ToF-Abstandssensor" weight=100
    //% port.min=0 port.max=5 port.defl=0
    export function initialisiereToF(port: number): void {
        if (!nezhaToF.init(port)) {
            basic.showIcon(IconNames.No);
            basic.showNumber(port);
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
    // RGB-Farbsensor
    // ==========================================

    /**
     * Initialisiert einen RGB-Farbsensor am Pa.Hub. Gehört in "beim Start".
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_rgb_init
    //% block="initialisiere RGB-Sensor an Pa.Hub-Port $port"
    //% group="RGB-Farbsensor" weight=100
    //% port.min=0 port.max=5 port.defl=1
    export function initialisiereRGB(port: number): void {
        nezhaRgb.start(port);
    }

    /**
     * Misst die Farbe und speichert die Werte. Danach liefern die Farbwert-Blöcke die neuen Werte.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_rgb_update
    //% block="miss Farbe an Port $port"
    //% group="RGB-Farbsensor" weight=90
    //% port.min=0 port.max=5 port.defl=1
    export function missFarbe(port: number): void {
        nezhaRgb.update(port);
    }

    /**
     * Anteil einer Farbe (0-255) an der zuletzt gemessenen Gesamthelligkeit.
     * Vorher "miss Farbe" ausführen.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_rgb_relative
    //% block="Farbanteil $farbe (0-255) an Port $port"
    //% group="RGB-Farbsensor" weight=80
    //% port.min=0 port.max=5 port.defl=1
    export function farbanteil(farbe: Farbe, port: number): number {
        return nezhaRgb.relative(port, farbe);
    }

    /**
     * Zuletzt gemessener Rohwert (0-65535) eines Farbkanals.
     * Vorher "miss Farbe" ausführen.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_rgb_raw
    //% block="Rohwert $kanal an Port $port"
    //% group="RGB-Farbsensor" weight=70
    //% port.min=0 port.max=5 port.defl=1
    export function rohwert(kanal: Farbkanal, port: number): number {
        return nezhaRgb.raw(port, kanal);
    }

    /**
     * Alle zuletzt gemessenen Rohwerte als Liste: [Rot, Grün, Blau, Helligkeit].
     * Vorher "miss Farbe" ausführen.
     * @param port Port am Pa.Hub (0-5)
     */
    //% blockId=nezhamaze_rgb_raw_list
    //% block="Rohwerte als Liste an Port $port"
    //% group="RGB-Farbsensor" weight=60
    //% port.min=0 port.max=5 port.defl=1
    export function rohwerteListe(port: number): number[] {
        return [
            nezhaRgb.raw(port, 0),
            nezhaRgb.raw(port, 1),
            nezhaRgb.raw(port, 2),
            nezhaRgb.raw(port, 3)
        ];
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
