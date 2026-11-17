/**
 * Interner Treiber für VL53L1X ToF-Abstandssensoren am Pa.Hub (Kanäle 0-5).
 * Nicht im Block-Menü sichtbar.
 */
namespace nezhaToF {
    /** Rückgabewert, wenn kein Ziel in Reichweite ist. */
    export const OUT_OF_RANGE = 9999;
    /** Rückgabewert, wenn der Sensor nicht antwortet. */
    export const ERROR = -1;

    // Register-Konstanten
    const SOFT_RESET = 0x0000
    const OSC_MEASURED__FAST_OSC__FREQUENCY = 0x0006
    const VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND = 0x0008
    const VHV_CONFIG__INIT = 0x000B
    const ALGO__PART_TO_PART_RANGE_OFFSET_MM = 0x001E
    const MM_CONFIG__OUTER_OFFSET_MM = 0x0022
    const DSS_CONFIG__TARGET_TOTAL_RATE_MCPS = 0x0024
    const PAD_I2C_HV__EXTSUP_CONFIG = 0x002E
    const GPIO__TIO_HV_STATUS = 0x0031
    const SIGMA_ESTIMATOR__EFFECTIVE_PULSE_WIDTH_NS = 0x0036
    const SIGMA_ESTIMATOR__EFFECTIVE_AMBIENT_WIDTH_NS = 0x0037
    const ALGO__CROSSTALK_COMPENSATION_VALID_HEIGHT_MM = 0x0039
    const ALGO__RANGE_IGNORE_VALID_HEIGHT_MM = 0x003E
    const ALGO__RANGE_MIN_CLIP = 0x003F
    const ALGO__CONSISTENCY_CHECK__TOLERANCE = 0x0040
    const CAL_CONFIG__VCSEL_START = 0x0047
    const PHASECAL_CONFIG__TIMEOUT_MACROP = 0x004B
    const PHASECAL_CONFIG__OVERRIDE = 0x004D
    const DSS_CONFIG__ROI_MODE_CONTROL = 0x004F
    const SYSTEM__THRESH_RATE_HIGH = 0x0050
    const SYSTEM__THRESH_RATE_LOW = 0x0052
    const DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT = 0x0054
    const DSS_CONFIG__APERTURE_ATTENUATION = 0x0057
    const MM_CONFIG__TIMEOUT_MACROP_A = 0x005A
    const MM_CONFIG__TIMEOUT_MACROP_B = 0x005C
    const RANGE_CONFIG__TIMEOUT_MACROP_A = 0x005E
    const RANGE_CONFIG__VCSEL_PERIOD_A = 0x0060
    const RANGE_CONFIG__TIMEOUT_MACROP_B = 0x0061
    const RANGE_CONFIG__VCSEL_PERIOD_B = 0x0063
    const RANGE_CONFIG__SIGMA_THRESH = 0x0064
    const RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS = 0x0066
    const RANGE_CONFIG__VALID_PHASE_HIGH = 0x0069
    const SYSTEM__GROUPED_PARAMETER_HOLD_0 = 0x0071
    const SYSTEM__SEED_CONFIG = 0x0077
    const SD_CONFIG__WOI_SD0 = 0x0078
    const SD_CONFIG__WOI_SD1 = 0x0079
    const SD_CONFIG__INITIAL_PHASE_SD0 = 0x007A
    const SD_CONFIG__INITIAL_PHASE_SD1 = 0x007B
    const SYSTEM__GROUPED_PARAMETER_HOLD_1 = 0x007C
    const SD_CONFIG__QUANTIFIER = 0x007E
    const SYSTEM__SEQUENCE_CONFIG = 0x0081
    const SYSTEM__GROUPED_PARAMETER_HOLD = 0x0082
    const SYSTEM__INTERRUPT_CLEAR = 0x0086
    const SYSTEM__MODE_START = 0x0087
    const RESULT__RANGE_STATUS = 0x0089
    const PHASECAL_RESULT__VCSEL_START = 0x00D8
    const RESULT__OSC_CALIBRATE_VAL = 0x00DE
    const FIRMWARE__SYSTEM_STATUS = 0x00E5

