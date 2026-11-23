/**
 * Textausgabe auf dem Grove OLED-Display (8 Zeilen à 25 Zeichen)
 * und Unterbodenbeleuchtung mit dem Grove LED-Ring.
 */
//% color="#8A3A0A" icon="\uf26c" block="Robo-Anzeige" weight=113
//% groups='["OLED-Display", "LED-Ring"]'
namespace anzeige {

    /** J-Ports des Nezha-Boards für Grove-Geräte: Signal an Pin 4 des Ports. */
    export enum GrovePort {
        //% block="J1"
        J1 = DigitalPin.P1,
        //% block="J2"
        J2 = DigitalPin.P2,
        //% block="J3"
        J3 = DigitalPin.P13,
        //% block="J4"
        J4 = DigitalPin.P15
    }

    /**
     * Initialisiert das Display, löscht es und zeigt Name und Version der Erweiterung an.
     * Gehört in "beim Start".
     */
    //% blockId=nezhamaze_oled_init
    //% block="initialisiere Display"
    //% group="OLED-Display" weight=100
    export function initialisiereDisplay(): void {
        nezhaOled.init();
        nezhaOled.clear();
        nezhaOled.writeLine("Rescue Maze Robo", 1);
        nezhaOled.writeLine("Erweiterung v" + nezhaVersion.VERSION, 2);
    }

    /**
     * Zeigt einen Text in einer Zeile an. Der alte Inhalt der Zeile wird überschrieben,
     * Texte über 25 Zeichen werden abgeschnitten.
     * @param text der anzuzeigende Text
     * @param zeile Zeilennummer (1-8)
     */
    //% blockId=nezhamaze_oled_text
    //% group="OLED-Display"
    //% block="zeige Text $text in Zeile $zeile"
    //% zeile.min=1 zeile.max=8 zeile.defl=1
    //% weight=90
    export function zeigeText(text: string, zeile: number): void {
        nezhaOled.writeLine(text, zeile);
    }

    /**
     * Zeigt eine Zahl in einer Zeile an. Der alte Inhalt der Zeile wird überschrieben.
     * @param zahl die anzuzeigende Zahl
     * @param zeile Zeilennummer (1-8)
     */
    //% blockId=nezhamaze_oled_number
    //% group="OLED-Display"
    //% block="zeige Zahl $zahl in Zeile $zeile"
    //% zeile.min=1 zeile.max=8 zeile.defl=2
    //% weight=80
    export function zeigeZahl(zahl: number, zeile: number): void {
        nezhaOled.writeLine("" + zahl, zeile);
    }

    /**
     * Zeigt eine Beschriftung und eine Zahl in einer Zeile an, z. B. "Abstand: 350".
     * @param text die Beschriftung
     * @param zahl der zugehörige Wert
     * @param zeile Zeilennummer (1-8)
     */
    //% blockId=nezhamaze_oled_label_number
    //% group="OLED-Display"
    //% block="zeige $text : $zahl in Zeile $zeile"
    //% text.defl="Abstand"
    //% zeile.min=1 zeile.max=8 zeile.defl=3
    //% weight=70
    export function zeigeTextUndZahl(text: string, zahl: number, zeile: number): void {
        nezhaOled.writeLine(text + ": " + zahl, zeile);
    }

    /**
     * Löscht eine Zeile des Displays.
     * @param zeile Zeilennummer (1-8)
     */
    //% blockId=nezhamaze_oled_clear_line
    //% group="OLED-Display"
    //% block="lösche Zeile $zeile"
    //% zeile.min=1 zeile.max=8 zeile.defl=1
    //% weight=60
    export function loescheZeile(zeile: number): void {
        nezhaOled.writeLine("", zeile);
    }

    /**
     * Löscht den gesamten Inhalt des Displays.
     */
    //% blockId=nezhamaze_oled_clear
    //% group="OLED-Display"
    //% block="lösche Display"
    //% weight=50
    export function loescheDisplay(): void {
        nezhaOled.clear();
    }

    // ==========================================
    // LED-Ring (Unterbodenbeleuchtung)
    // ==========================================

    /**
     * Initialisiert den LED-Ring (20 LEDs) an einem J-Port und schaltet ihn aus.
     * Gehört in "beim Start". Das Signal liegt an Pin 4 des Ports
     * (J1 = P1, J2 = P2, J3 = P13, J4 = P15).
     */
    //% blockId=nezhamaze_ring_init
    //% block="initialisiere LED-Ring an Port $port"
    //% port.defl=anzeige.GrovePort.J1
    //% group="LED-Ring" weight=40
    export function initialisiereLedRing(port: GrovePort): void {
        nezhaLedRing.init(<number>port);
    }

    /**
     * Schaltet eine Anzahl LEDs gleichmäßig verteilt ein, alle anderen aus.
     * Die Helligkeit ergibt sich aus den Farbwerten, z. B. 100, 100, 100 = gedimmtes Weiß.
     * @param anzahl Anzahl der leuchtenden LEDs (0-20)
     * @param rot Rotanteil (0-255)
     * @param gruen Grünanteil (0-255)
     * @param blau Blauanteil (0-255)
     */
    //% blockId=nezhamaze_ring_light
    //% block="Beleuchtung: $anzahl LEDs mit R $rot G $gruen B $blau"
    //% anzahl.min=0 anzahl.max=20 anzahl.defl=5
    //% rot.min=0 rot.max=255 rot.defl=255
    //% gruen.min=0 gruen.max=255 gruen.defl=255
    //% blau.min=0 blau.max=255 blau.defl=255
    //% inlineInputMode=inline
    //% group="LED-Ring" weight=30
    export function beleuchtung(anzahl: number, rot: number, gruen: number, blau: number): void {
        nezhaLedRing.light(anzahl, rot, gruen, blau);
    }

    /**
     * Schaltet alle LEDs des Rings aus.
     */
    //% blockId=nezhamaze_ring_off
    //% block="Beleuchtung aus"
    //% group="LED-Ring" weight=20
    export function beleuchtungAus(): void {
        nezhaLedRing.off();
    }
}
