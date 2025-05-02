// 當太空船震動，發出警告聲
input.onGesture(Gesture.Shake, function () {
    music.play(music.stringPlayable("C5 F C5 F C5 F C5 F ", 240), music.PlaybackMode.UntilDone)
})
// 環境光偵測部分：當環境光過暗則點亮LED補光燈
function LightLevelControl () {
    // Turn on the LED
    if (lightStatus == 1) {
        pins.digitalWritePin(DigitalPin.P8, 1)
        pins.digitalWritePin(DigitalPin.P12, 1)
    }
    // Turn off the LED
    if (lightStatus == 0) {
        pins.digitalWritePin(DigitalPin.P8, 0)
        pins.digitalWritePin(DigitalPin.P12, 0)
    }
}
// 水位偵測部分：當水位過高P15的指示燈閃動，再高的話長亮
function WaterLevelControl () {
    if (waterLevel > 0 && waterLevel < 299) {
        pins.digitalWritePin(DigitalPin.P15, 1)
    } else {
        if (waterLevel >= 300 && waterLevel < 380) {
            pins.digitalWritePin(DigitalPin.P15, 1)
            basic.pause(100)
            pins.digitalWritePin(DigitalPin.P15, 0)
            basic.pause(100)
            pins.digitalWritePin(DigitalPin.P15, 1)
            basic.pause(100)
            pins.digitalWritePin(DigitalPin.P15, 0)
        } else {
            if (waterLevel >= 380) {
                pins.digitalWritePin(DigitalPin.P15, 0)
            }
        }
    }
}
// TDS偵測部分：當TDS過高P13的指示燈閃動，再高的話長亮
function TDSControl () {
    if (TDSLevel < 350) {
        pins.digitalWritePin(DigitalPin.P13, 0)
    }
    if (TDSLevel >= 350 && TDSLevel < 550) {
        pins.digitalWritePin(DigitalPin.P13, 1)
        basic.pause(100)
        pins.digitalWritePin(DigitalPin.P13, 0)
        basic.pause(100)
        pins.digitalWritePin(DigitalPin.P13, 1)
        basic.pause(100)
        pins.digitalWritePin(DigitalPin.P13, 0)
        basic.pause(100)
    }
    if (TDSLevel >= 550 && TDSLevel < 850) {
        pins.digitalWritePin(DigitalPin.P13, 1)
    }
}
let TDSLevel = 0
let waterLevel = 0
let lightStatus = 0
for (let index = 0; index < 3; index++) {
    basic.showIcon(IconNames.SmallDiamond)
    basic.showIcon(IconNames.Diamond)
}
// 每10秒向ESP32發送感應器數值
loops.everyInterval(10000, function () {
    serial.redirect(
    SerialPin.P2,
    SerialPin.USB_RX,
    BaudRate.BaudRate9600
    )
    serial.writeString("TDS:" + TDSLevel + ",WT:" + waterLevel + ",LT:" + lightStatus + "\n")
})
// 每60秒偵測TDS數值，如果低於某數值，轉動水泵添加營養液
loops.everyInterval(60000, function () {
    if (TDSLevel < 350) {
        robotbit.MotorRunDelay(robotbit.Motors.M2A, 150, 5)
    }
})
basic.forever(function () {
    WaterLevelControl()
    TDSControl()
    LightLevelControl()
    waterLevel = pins.analogReadPin(AnalogReadWritePin.P0)
    TDSLevel = pins.analogReadPin(AnalogReadWritePin.P1)
    lightStatus = pins.digitalReadPin(DigitalPin.P14)
})
