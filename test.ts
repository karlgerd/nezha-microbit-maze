// Testprogramm: nutzt jeden Block einmal, damit "pxt build" die komplette API prüft.
// Diese Datei wird nicht mitkompiliert, wenn das Paket als Erweiterung eingebunden ist.

anzeige.initialisiereDisplay()
motoren.konfiguriere4Motoren(motoren.Motor.M1, motoren.Motor.M2, motoren.Motor.M3, motoren.Motor.M4)
motoren.konfiguriere2Motoren(motoren.Motor.M1, motoren.Motor.M2)
motoren.setzeFahrzeuggeometrie(17.59, 14.5, 9.3)
motoren.setzeDrehKorrektur(1.28)

sensoren.initialisiereToF(0)
sensoren.initialisiereFarbsensor()
anzeige.initialisiereLedRing(anzeige.GrovePort.J1)
anzeige.beleuchtung(5, 255, 255, 255)
anzeige.zeigeText("Größe: 5°", 3)

sensoren.wennBergab(15, function () {
    motoren.fahre(20, 20)
})
sensoren.wennBergauf(15, function () {
    motoren.fahre(80, 80)
})
sensoren.wennWaagerecht(function () {
    motoren.stoppeAlleMotoren()
})

input.onButtonPressed(Button.A, function () {
    motoren.fahreUmdrehungen(1, 50)
    motoren.fahreStrecke(30, -50)
    motoren.fahreZeit(500, 50)
    motoren.fahreKurveZeit(500, 30, 60)
    motoren.dreheGrad(90, motoren.Richtung.Rechts, 50)
    motoren.dreheZeit(500, motoren.Richtung.Links, 30)
    motoren.setzeWinkelZurueck(motoren.Motor.M1)
    anzeige.zeigeTextUndZahl("Winkel", motoren.winkel(motoren.Motor.M1), 4)
    motoren.setzeServo(motoren.ServoPort.J2, 90)
})

input.onButtonPressed(Button.B, function () {
    // Muster "fahre bis": losfahren, warten, anhalten
    motoren.fahre(40, 40)
    pauseUntil(() => sensoren.abstandMm(0) < 100)
    motoren.stoppeAlleMotoren()
    anzeige.beleuchtungAus()
})

basic.forever(function () {
    anzeige.zeigeTextUndZahl("Abstand", sensoren.abstandMm(0), 5)
    anzeige.zeigeTextUndZahl("X", sensoren.farbwert(sensoren.Farbwert.X), 6)
    anzeige.zeigeTextUndZahl("Y", sensoren.farbwert(sensoren.Farbwert.Y), 7)
    anzeige.zeigeZahl(sensoren.farbwert(sensoren.Farbwert.Z), 8)
    anzeige.loescheZeile(8)
    anzeige.loescheDisplay()
})
