/**
 * Sensoren für den Labyrinth-Roboter (Neigung, Farbe, Distanz).
 */
//% color="#D40000" icon="\uf1de" block="Sensoren" weight=95
namespace robotSensors {

    let onTiltDownCallback: () => void = null;
    let onTiltUpCallback: () => void = null;
    
    let isTiltMonitoringRunning = false;
    let tiltDownThresholdMg = -260; 
    let tiltUpThresholdMg = 260;

    // Startet eine zentrale Hintergrundschleife für alle Neigungs-Ereignisse
    function startTiltMonitoring() {
        if (!isTiltMonitoringRunning) {
            isTiltMonitoringRunning = true;
            control.inBackground(function () {
                let warGekipptUnten = false;
                let warGekipptOben = false;
                
                while (true) {
                    let y = input.acceleration(Dimension.Y);
                    
                    // Auswertung für "nach unten" (bergab)
                    if (onTiltDownCallback) {
                        let istGekipptUnten = (y < tiltDownThresholdMg);
                        if (istGekipptUnten && !warGekipptUnten) {
                            onTiltDownCallback();
                        }
                        warGekipptUnten = istGekipptUnten;
                    }

                    // Auswertung für "nach oben" (bergauf)
                    if (onTiltUpCallback) {
                        let istGekipptOben = (y > tiltUpThresholdMg);
                        if (istGekipptOben && !warGekipptOben) {
                            onTiltUpCallback();
                        }
                        warGekipptOben = istGekipptOben;
                    }
                    
                    basic.pause(50);
                }
            });
        }
    }

    /**
     * Löst aus, wenn der Roboter nach vorne (bergab) kippt.
     * Geht davon aus, dass der USB-Anschluss nach vorne zeigt.
     */
    //% block="wenn Roboter nach unten kippt (mehr als %grad °)"
    //% grad.min=5 grad.max=60 grad.defl=15
    //% weight=100
    export function wennKipptUnten(grad: number, handler: () => void): void {
        tiltDownThresholdMg = -(Math.sin(grad * Math.PI / 180) * 1024);
        onTiltDownCallback = handler;
        startTiltMonitoring();
    }

    /**
     * Löst aus, wenn der Roboter nach hinten (bergauf) kippt.
     * Geht davon aus, dass der USB-Anschluss nach vorne zeigt.
     */
    //% block="wenn Roboter nach oben kippt (mehr als %grad °)"
    //% grad.min=5 grad.max=60 grad.defl=15
    //% weight=90
    export function wennKipptOben(grad: number, handler: () => void): void {
        tiltUpThresholdMg = (Math.sin(grad * Math.PI / 180) * 1024);
        onTiltUpCallback = handler;
        startTiltMonitoring();
    }
}
