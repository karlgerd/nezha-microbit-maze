namespace nezhaInternalSensors {

    let onTiltDownCallback: () => void;
    let onTiltUpCallback: () => void;
    let onFlatCallback: () => void;
    
    let isTiltMonitoringRunning = false;
    let tiltDownThresholdMg = -260; 
    let tiltUpThresholdMg = 260;
    let flatThresholdMg = 200; // Toleranz für die Waagerechte erhöht

    function startTiltMonitoring() {
        if (!isTiltMonitoringRunning) {
            isTiltMonitoringRunning = true;
            control.inBackground(function () {
                let currentState = -99;
                let pendingState = -99;
                let stateStartTime = 0;
                
                while (true) {
                    let y = input.acceleration(Dimension.Y);
                    let currentTime = input.runningTime();
                    
                    let measuredState = pendingState; 
                    
                    if (y < tiltDownThresholdMg) {
                        measuredState = -1;
                    } else if (y > tiltUpThresholdMg) {
                        measuredState = 1;
                    } else if (Math.abs(y) < flatThresholdMg) {
                        measuredState = 0;
                    }

                    if (measuredState !== pendingState) {
                        pendingState = measuredState;
                        stateStartTime = currentTime;
                    } else {
                        // Standard-Verzögerung für alle Wechsel: 1000 ms
                        let requiredDelay = 1000;
                        
                        // Spezialfall: Von bergauf (1) in die Ebene (0) -> sofort auslösen (0 ms)
                        if (pendingState === 0 && currentState === 1) {
                            requiredDelay = 0;
                        }
                        
                        if (currentTime - stateStartTime >= requiredDelay) {
                            if (currentState !== pendingState) {
                                currentState = pendingState;
                                
                                if (currentState === -1 && onTiltDownCallback) {
                                    onTiltDownCallback();
                                } else if (currentState === 1 && onTiltUpCallback) {
                                    onTiltUpCallback();
                                } else if (currentState === 0 && onFlatCallback) {
                                    onFlatCallback();
                                }
                            }
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

    export function onFlat(thresholdMg: number, handler: () => void) {
        flatThresholdMg = thresholdMg;
        onFlatCallback = handler;
        startTiltMonitoring();
    }
}
