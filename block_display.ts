/**
 * Textausgabe auf dem Grove OLED-Display (8 Zeilen à 25 Zeichen).
 */
//% color="#00BFFF" icon="\uf26c" block="Anzeige" weight=85
namespace anzeige {

    /**
     * Zeigt einen Text in einer Zeile an. Der alte Inhalt der Zeile wird überschrieben,
     * Texte über 25 Zeichen werden abgeschnitten.
     * @param text der anzuzeigende Text
     * @param zeile Zeilennummer (1-8)
     */
    //% blockId=nezhamaze_oled_text
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
    //% block="lösche Display"
    //% weight=50
    export function loescheDisplay(): void {
        nezhaOled.clear();
    }
}