    const RANGE_STATUS_OUT_OF_BOUNDS = 4
    const TARGET_RATE = 0x0A00
    const TIMING_GUARD = 4528
    const TIMING_BUDGET_US = 50000
    const I2C_ADDR = 0x29
    const IO_TIMEOUT_MS = 500

    // Kanalspezifischer Zustand für die 6 Pa.Hub-Kanäle
    let initialised: boolean[] = [false, false, false, false, false, false]
    let calibrated: boolean[] = [false, false, false, false, false, false]
    let fastOscFrequency: number[] = [1, 1, 1, 1, 1, 1]

    // Messergebnis des letzten Auslesevorgangs
    let rangeStatus = 0
    let spadCount = 0
    let ambientRate = 0
    let rangeRaw = 0
    let peakSignalRate = 0

    let timeoutStartMs = 0

    /**
     * Initialisiert den Sensor am angegebenen Kanal.
     * @returns true, wenn der Sensor geantwortet hat
     */
    export function init(channel: number): boolean {
        if (!nezhaPaHub.isValidChannel(channel)) return false;
        nezhaPaHub.selectChannel(channel);
        initialised[channel] = false;
        calibrated[channel] = false;

        writeReg(SOFT_RESET, 0x00)
        basic.pause(1)
        writeReg(SOFT_RESET, 0x01)
        basic.pause(1)

        startTimeout()
        while ((readReg(FIRMWARE__SYSTEM_STATUS) & 0x01) == 0) {
            if (timeoutExpired()) return false
        }

        writeReg(PAD_I2C_HV__EXTSUP_CONFIG, readReg(PAD_I2C_HV__EXTSUP_CONFIG) | 0x01)
        fastOscFrequency[channel] = readReg16Bit(OSC_MEASURED__FAST_OSC__FREQUENCY)
        if (fastOscFrequency[channel] == 0) return false

        writeReg16Bit(DSS_CONFIG__TARGET_TOTAL_RATE_MCPS, TARGET_RATE)
        writeReg(GPIO__TIO_HV_STATUS, 0x02)
        writeReg(SIGMA_ESTIMATOR__EFFECTIVE_PULSE_WIDTH_NS, 8)
        writeReg(SIGMA_ESTIMATOR__EFFECTIVE_AMBIENT_WIDTH_NS, 16)
        writeReg(ALGO__CROSSTALK_COMPENSATION_VALID_HEIGHT_MM, 0x01)
        writeReg(ALGO__RANGE_IGNORE_VALID_HEIGHT_MM, 0xFF)
        writeReg(ALGO__RANGE_MIN_CLIP, 0)
        writeReg(ALGO__CONSISTENCY_CHECK__TOLERANCE, 2)

        writeReg16Bit(SYSTEM__THRESH_RATE_HIGH, 0x0000)
        writeReg16Bit(SYSTEM__THRESH_RATE_LOW, 0x0000)
        writeReg(DSS_CONFIG__APERTURE_ATTENUATION, 0x38)

        writeReg16Bit(RANGE_CONFIG__SIGMA_THRESH, 360)
        writeReg16Bit(RANGE_CONFIG__MIN_COUNT_RATE_RTN_LIMIT_MCPS, 192)

        writeReg(SYSTEM__GROUPED_PARAMETER_HOLD_0, 0x01)
        writeReg(SYSTEM__GROUPED_PARAMETER_HOLD_1, 0x01)
        writeReg(SD_CONFIG__QUANTIFIER, 2)

        writeReg(SYSTEM__GROUPED_PARAMETER_HOLD, 0x00)
        writeReg(SYSTEM__SEED_CONFIG, 1)
        writeReg(SYSTEM__SEQUENCE_CONFIG, 0x8B)
        writeReg16Bit(DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, 200 << 8)
        writeReg(DSS_CONFIG__ROI_MODE_CONTROL, 2)

        setLongDistanceMode()
        setMeasurementTimingBudget(channel, TIMING_BUDGET_US)
        writeReg16Bit(ALGO__PART_TO_PART_RANGE_OFFSET_MM, readReg16Bit(MM_CONFIG__OUTER_OFFSET_MM) * 4)

        initialised[channel] = true
        return true
    }

