/**
 * Sensoren für den Labyrinth-Roboter (Neigung, Farbe, Distanz).
 */
//% color="#D40000" icon="\uf1de" block="Sensoren" weight=95
namespace robotSensors {

    /**
     * Löst aus, wenn der Roboter dauerhaft (1s) nach vorne (bergab) kippt.
     * Geht davon aus, dass der USB-Anschluss nach vorne zeigt.
     */
    //% block="wenn bergab mit (mit mehr als %grad °)"
    //% grad.min=5 grad.max=60 grad.defl=15
    //% weight=100
    export function wennKipptUnten(grad: number, handler: () => void): void {
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
    export function wennKipptOben(grad: number, handler: () => void): void {
        let thresholdMg = (Math.sin(grad * Math.PI / 180) * 1024);
        nezhaInternalSensors.onTiltUp(thresholdMg, handler);
    }

    /**
     * Löst aus, wenn der Roboter wieder dauerhaft (1s) waagerecht steht (Rampe verlassen).
     * Toleranzbereich liegt bei einer Neigung von unter ca. 5 Grad.
     */
    //% block="wenn Roboter (wieder) waagerecht steht"
    //% weight=80
    export function wennWaagerecht(handler: () => void): void {
        // Schwellenwert für ca. 5 Grad Toleranz (sin(5°) * 1024 = ~89 mg)
        let thresholdMg = 90; 
        nezhaInternalSensors.onFlat(thresholdMg, handler);
    }
}
