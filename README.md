# nezha-microbit-maze

MakeCode-Erweiterung für den Informatikunterricht: didaktisch reduzierte Blöcke, mit denen Schülerinnen und Schüler einen Rescue-Maze-Roboter mit BBC micro:bit und Elecfreaks Nezha-Board programmieren.

Die Erweiterung bringt drei Kategorien mit. Sie stehen in der Werkzeugleiste direkt unter „Grundlagen“ und sind in Orangetönen gehalten, damit man die Roboterblöcke auch im fertigen Programm sofort erkennt:

| Kategorie | Inhalt |
|---|---|
| **Robo-Motoren** | Konfiguration (2 oder 4 Motoren), Fahren, Drehen, Encoder, Servo |
| **Robo-Sensoren** | ToF-Abstandssensor, RGB-Farbsensor, Neigung (Rampen) |
| **Robo-Anzeige** | Text und Zahlen auf dem OLED-Display |

## Erweiterung einbinden

1. [makecode.microbit.org](https://makecode.microbit.org/) öffnen und ein neues Projekt anlegen.
2. Im Zahnrad-Menü **Erweiterungen** wählen.
3. `https://github.com/karlgerd/nezha-microbit-maze` in die Suche einfügen und die Erweiterung auswählen.

Eine bestimmte Version lädt man, indem man das Tag anhängt, z. B. `https://github.com/karlgerd/nezha-microbit-maze#v1.1.0`. Es wird empfohlen, immer mit der aktuellsten Version zu arbeiten.

## Hardware

* BBC micro:bit (V2 empfohlen)
* Elecfreaks Nezha V2 Breakout Board mit Smart-Motoren
* M5Stack Pa.Hub 2.1 (TCA9548A I2C-Multiplexer)
* VL53L1X ToF-Abstandssensoren
* TCS34725 RGB-Farbsensor
* Grove OLED Display 128x64 (SSD1315 / SSD1306)
* optional: Micro-Servo an J1–J4

### Verkabelung

ToF-Sensoren und RGB-Sensor haben dieselbe I2C-Adresse (`0x29`). Deshalb gilt:

1. **ToF- und RGB-Sensoren** kommen an die Ports 0–5 des **Pa.Hub**. Der Pa.Hub selbst steckt an einem I2C-Anschluss des Nezha-Boards. Jeder Sensor braucht einen eigenen Port.
2. **OLED-Display** (Adresse `0x3C`) kommt direkt an einen freien I2C-Anschluss des Nezha-Boards.
3. **Motoren** an M1–M4. Welcher Motor wo sitzt, legt der Konfigurationsblock fest.
4. Der micro:bit wird so eingebaut, dass der **USB-Anschluss nach vorne** zeigt. Sonst sind bergauf und bergab vertauscht.

## Erstes Programm

```blocks
motoren.konfiguriere4Motoren(motoren.Motor.M1, motoren.Motor.M2, motoren.Motor.M3, motoren.Motor.M4)
sensoren.initialisiereToF(0)
anzeige.loescheDisplay()
basic.forever(function () {
    let abstand = sensoren.abstandMm(0)
    anzeige.zeigeTextUndZahl("Abstand", abstand, 1)
    if (abstand > 150) {
        motoren.fahre(40, 40)
    } else {
        motoren.stoppeAlleMotoren()
        motoren.dreheGrad(90, motoren.Richtung.Rechts, 40)
    }
})
```

## Blöcke im Überblick

### Robo-Motoren

| Block | Wirkung |
|---|---|
| `Motorkonfiguration 4 Motoren …` / `… 2 Motoren …` | Legt fest, welcher Motor wo sitzt. Gehört in „beim Start“. |
| `setze Fahrzeuggeometrie …` | Radumfang und Radabstände in cm, Grundlage für `fahre … cm` und `drehe … °`. |
| `setze Dreh-Korrekturfaktor …` | Gleicht Radschlupf bei Drehungen aus (siehe Kalibrierung). |
| `fahre mit … % links und … % rechts` | Startet die Motoren dauerhaft, das Programm läuft sofort weiter. |
| `stoppe alle Motoren` | Hält alle Motoren an. |
| `fahre … Umdrehungen / … cm / … ms` | Fährt geradeaus und hält dann an. Das Programm wartet so lange. |
| `fahre … ms mit … % links und … % rechts` | Kurvenfahrt für eine bestimmte Zeit. |
| `drehe auf der Stelle um … °` / `… ms` | Dreht nach links oder rechts. |
| `Winkel von Motor …` / `setze Winkel … auf 0` | Encoder: Wie weit hat sich ein Rad gedreht? |
| `setze Servo an Port … auf … °` | Stellt einen Servo an J1–J4 (z. B. für einen Rescue-Kit-Abwurf). |

Positive Leistung bedeutet immer vorwärts. Die linken Motoren sind spiegelverkehrt montiert und werden intern invertiert, deshalb muss man im Programm nichts umdrehen.

### Robo-Sensoren

| Block | Wirkung |
|---|---|
| `initialisiere ToF-Sensor an Pa.Hub-Port …` | Gehört in „beim Start“. Antwortet der Sensor nicht, zeigt der micro:bit ein **X und die Portnummer**. |
| `Abstand in mm an Port …` | Abstand in mm. **9999** = kein Hindernis in Reichweite, **-1** = Sensor antwortet nicht. |
| `initialisiere RGB-Sensor an Pa.Hub-Port …` | Gehört in „beim Start“. |
| `miss Farbe an Port …` | Misst einmal und speichert die Werte. |
| `Farbanteil … (0-255)` | Anteil von Rot, Grün oder Blau an der Helligkeit, also weitgehend unabhängig von der Beleuchtung. |
| `Rohwert …` / `Rohwerte als Liste` | Unverarbeitete Messwerte (0–65535). Die Liste hat die Reihenfolge [Rot, Grün, Blau, Helligkeit]. |
| `wenn bergab` / `wenn bergauf (mehr als … °)` | Löst aus, wenn die Neigung **1 Sekunde** lang anliegt. |
| `wenn waagerecht` | Löst aus, wenn der Roboter wieder eben steht (unter ca. 11,5°). Kommt er von bergauf, löst der Block sofort aus, sonst nach 1 Sekunde. |

Die Farbwert-Blöcke liefern immer die Werte der **letzten** Messung. Vorher also `miss Farbe` ausführen.

### Robo-Anzeige

Das Display hat **8 Zeilen à 25 Zeichen**. Jeder `zeige …`-Block überschreibt die ganze Zeile. Kürzere Texte werden aufgefüllt, längere abgeschnitten, und nichts flackert. Umlaute, `ß` und `°` werden dargestellt.

## Kalibrierung für genaue Drehungen

1. **Radumfang messen:** Den Roboter mit `fahre 5 Umdrehungen` fahren lassen, die Strecke messen und durch 5 teilen.
2. **Abstände messen:** Den Abstand links–rechts (Radmitte zu Radmitte) und bei 4 Motoren den Abstand vorne–hinten (Achse zu Achse) messen. Bei 2 Motoren für vorne–hinten `0` eintragen.
3. **Korrekturfaktor bestimmen:** Mit Faktor `1` den Block `drehe 360 °` ausführen. Dreht der Roboter nur 280°, ist der Faktor 360 / 280 ≈ 1,29. Den Wert so lange anpassen, bis die Drehung stimmt. Er hängt stark vom Untergrund ab.

Die blockierenden Fahrbefehle (`Umdrehungen`, `cm`, `°`) nutzen die Positionsregelung der Nezha-Motoren. Wie lange das Programm wartet, wird aus Weg und Geschwindigkeit geschätzt, plus 0,5 s Reserve.

## Hinweise für Lehrkräfte

* Alle Blöcke haben feste IDs (`nezhamaze_…`). Programme bleiben damit auch über künftige Versionen hinweg ladbar.
* In der JavaScript-Ansicht heißen die Namespaces `motoren`, `sensoren` und `anzeige`.

## Entwicklung

Bearbeiten in MakeCode: Im Startbildschirm **Importieren → Importiere URL** wählen und die Repository-URL einfügen.

Lokal bauen:

```sh
npm install -g pxt
pxt target microbit
pxt install
pxt build
```

`test.ts` verwendet jeden Block einmal. So prüft `pxt build` die komplette API. Eine GitHub Action baut bei jedem Push automatisch.

Aufbau:

| Datei | Inhalt |
|---|---|
| `block_*.ts` | Sichtbare Blöcke (Namespaces `motoren`, `sensoren`, `anzeige`) |
| `lib_*.ts` | Interne Treiber: Nezha-Motoren, Pa.Hub, VL53L1X, TCS34725, Neigung, OLED |

## Lizenz

MIT, siehe [LICENSE](LICENSE). Der Motortreiber beruht auf [elecfreaks/pxt-nezha2](https://github.com/elecfreaks/pxt-nezha2), der ToF-Treiber auf der [Pololu VL53L1X-Bibliothek](https://github.com/pololu/vl53l1x-arduino).

#### Metadaten (verwendet für Suche, Rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
