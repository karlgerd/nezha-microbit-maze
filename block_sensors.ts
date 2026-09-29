/**
 * Sensoren für den Labyrinth-Roboter (Neigung, Farbe, Distanz).
 */
//% color="#D40000" icon="\uf1de" block="Sensoren" weight=95
namespace robotSensors {


    /**
     * Initialisiert den ToF-Sensor an einem bestimmten Pa.Hub-Pin.
     * Dieser Block muss im "beim Start"-Block ausgeführt werden, bevor Entfernungen gemessen werden können.
     * @param channel Der Pin am Pa.Hub (0-5), an dem der Sensor angeschlossen ist.
     */
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
    //% block="wenn Roboter (wieder) waagerecht steht"
    //% weight=80
    export function wennWaagerecht(handler: () => void): void {
        // Schwellenwert auf 200 mg erhöht (ca. 11,5 Grad Toleranz) für frühes Umschalten
        let thresholdMg = 200; 
        nezhaInternalSensors.onFlat(thresholdMg, handler);
    }
}
