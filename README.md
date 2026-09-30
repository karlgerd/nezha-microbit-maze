# nezha-microbit-maze

MakeCode-Erweiterung für den Informatikunterricht zur Steuerung von Labyrinth-Robotern. Das Paket basiert auf dem Elecfreaks Nezha-Board und bietet didaktisch reduzierte Blöcke für Antrieb, Sensorik und Displayausgaben.

## Unterstützte Hardware
* BBC micro:bit
* Elecfreaks Nezha Breakout Board
* M5Stack Pa.Hub 2.1 (TCA9548A I2C-Multiplexer)
* VL53L1X ToF-Abstandssensoren
* TCS34725 RGB-Farbsensor
* Grove OLED Display 128x64 (SSD1315 / SSD1306)

## Verkabelung und I2C-Adressen
Einige Sensoren teilen sich hardwarebedingt dieselbe I2C-Adresse (z. B. ToF-Sensor und RGB-Sensor nutzen beide `0x29`). Um Datenkollisionen zu vermeiden, ist folgende Verkabelung zwingend erforderlich:

1. **ToF-Sensoren (VL53L1X) und RGB-Sensor (TCS34725):** 
   Diese Komponenten müssen zwingend an die Ports (0-5) des **M5 Pa.Hub** angeschlossen werden. Der Pa.Hub selbst wird an einen I2C-Anschluss des Nezha-Boards gesteckt.
2. **OLED-Display:** 
   Das Display nutzt die Adresse `0x3C` (dezimal 60) und kann direkt an einen freien I2C-Anschluss des Nezha-Boards angeschlossen werden.

## Programmierungshinweise
* **Initialisierung:** Die ToF- und RGB-Sensoren am Pa.Hub müssen vor der ersten Messung initialisiert werden. Dafür stehen in der Kategorie "Sensoren" entsprechende Blöcke bereit, die in den `beim Start`-Block eingefügt werden müssen (mit Angabe des jeweiligen Pa.Hub-Kanals).
* **Displayausgabe:** Die Blöcke zur Text- und Zahlenausgabe nutzen automatisches Padding (Auffüllen mit Leerzeichen auf 25 Zeichen). Dadurch wird ein Flackern des Displays beim Aktualisieren von Sensordaten in Endlosschleifen verhindert. Ein expliziter `lösche Zeile`-Befehl ist vor dem Überschreiben nicht mehr nötig.

---

## Als Erweiterung verwenden

Dieses Repository kann als **Erweiterung** in MakeCode hinzugefügt werden.

* öffne [https://makecode.microbit.org/](https://makecode.microbit.org/)
* klicke auf **Neues Projekt**
* klicke auf **Erweiterungen** unter dem Zahnrad-Menü
* nach `https://github.com/karlgerd/nezha-microbit-maze` suchen und importieren. 
* Um eine spezifische Version zu laden, hängen Sie den Tag an die URL an (z. B. `https://github.com/karlgerd/nezha-microbit-maze#v0.5.0`).

## Dieses Projekt bearbeiten

Um dieses Repository in MakeCode zu bearbeiten:

* öffne [https://makecode.microbit.org/](https://makecode.microbit.org/)
* klicke auf **Importieren** und dann auf **Importiere URL**
* füge `https://github.com/karlgerd/nezha-microbit-maze` ein und klicke auf Importieren

#### Metadaten (verwendet für Suche, Rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
