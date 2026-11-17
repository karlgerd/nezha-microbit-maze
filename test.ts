// Testprogramm: nutzt jeden Block einmal, damit "pxt build" die komplette API prüft.
// Diese Datei wird nicht mitkompiliert, wenn das Paket als Erweiterung eingebunden ist.

motoren.konfiguriere4Motoren(motoren.Motor.M1, motoren.Motor.M2, motoren.Motor.M3, motoren.Motor.M4)
motoren.konfiguriere2Motoren(motoren.Motor.M1, motoren.Motor.M2)
motoren.setzeFahrzeuggeometrie(17.59, 14.5, 9.3)
motoren.setzeDrehKorrektur(1.28)

sensoren.initialisiereToF(0)
sensoren.initialisiereRGB(1)
anzeige.loescheDisplay()
anzeige.zeigeText("Größe: 5°", 1)

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
    motoren.setzeServo(motoren.ServoPort.J1, 90)
})

basic.forever(function () {
    anzeige.zeigeTextUndZahl("Abstand", sensoren.abstandMm(0), 2)
    sensoren.missFarbe(1)
    anzeige.zeigeTextUndZahl("Rot", sensoren.farbanteil(sensoren.Farbe.Rot, 1), 3)
    anzeige.zeigeZahl(sensoren.rohwert(sensoren.Farbkanal.Helligkeit, 1), 5)
    let werte = sensoren.rohwerteListe(1)
    anzeige.zeigeZahl(werte[0], 6)
    anzeige.loescheZeile(7)
})