    /**
     * Führt eine Einzelmessung durch.
     * @returns Abstand in mm, OUT_OF_RANGE (9999) ohne Ziel, ERROR (-1) bei Sensorfehler
     */
    export function readSingle(channel: number): number {
        if (!nezhaPaHub.isValidChannel(channel)) return ERROR;
        if (!initialised[channel] && !init(channel)) return ERROR;
        nezhaPaHub.selectChannel(channel);

        writeReg(SYSTEM__INTERRUPT_CLEAR, 0x01)
        writeReg(SYSTEM__MODE_START, 0x10)

        startTimeout()
        while (!dataReady()) {
            if (timeoutExpired()) return ERROR
        }
        readResults()
        if (!calibrated[channel]) {
            setupManualCalibration()
            calibrated[channel] = true
        }
        updateDSS()
        writeReg(SYSTEM__INTERRUPT_CLEAR, 0x01)

        if (rangeStatus == RANGE_STATUS_OUT_OF_BOUNDS) return OUT_OF_RANGE
        return Math.floor((rangeRaw * 2011 + 0x0400) / 0x0800)
    }

    function setLongDistanceMode(): void {
        writeReg(RANGE_CONFIG__VCSEL_PERIOD_A, 0x0F)
        writeReg(RANGE_CONFIG__VCSEL_PERIOD_B, 0x0D)
        writeReg(RANGE_CONFIG__VALID_PHASE_HIGH, 0xB8)
        writeReg(SD_CONFIG__WOI_SD0, 0x0F)
        writeReg(SD_CONFIG__WOI_SD1, 0x0D)
        writeReg(SD_CONFIG__INITIAL_PHASE_SD0, 14)
        writeReg(SD_CONFIG__INITIAL_PHASE_SD1, 14)
    }

    function setMeasurementTimingBudget(channel: number, budgetUs: number): void {
        if (budgetUs <= TIMING_GUARD) return
        let rangeConfigTimeoutUs = budgetUs - TIMING_GUARD
        if (rangeConfigTimeoutUs > 1100000) return
        rangeConfigTimeoutUs = Math.floor(rangeConfigTimeoutUs / 2)

        let macroPeriodUs = calcMacroPeriod(channel, readReg(RANGE_CONFIG__VCSEL_PERIOD_A))
        let phasecalTimeoutMclks = timeoutMicrosecondsToMclks(1000, macroPeriodUs)
        if (phasecalTimeoutMclks > 0xFF) phasecalTimeoutMclks = 0xFF

        writeReg(PHASECAL_CONFIG__TIMEOUT_MACROP, phasecalTimeoutMclks)
        writeReg16Bit(MM_CONFIG__TIMEOUT_MACROP_A, encodeTimeout(timeoutMicrosecondsToMclks(1, macroPeriodUs)))
        writeReg16Bit(RANGE_CONFIG__TIMEOUT_MACROP_A, encodeTimeout(timeoutMicrosecondsToMclks(rangeConfigTimeoutUs, macroPeriodUs)))

        macroPeriodUs = calcMacroPeriod(channel, readReg(RANGE_CONFIG__VCSEL_PERIOD_B))
        writeReg16Bit(MM_CONFIG__TIMEOUT_MACROP_B, encodeTimeout(timeoutMicrosecondsToMclks(1, macroPeriodUs)))
        writeReg16Bit(RANGE_CONFIG__TIMEOUT_MACROP_B, encodeTimeout(timeoutMicrosecondsToMclks(rangeConfigTimeoutUs, macroPeriodUs)))
    }

