# SIMEQ Arduino vibration test

The `simeq_adxl345/simeq_adxl345.ino` sketch reads an ADXL345 over I2C and
prints one RMS vibration value per second at 115200 baud. Its output format is
the one consumed by the SIMEQ browser panel:

```text
Vibracao_RMS:0.123 Nivel:0
```

## Setup

1. Install the Arduino IDE and the `Adafruit ADXL345` and `Adafruit Unified
   Sensor` libraries through Library Manager.
2. Connect the ADXL345 using the board's I2C SDA/SCL pins and a shared GND.
   Check the breakout board's voltage requirements before connecting power.
3. Open and upload the sketch, then close Arduino Serial Monitor so the browser
   can claim the serial port.
4. Sign in to SIMEQ with an account whose Arduino / IoT module was enabled by a
   manager. Open **Arduino / IoT**, choose **Conectar Arduino**, and select the
   board's USB serial port. Chrome or Edge on `localhost` or HTTPS is required.

The page plots readings in the current browser session; it does not persist or
send sensor readings to the SIMEQ server. The RMS limits in the sketch are
initial test values only. Calibrate them for the motor, sensor mounting, and
installation before using the displayed level for maintenance decisions.
