/**
 * Sensoren für den Labyrinth-Roboter (Neigung, Farbe, Distanz).
 */
//% color="#942222" icon="\uf1de" block="Sensoren" weight=95
namespace robotSensors {

      export enum RgbColor {
        //% block="Rot"
        Red,
        //% block="Grün"
        Green,
        //% block="Blau"
        Blue
    }

    export enum RgbRawChannel {
        //% block="Rot"
        Red,
        //% block="Grün"
        Green,
        //% block="Blau"
        Blue,
        //% block="Helligkeit (Clear)"
        Clear
    }

    /**
     * Initialisiert den RGB-Farbsensor an einem bestimmten Pa.Hub-Pin.
     * Dieser Block muss vor der ersten Messung ausgeführt werden.
     * @param channel Der Pin am Pa.Hub (0-5), an dem der Sensor angeschlossen ist.
     */
    //% group="RGB-Farbsensor"
    //% block="initialisiere RGB-Sensor an PaHub-Pin %channel"
    //% channel.min=0 channel.max=5 channel.defl=1
    //% color="##FFC700"
    //% weight=65
    export function initialisiereRGB(channel: number): void {
        nezhaInternalSensors.startRgb(channel);
    }

    /**
     * Gibt den skalierten Farbwert (0-255) des RGB-Sensors in Relation zur Gesamthelligkeit zurück.
     * @param color Die zu messende Farbe (Rot, Grün oder Blau)
     * @param channel Der Pin am Pa.Hub (0-5)
     */
    //% group="RGB-Farbsensor"
    //% block="relativer Farbwert (0-255) %color von RGB-Sensor an PaHub-Pin %channel"
    //% channel.min=0 channel.max=5 channel.defl=1
    //% color="##FFC700"
    //% weight=60
    export function farbwertRGB(color: RgbColor, channel: number): number {
        if (color === RgbColor.Red) {
            return nezhaInternalSensors.getRed(channel);
        } else if (color === RgbColor.Green) {
            return nezhaInternalSensors.getGreen(channel);
        } else {
            return nezhaInternalSensors.getBlue(channel);
        }
    }

    /**
     * Gibt den absoluten Rohwert (16-Bit) des RGB-Sensors zurück.
     * @param rawChannel Der Messkanal (Rot, Grün, Blau, Helligkeit)
     * @param channel Der Pin am Pa.Hub (0-5)
     */
    //% group="RGB-Farbsensor"
    //% block="Rohwert %rawChannel von RGB-Sensor an PaHub-Pin %channel"
    //% channel.min=0 channel.max=5 channel.defl=1
    //% color="##FFC700"
    //% weight=55
    export function rohwertRGB(rawChannel: RgbRawChannel, channel: number): number {
        if (rawChannel === RgbRawChannel.Red) {
            return nezhaInternalSensors.getRedRaw(channel);
        } else if (rawChannel === RgbRawChannel.Green) {
            return nezhaInternalSensors.getGreenRaw(channel);
        } else if (rawChannel === RgbRawChannel.Blue) {
            return nezhaInternalSensors.getBlueRaw(channel);
        } else {
            return nezhaInternalSensors.getClearRaw(channel);
        }
    }
    /**
     * Initialisiert den ToF-Sensor an einem bestimmten Pa.Hub-Pin.
     * Dieser Block muss im "beim Start"-Block ausgeführt werden, bevor Entfernungen gemessen werden können.
     * @param channel Der Pin am Pa.Hub (0-5), an dem der Sensor angeschlossen ist.
     */
    //% group="ToF-Abstandssensor"
    //% block="initialisiere ToF-Sensor an PaHub-Pin %channel"
    //% channel.min=0 channel.max=5 channel.defl=0
    //% weight=75
    export function initialisiereToF(channel: number): void {
        nezhaInternalSensors.init(channel);
    }
    
     /**
     * Gibt den gemessenen Abstand des ToF-Sensors in Millimetern (mm) zurück.
     * @param channel Der Pin am Pa.Hub (0-5), an dem der Sensor angeschlossen ist.
     */
    //% group="ToF-Abstandssensor"
    //% block="Abstand in mm von ToF-Sensor an PaHub-Pin %channel"
    //% channel.min=0 channel.max=5 channel.defl=0
    //% weight=70
    export function abstandToF_mm(channel: number): number {
        return nezhaInternalSensors.readSingle(channel);
    }

    
    /**
     * Löst aus, wenn der Roboter dauerhaft (1s) nach vorne (bergab) kippt.
     * Geht davon aus, dass der USB-Anschluss nach vorne zeigt.
     */
    //% group="Neigungssensor"
    //% color="#9EB8A0"
    //% block="wenn bergab (mit mehr als %grad °)"
    //% grad.min=5 grad.max=60 grad.defl=15
    //% weight=100
    export function wennBergab(grad: number, handler: () => void): void {
        let thresholdMg = -(Math.sin(grad * Math.PI / 180) * 1024);
        nezhaInternalSensors.onTiltDown(thresholdMg, handler);
    }

    /**
     * Löst aus, wenn der Roboter dauerhaft (1s) nach hinten (bergauf) kippt.
     * Geht davon aus, dass der USB-Anschluss nach vorne zeigt.
     */
    //% group="Neigungssensor"
    //% color="#9EB8A0"
    //% block="wenn bergauf (mit mehr als %grad °)"
    //% grad.min=5 grad.max=60 grad.defl=15
    //% weight=90
    export function wennBergauf(grad: number, handler: () => void): void {
        let thresholdMg = (Math.sin(grad * Math.PI / 180) * 1024);
        nezhaInternalSensors.onTiltUp(thresholdMg, handler);
    }

    /**
    * Löst aus, wenn der Roboter wieder waagerecht steht (Rampe verlassen).
    * Reagiert sehr schnell (200ms) mit einer Toleranz von unter ca. 11,5 Grad.
    */
    //% group="Neigungssensor"
    //% color="#9EB8A0"
    //% block="wenn Roboter (wieder) waagerecht steht"
    //% weight=80
    export function wennWaagerecht(handler: () => void): void {
        // Schwellenwert auf 200 mg erhöht (ca. 11,5 Grad Toleranz) für frühes Umschalten
        let thresholdMg = 200; 
        nezhaInternalSensors.onFlat(thresholdMg, handler);
    }
}
