namespace nezhaInternalSensors {

    let onTiltDownCallback: () => void = null;
    let onTiltUpCallback: () => void = null;
    
    let isTiltMonitoringRunning = false;
    let tiltDownThresholdMg = -260; 
    let tiltUpThresholdMg = 260;

    // Startet die zentrale Hintergrundschleife für die Neigungs-Ereignisse
    function startTiltMonitoring() {
        if (!isTiltMonitoringRunning) {
            isTiltMonitoringRunning = true;
            control.inBackground(function () {
                let tiltDownStartTime = 0;
                let tiltUpStartTime = 0;
                
                let tiltDownFired = false;
                let tiltUpFired = false;
                
                while (true) {
                    let y = input.acceleration(Dimension.Y);
                    let currentTime = input.runningTime();
                    
                    // Auswertung für "nach unten" (bergab)
                    if (onTiltDownCallback) {
                        if (y < tiltDownThresholdMg) {
                            if (tiltDownStartTime === 0) {
                                tiltDownStartTime = currentTime;
                            } else if (currentTime - tiltDownStartTime >= 1000) {
                                if (!tiltDownFired) {
                                    onTiltDownCallback();
                                    tiltDownFired = true;
                                }
                            }
                        } else {
                            tiltDownStartTime = 0;
                            tiltDownFired = false;
                        }
                    }

                    // Auswertung für "nach oben" (bergauf)
                    if (onTiltUpCallback) {
                        if (y > tiltUpThresholdMg) {
                            if (tiltUpStartTime === 0) {
                                tiltUpStartTime = currentTime;
                            } else if (currentTime - tiltUpStartTime >= 1000) {
                                if (!tiltUpFired) {
                                    onTiltUpCallback();
                                    tiltUpFired = true;
                                }
                            }
                        } else {
                            tiltUpStartTime = 0;
                            tiltUpFired = false;
                        }
                    }
                    
                    basic.pause(50);
                }
            });
        }
    }

    // Registriert den Callback für das Kippen nach unten
    export function onTiltDown(thresholdMg: number, handler: () => void) {
        tiltDownThresholdMg = thresholdMg;
        onTiltDownCallback = handler;
        startTiltMonitoring();
    }

    // Registriert den Callback für das Kippen nach oben
    export function onTiltUp(thresholdMg: number, handler: () => void) {
        tiltUpThresholdMg = thresholdMg;
        onTiltUpCallback = handler;
        startTiltMonitoring();
    }
}
