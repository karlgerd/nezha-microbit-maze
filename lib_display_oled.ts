/**
 * Interne Treiberbibliothek für das Seed Grove OLED SSD1315 (128x64).
 * Reduziert auf reine Textausgabe. Nicht für Endbenutzer im Block-Menü sichtbar.
 */
namespace nezhaInternalOLED {
    
    // ASCII Code to OLED 5x8 pixel character for display conversion
    const font: number[] = [
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
        0x00000000, 0x000002e0, 0x00018060, 0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060,
        0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200, 0x00021080, 0x00000100, 0x00111110,
        0x0007462e, 0x00087e40, 0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88, 0x00119531,
        0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00, 0x0008a880, 0x00052940, 0x00022a20, 0x0022d422,
        0x00e4d62e, 0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf, 0x000094bf, 0x00cac62e,
        0x000f909f, 0x000047f1, 0x0017c629, 0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e,
        0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21, 0x0007c20f, 0x00744107, 0x01f4111f,
        0x000d909b, 0x00117041, 0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440, 0x01084210,
        0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c, 0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2,
        0x000c109f, 0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e, 0x000e085e, 0x00064a4c,
        0x0002295e, 0x000f2944, 0x0001085c, 0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e,
        0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0, 0x000013f1, 0x00841080, 0x0022d422
    ];

    export enum ShowAlign {
        Left,
        Centre,
        Right
    }

    export enum FontSelection {
        Normal,
        Big
    }

    // Standard I2C Adresse für Grove OLED / SSD1315 (0x3C = 60)
    const DISPLAY_ADDR = 60;
    
    let numberOfCharPerLine = 25;
    let fontZoom = 1;
    let globalZoomSet = false;
    let initialised = 0;

    let screenBuf = pins.createBuffer(1025);
    let writeOneByteBuf = pins.createBuffer(2);
    let writeTwoByteBuf = pins.createBuffer(3);
    let writeThreeByteBuf = pins.createBuffer(4);

    function writeOneByte(regValue: number) {
        writeOneByteBuf[0] = 0;
        writeOneByteBuf[1] = regValue;
        pins.i2cWriteBuffer(DISPLAY_ADDR, writeOneByteBuf);
    }

    function writeTwoByte(regValue1: number, regValue2: number) {
        writeTwoByteBuf[0] = 0;
        writeTwoByteBuf[1] = regValue1;
        writeTwoByteBuf[2] = regValue2;
        pins.i2cWriteBuffer(DISPLAY_ADDR, writeTwoByteBuf);
    }

    function writeThreeByte(regValue1: number, regValue2: number, regValue3: number) {
        writeThreeByteBuf[0] = 0;
        writeThreeByteBuf[1] = regValue1;
        writeThreeByteBuf[2] = regValue2;
        writeThreeByteBuf[3] = regValue3;
        pins.i2cWriteBuffer(DISPLAY_ADDR, writeThreeByteBuf);
    }

    function set_pos(col: number = 0, page: number = 0) {
        writeOneByte(0xb0 | page);
        writeOneByte(0x00 | (col % 16));
        writeOneByte(0x10 | (col >> 4));
    }

    export function init(): void {
        if (initialised == 1) return;

        writeOneByte(0xAE);              // SSD1306_DISPLAYOFF
        writeOneByte(0xA4);              // SSD1306_DISPLAYALLON_RESUME
        writeTwoByte(0xD5, 0xF0);        // SSD1306_SETDISPLAYCLOCKDIV
        writeTwoByte(0xA8, 0x3F);        // SSD1306_SETMULTIPLEX
        writeTwoByte(0xD3, 0x00);        // SSD1306_SETDISPLAYOFFSET
        writeOneByte(0 | 0x0);           // line #SSD1306_SETSTARTLINE
        writeTwoByte(0x8D, 0x14);        // SSD1306_CHARGEPUMP
        writeTwoByte(0x20, 0x00);        // SSD1306_MEMORYMODE
        writeThreeByte(0x21, 0, 127);    // SSD1306_COLUMNADDR
        writeThreeByte(0x22, 0, 63);     // SSD1306_PAGEADDR
        writeOneByte(0xa0 | 0x1);        // SSD1306_SEGREMAP
        writeOneByte(0xc8);              // SSD1306_COMSCANDEC
        writeTwoByte(0xDA, 0x12);        // SSD1306_SETCOMPINS
        writeTwoByte(0x81, 0xCF);        // SSD1306_SETCONTRAST
        writeTwoByte(0xd9, 0xF1);        // SSD1306_SETPRECHARGE
        writeTwoByte(0xDB, 0x40);        // SSD1306_SETVCOMDETECT
        writeOneByte(0xA6);              // SSD1306_NORMALDISPLAY
        writeTwoByte(0xD6, 0);           // Zoom is set to off
        writeOneByte(0xAF);              // SSD1306_DISPLAYON
        
        initialised = 1;
        clear();
    }

