/**
 * Blöcke für die Anzeige auf dem OLED-Display.
 */
//% color="#00BFFF" icon="\uf26c" block="OLED-Display" weight=85
namespace oledDisplay {
    
    // Hilfsfunktion: Füllt den Text mit Leerzeichen auf 25 Zeichen auf
    function fuelleMitLeerzeichen(text: string): string {
        let ausgabe = text;
        while (ausgabe.length < 25) {
            ausgabe += " ";
        }
        return ausgabe;
    }
    
    /**
     * Zeigt einen Text auf einer bestimmten Zeile an.
     * @param text Der anzuzeigende Text
     * @param line Die Zeilennummer (1-8)
     */
    //% block="zeige Text %text in Zeile %line"
    //% line.min=1 line.max=8 line.defl=1
    //% weight=90
    export function zeigeText(text: string, line: number): void {
        let ausgabe = fuelleMitLeerzeichen(text);
        nezhaInternalOLED.show(ausgabe, line, nezhaInternalOLED.ShowAlign.Left, nezhaInternalOLED.FontSelection.Normal);
    }

    /**
     * Zeigt eine Zahl auf einer bestimmten Zeile an.
     * @param value Die anzuzeigende Zahl
     * @param line Die Zeilennummer (1-8)
     */
    //% block="zeige Zahl %value in Zeile %line"
    //% line.min=1 line.max=8 line.defl=2
    //% weight=80
    export function zeigeZahl(value: number, line: number): void {
        let ausgabe = fuelleMitLeerzeichen(value.toString());
        nezhaInternalOLED.show(ausgabe, line, nezhaInternalOLED.ShowAlign.Left, nezhaInternalOLED.FontSelection.Normal);
    }

    /**
     * Zeigt eine Kombination aus Text und Zahl auf einer Zeile an.
     * Der Doppelpunkt und das Leerzeichen werden automatisch eingefügt (z. B. "Abstand: 350").
     * @param text Der beschreibende Text
     * @param value Der zugehörige Wert
     * @param line Die Zeilennummer (1-8)
     */
    //% block="zeige %text und Zahl %value in Zeile %line"
    //% line.min=1 line.max=8 line.defl=3
    //% weight=70
    export function zeigeTextUndZahl(text: string, value: number, line: number): void {
        let textTeil = text + ": " + value;
        let ausgabe = fuelleMitLeerzeichen(textTeil);
        nezhaInternalOLED.show(ausgabe, line, nezhaInternalOLED.ShowAlign.Left, nezhaInternalOLED.FontSelection.Normal);
    }

    /**
     * Löscht den gesamten Inhalt des Displays.
     */
    //% block="lösche Display"
    //% weight=60
    export function loescheDisplay(): void {
        nezhaInternalOLED.clear();
    }
    
    /**
     * Löscht eine bestimmte Zeile auf dem Display.
     * @param line Die zu löschende Zeilennummer (1-8)
     */
    //% block="lösche Text in Zeile %line"
    //% line.min=1 line.max=8 line.defl=1
    //% weight=50
    export function loescheZeile(line: number): void {
        nezhaInternalOLED.clearLine(line);
    }
}
