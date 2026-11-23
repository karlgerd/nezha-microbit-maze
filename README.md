# nezha-microbit-maze

MakeCode-Erweiterung für den Informatikunterricht: didaktisch reduzierte Blöcke, mit denen Schülerinnen und Schüler einen Rescue-Maze-Roboter mit BBC micro:bit und Elecfreaks Nezha-Board programmieren.

Die Erweiterung bringt drei Kategorien mit. Sie stehen in der Werkzeugleiste direkt unter „Grundlagen“ und sind in Orangetönen gehalten, damit man die Roboterblöcke auch im fertigen Programm sofort erkennt:

| Kategorie | Inhalt |
|---|---|
| **Robo-Motoren** | Konfiguration (2 oder 4 Motoren), Fahren, Drehen, Encoder, Servo |
| **Robo-Sensoren** | ToF-Abstandssensor, Farbsensor mit LED-Ring als Beleuchtung, Neigung (Rampen) |
| **Robo-Anzeige** | Text und Zahlen auf dem OLED-Display |

## Erweiterung einbinden

1. [makecode.microbit.org](https://makecode.microbit.org/) öffnen und ein neues Projekt anlegen.
2. Im Zahnrad-Menü **Erweiterungen** wählen.
3. `https://github.com/karlgerd/nezha-microbit-maze` in die Suche einfügen und die Erweiterung auswählen.

Eine bestimmte Version lädt man, indem man das Tag anhängt, z. B. `https://github.com/karlgerd/nezha-microbit-maze#v1.2.0`. Es wird empfohlen, immer mit der aktuellsten Version zu arbeiten.

## Hardware

* BBC micro:bit (V2 empfohlen)
* Elecfreaks Nezha V2 Breakout Board mit Smart-Motoren
* M5Stack Pa.Hub 2.1 (TCA9548A I2C-Multiplexer)
* VL53L1X ToF-Abstandssensoren
* Adafruit TCS3430 Farbsensor (X, Y, Z)
* Grove OLED Display 128x64 (SSD1315 / SSD1306)
* Grove RGB-LED-Ring mit 20 LEDs (WS2813) als Unterbodenbeleuchtung
* optional: Micro-Servo an J1–J4

### Verkabelung

1. **ToF-Sensoren** haben alle dieselbe I2C-Adresse (`0x29`). Sie kommen deshalb an die Ports 0–5 des **Pa.Hub**, jeder an einen eigenen Port. Der Pa.Hub steckt an einem I2C-Anschluss des Nezha-Boards.
2. **Farbsensor** (Adresse `0x39`) und **OLED-Display** (Adresse `0x3C`) kommen direkt an freie I2C-Anschlüsse des Nezha-Boards.
3. **LED-Ring** an einen J-Port, **Servo** an einen anderen J-Port.
4. **Motoren** an M1–M4. Welcher Motor wo sitzt, legt der Konfigurationsblock fest.
5. Der micro:bit wird so eingebaut, dass der **USB-Anschluss nach vorne** zeigt. Sonst sind bergauf und bergab vertauscht.

### Pinbelegung des Nezha-Boards

| Anschluss | Pin 1 | Pin 2 | Pin 3 | Pin 4 |
|---|---|---|---|---|
| I2C (4×) | GND | VCC | P19 (SCL) | P20 (SDA) |
| J1 | GND | VCC | P8 | P1 |
| J2 | GND | VCC | P12 | P2 |
| J3 | GND | VCC | P14 | P13 |
| J4 | GND | VCC | P16 | P15 |

* **Grove-Geräte** (z. B. der LED-Ring) werden über Adapterkabel angeschlossen, bei denen das Signal an **Pin 4** ankommt. Die Erweiterung nutzt für den Ring deshalb P1, P2, P13 und P15.
* Der **Servo** bekommt ein eigenes Kabel mit dem Signal an **Pin 3**. Die Erweiterung nutzt dafür P8, P12, P14 und P16.
* Der **Farbsensor** hat einen STEMMA-QT-Stecker mit der Reihenfolge GND, V+, SDA, SCL. Am Nezha-Board ist es GND, VCC, SCL, SDA. Im Adapterkabel müssen **SDA und SCL gekreuzt** sein.

## Erstes Programm

```blocks
anzeige.initialisiereDisplay()
motoren.konfiguriere4Motoren(motoren.Motor.M1, motoren.Motor.M2, motoren.Motor.M3, motoren.Motor.M4)
sensoren.initialisiereToF(0)
basic.forever(function () {
    let abstand = sensoren.abstandMm(0)
    anzeige.zeigeTextUndZahl("Abstand", abstand, 3)
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

**Fahren, bis etwas passiert:** Dafür gibt es keinen eigenen Block. Man kombiniert `fahre mit … %` mit dem eingebauten Block `pausiere bis ⟨Bedingung⟩` (Kategorie Schleifen) und danach `stoppe alle Motoren`. Die Bedingung kann beliebig zusammengesteckt werden, z. B. `Abstand in mm an Port 0 < 100`.

### Robo-Sensoren

| Block | Wirkung |
|---|---|
| `initialisiere ToF-Sensor an Pa.Hub-Port …` | Gehört in „beim Start“. Bei einem Fehler zeigt der micro:bit einen Code (siehe unten). |
| `Abstand in mm an Port …` | Abstand in mm. **9999** = kein Hindernis in Reichweite, **-1** = Sensor antwortet nicht. |
| `initialisiere Farbsensor mit Verstärkung … Messzeit … ms` | Gehört in „beim Start“. Standard: 16x und 100 ms. Höhere Verstärkung und längere Messzeit ergeben größere Werte. |
| `Farbwert ⟨X / Y / Z⟩` | Aktueller Messwert. X entspricht grob dem Rotanteil, Y der Helligkeit, Z dem Blauanteil. Der größte mögliche Wert hängt von der Messzeit ab (bei 100 ms ca. 36 800, höchstens 65 535). Der Sensor misst fortlaufend, ein neuer Wert liegt jeweils nach der Messzeit vor. |
| `initialisiere LED-Ring an Port …` | Gehört in „beim Start“. Der Ring hat 20 LEDs. |
| `Beleuchtung: … LEDs mit R … G … B …` | Schaltet die angegebene Anzahl LEDs gleichmäßig verteilt ein, z. B. bei 5 jede vierte. Die Helligkeit ergibt sich aus den Farbwerten 0–255. |
| `Beleuchtung aus` | Schaltet alle LEDs aus. |
| `wenn bergab` / `wenn bergauf (mehr als … °)` | Löst aus, wenn die Neigung **1 Sekunde** lang anliegt. |
| `wenn waagerecht` | Löst aus, wenn der Roboter wieder eben steht (unter ca. 11,5°). Kommt er von bergauf, löst der Block sofort aus, sonst nach 1 Sekunde. |

Der LED-Ring sitzt unter dem Roboter, der Farbsensor in seiner Mitte. Bei vollem Weiß zieht der Ring über 1 A. Meist reichen wenige LEDs mit gedimmten Werten, das schont auch den Akku.

Bleiben die Werte bei hellem Untergrund am Maximum hängen, ist der Sensor übersteuert: Verstärkung oder Messzeit verringern. Sind alle Werte sehr klein, beides erhöhen. Die Farbwerte hängen außerdem stark von Beleuchtung und Abstand zum Boden ab. Die Regeln für Weiß, Schwarz, Rot und Silber sollten deshalb mit genau der Beleuchtung festgelegt werden, mit der der Roboter auch fährt.

**Fehlercodes beim Start** (Anzeige auf der LED-Matrix):

| Code | Bedeutung | Was tun? |
|---|---|---|
| `H` | Pa.Hub antwortet nicht | Kabel zwischen Pa.Hub und Nezha-Board prüfen. |
| `T` + Port | Am Pa.Hub-Port antwortet kein ToF-Sensor | Kabel und Port prüfen, Sensor tauschen. |
| `?` + Port | Am Pa.Hub-Port steckt ein anderes Gerät | Ports vertauscht? |
| `F` | Farbsensor antwortet nicht | Kabel prüfen, SDA/SCL gekreuzt? |
| `?F` | An der Adresse des Farbsensors antwortet ein anderes Gerät | Verkabelung prüfen. |
| `L` | LED-Ring benutzt, aber nicht initialisiert | `initialisiere LED-Ring` in „beim Start“ einfügen. |

Treten Fehler nur nach dem Aufspielen eines Programms auf, hilft es oft, den Roboter einmal ganz aus- und wieder einzuschalten.

### Robo-Anzeige

| Block | Wirkung |
|---|---|
| `initialisiere Display` | Gehört in „beim Start“. Löscht das Display und zeigt Name und Version der Erweiterung. So sieht man sofort, ob ein Projekt eine alte Version nutzt. |
| `zeige Text / Zahl … in Zeile …` | Das Display hat **8 Zeilen à 25 Zeichen**. Jeder Block überschreibt die ganze Zeile, ohne Flackern. Umlaute, `ß` und `°` werden dargestellt. |


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
| `lib_*.ts` | Interne Treiber: Nezha-Motoren, Pa.Hub, VL53L1X, TCS3430, Neigung, OLED, LED-Ring |

Die Version steht an zwei Stellen: in `pxt.json` und in `lib_version.ts` (für die Anzeige auf dem Display). Die GitHub Action prüft, dass beide übereinstimmen.

## Lizenz

MIT, siehe [LICENSE](LICENSE). Der Motortreiber beruht auf [elecfreaks/pxt-nezha2](https://github.com/elecfreaks/pxt-nezha2), der ToF-Treiber auf der [Pololu VL53L1X-Bibliothek](https://github.com/pololu/vl53l1x-arduino), der Farbsensor-Treiber auf [Adafruit_TCS3430](https://github.com/adafruit/Adafruit_TCS3430). Der LED-Ring nutzt [microsoft/pxt-neopixel](https://github.com/microsoft/pxt-neopixel).

#### Metadaten (verwendet für Suche, Rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