    export function setFontSize(fontSize: FontSelection) {
        if (initialised == 0) init();
        globalZoomSet = true;

        if (fontSize == FontSelection.Big) {
            numberOfCharPerLine = 12;
            fontZoom = 2;
        } else {
            numberOfCharPerLine = 25;
            fontZoom = 1;
        }
    }

    export function clear() {
        if (initialised == 0) init();

        screenBuf.fill(0);
        screenBuf[0] = 0x40;
        set_pos();
        pins.i2cWriteBuffer(DISPLAY_ADDR, screenBuf);
    }

    export function clearLine(line: number) {
        if (initialised == 0) init();

        if (fontZoom == 1) {
            show("                         ", line);
        } else {
            show("            ", line);
        }
    }

    export function show(inputString: string, line?: number, displayShowAlign?: ShowAlign, fontSize?: FontSelection) {
        let x = 0;
        let y = 0;

        if (initialised == 0) init();

        if (!displayShowAlign) displayShowAlign = ShowAlign.Left;

        if (!globalZoomSet && fontSize && fontSize == FontSelection.Big) {
            numberOfCharPerLine = 12;
            fontZoom = 2;
        } else if (!globalZoomSet) {
            numberOfCharPerLine = 25;
            fontZoom = 1;
        }

        if (!line) {
            y = 0;
        } else if (fontZoom == 1) {
            y = line - 1;
            if (y < 0) y = 0;
            if (y > 7) y = 7;
        } else {
            if (line == 1) y = 0;
            else if (line == 2) y = 2;
            else if (line == 3) y = 4;
            else y = 6;
        }

        let stringArray: string[] = [];
        let numberOfStrings = 0;
        let i = 0;

        while (i < inputString.length) {
            if (inputString.length - i <= numberOfCharPerLine) {
                stringArray[numberOfStrings] = inputString.substr(i, inputString.length - i);
                numberOfStrings++;
                i = inputString.length;
            } else {
                stringArray[numberOfStrings] = inputString.substr(i, numberOfCharPerLine);
                numberOfStrings++;
                i += numberOfCharPerLine;
            }
        }

        let charBytes = 0;
        let column1 = 0;
        let column2 = 0;
        let bufferIndex = 0;

        for (let textLine = 0; textLine < numberOfStrings; textLine++) {
            let displayString = stringArray[textLine];

            if (displayString.length < numberOfCharPerLine) {
                if (displayShowAlign == ShowAlign.Left) {
                    x = 0;
                } else if (displayShowAlign == ShowAlign.Centre) {
                    x = Math.round((numberOfCharPerLine - displayString.length) / 2);
                } else if (displayShowAlign == ShowAlign.Right) {
                    x = numberOfCharPerLine - displayString.length;
                }
            }

            for (let charOfString = 0; charOfString < displayString.length; charOfString++) {
                charBytes = font[displayString.charCodeAt(charOfString)];

                for (let xIndex = 0; xIndex < 5; xIndex++) {
                    column1 = 0;
                    column2 = 0;

                    for (let yIndex = 0; yIndex < 5; yIndex++) {
                        if (charBytes & (1 << 5 * xIndex + yIndex)) {
                            if (fontZoom == 1) {
                                column1 |= 1 << yIndex + 1;
                            } else if (yIndex < 3) {
                                column1 |= 1 << yIndex * fontZoom + 1;
                                column1 |= 1 << yIndex * fontZoom + 2;
                            } else if (yIndex == 3) {
                                column1 |= 1 << yIndex * fontZoom + 1;
                                column2 |= 1 << (yIndex - 3) * fontZoom;
                            } else {
                                column2 |= 1 << (yIndex - 4) * fontZoom + 1;
                                column2 |= 1 << (yIndex - 4) * fontZoom + 2;
                            }
                        }
                    }

                    bufferIndex = (x + charOfString) * 5 * fontZoom + y * 128 + xIndex * fontZoom + 1;

                    if (fontZoom == 1) {
                        screenBuf[bufferIndex] = column1;
                    } else {
                        screenBuf[bufferIndex] = column1;
                        screenBuf[bufferIndex + 1] = column1;
                        screenBuf[bufferIndex + 128] = column2;
                        screenBuf[bufferIndex + 129] = column2;
                    }

                    if (fontZoom == 2) bufferIndex += 129;
                }
            }

            set_pos(x * 5 * fontZoom, y);
            let start = x * 5 * fontZoom + y * 128;
            let buf2 = screenBuf.slice(start, bufferIndex + 1);
            buf2[0] = 0x40;
            pins.i2cWriteBuffer(DISPLAY_ADDR, buf2);

            if (fontZoom == 1) y++;
            else y += 2;
        }
    }
}
