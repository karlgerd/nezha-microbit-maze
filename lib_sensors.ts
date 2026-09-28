namespace nezhaInternalSensors {

    let onTiltDownCallback: () => void = null;
    let onTiltUpCallback: () => void = null;
    let onFlatCallback: () => void = null; // NEU
    
    let isTiltMonitoringRunning = false;
    let tiltDownThresholdMg = -260; 
    let tiltUpThresholdMg = 260;
    let flatThresholdMg = 90; // NEU: Toleranz für die waagerechte Position

    function startTiltMonitoring() {
        if (!isTiltMonitoringRunning) {
            isTiltMonitoringRunning = true;
            control.inBackground(function () {
                let tiltDownStartTime = 0;
                let tiltUpStartTime = 0;
                let flatStartTime = 0; // NEU
                
                let tiltDownFired = false;
                let tiltUpFired = false;
                let flatFired = false; // NEU
                
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
                    
                    // NEU: Auswertung für "waagerecht" (Rampe verlassen)
                    if (onFlatCallback) {
                        // Prüft, ob der Wert zwischen -flatThresholdMg und +flatThresholdMg liegt
                        if (Math.abs(y) < flatThresholdMg) {
                            if (flatStartTime === 0) {
                                flatStartTime = currentTime;
                            } else if (currentTime - flatStartTime >= 1000) {
                                if (!flatFired) {
                                    onFlatCallback();
                                    flatFired = true;
                                }
                            }
                        } else {
                            flatStartTime = 0;
                            flatFired = false;
                        }
                    }
                    
                    basic.pause(50);
                }
            });
        }
    }

    export function onTiltDown(thresholdMg: number, handler: () => void) {
        tiltDownThresholdMg = thresholdMg;
        onTiltDownCallback = handler;
        startTiltMonitoring();
    }

    export function onTiltUp(thresholdMg: number, handler: () => void) {
        tiltUpThresholdMg = thresholdMg;
        onTiltUpCallback = handler;
        startTiltMonitoring();
    }

    // NEU: Registriert den Callback für die waagerechte Position
    export function onFlat(thresholdMg: number, handler: () => void) {
        flatThresholdMg = thresholdMg;
        onFlatCallback = handler;
        startTiltMonitoring();
    }
}