    function setupManualCalibration(): void {
        let vhvInit = readReg(VHV_CONFIG__INIT)
        let vhvTimeout = readReg(VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND)
        writeReg(VHV_CONFIG__INIT, vhvInit & 0x7F)
        writeReg(VHV_CONFIG__TIMEOUT_MACROP_LOOP_BOUND, (vhvTimeout & 0x03) + (3 << 2))
        writeReg(PHASECAL_CONFIG__OVERRIDE, 0x01)
        writeReg(CAL_CONFIG__VCSEL_START, readReg(PHASECAL_RESULT__VCSEL_START))
    }

    function readResults(): void {
        pins.i2cWriteNumber(I2C_ADDR, RESULT__RANGE_STATUS, NumberFormat.UInt16BE, false)
        let buf = pins.i2cReadBuffer(I2C_ADDR, 17, false)
        rangeStatus = buf.getNumber(NumberFormat.UInt8BE, 0)
        spadCount = buf.getNumber(NumberFormat.UInt16BE, 3)
        ambientRate = buf.getNumber(NumberFormat.UInt16BE, 7)
        rangeRaw = buf.getNumber(NumberFormat.UInt16BE, 13)
        peakSignalRate = buf.getNumber(NumberFormat.UInt16BE, 15)
    }

    function updateDSS(): void {
        if (spadCount != 0) {
            let totalRatePerSpad = peakSignalRate + ambientRate
            if (totalRatePerSpad > 0xFFFF) totalRatePerSpad = 0xFFFF
            totalRatePerSpad <<= 16
            totalRatePerSpad = Math.floor(totalRatePerSpad / spadCount)
            if (totalRatePerSpad != 0) {
                let requiredSpads = Math.floor((TARGET_RATE << 16) / totalRatePerSpad)
                if (requiredSpads > 0xFFFF || requiredSpads < 0) requiredSpads = 0xFFFF
                writeReg16Bit(DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, requiredSpads)
                return
            }
        }
        writeReg16Bit(DSS_CONFIG__MANUAL_EFFECTIVE_SPADS_SELECT, 0x8000)
    }

    function writeReg(reg: number, d: number): void {
        let buf = pins.createBuffer(3)
        buf.setNumber(NumberFormat.UInt16BE, 0, reg)
        buf.setNumber(NumberFormat.UInt8BE, 2, d)
        pins.i2cWriteBuffer(I2C_ADDR, buf, false)
    }

    function writeReg16Bit(reg: number, d: number): void {
        pins.i2cWriteNumber(I2C_ADDR, (reg << 16) | d, NumberFormat.UInt32BE, false)
    }

    function readReg(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt16BE, false)
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt8BE, false)
    }

    function readReg16Bit(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt16BE, false)
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt16BE, false)
    }

    function encodeTimeout(timeoutMclks: number): number {
        if (timeoutMclks <= 0) return 0
        let lsByte = timeoutMclks - 1
        let msByte = 0
        while ((lsByte & 0xFFFFFF00) > 0) {
            lsByte >>= 1
            msByte++
        }
        return (msByte << 8) | (lsByte & 0xFF)
    }

    function timeoutMicrosecondsToMclks(timeoutUs: number, macroPeriodUs: number): number {
        return Math.floor(((timeoutUs << 12) + (macroPeriodUs >> 1)) / macroPeriodUs)
    }

    function calcMacroPeriod(channel: number, vcselPeriod: number): number {
        let pllPeriodUs = Math.floor((0x01 << 30) / fastOscFrequency[channel])
        let vcselPeriodPclks = (vcselPeriod + 1) << 1
        let macroPeriodUs = 2304 * pllPeriodUs
        macroPeriodUs >>= 6
        macroPeriodUs *= vcselPeriodPclks
        macroPeriodUs >>= 6
        return macroPeriodUs
    }

    function startTimeout(): void {
        timeoutStartMs = input.runningTime()
    }

    function timeoutExpired(): boolean {
        return (input.runningTime() - timeoutStartMs) > IO_TIMEOUT_MS
    }

    function dataReady(): boolean {
        return (readReg(GPIO__TIO_HV_STATUS) & 0x01) == 0
    }
}
