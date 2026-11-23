#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <math.h>

Adafruit_ADXL345_Unified adxl = Adafruit_ADXL345_Unified(12345);

// 100 Hz sampling; each RMS value covers approximately one second.
const unsigned long PERIODO_US = 10000;
const int AMOSTRAS_JANELA = 100;

// Initial test limits in m/s^2 RMS. Calibrate for the motor and mounting.
const float LIMITE_MEDIO = 0.50;
const float LIMITE_ALTO = 1.50;

// Slow baseline filter used to remove gravity and other low-frequency changes.
const float ALFA = 0.02;

float baseX = 0;
float baseY = 0;
float baseZ = 0;
float somaQuadrados = 0;
int contador = 0;
bool primeiraLeitura = true;
unsigned long proximaAmostra = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  if (!adxl.begin()) {
    Serial.println("ERRO: ADXL345 nao encontrado");
    while (true) {
      delay(1000);
    }
  }

  adxl.setRange(ADXL345_RANGE_2_G);
  adxl.setDataRate(ADXL345_DATARATE_100_HZ);
  proximaAmostra = micros();

  // Keep the output compatible with the SIMEQ browser serial reader.
  Serial.println("Vibracao_RMS:0 Nivel:0");
}

void loop() {
  const unsigned long agora = micros();
  if ((long)(agora - proximaAmostra) < 0) {
    return;
  }
  proximaAmostra += PERIODO_US;

  sensors_event_t evento;
  adxl.getEvent(&evento);

  const float x = evento.acceleration.x;
  const float y = evento.acceleration.y;
  const float z = evento.acceleration.z;

  if (primeiraLeitura) {
    baseX = x;
    baseY = y;
    baseZ = z;
    primeiraLeitura = false;
  }

  baseX += ALFA * (x - baseX);
  baseY += ALFA * (y - baseY);
  baseZ += ALFA * (z - baseZ);

  const float dx = x - baseX;
  const float dy = y - baseY;
  const float dz = z - baseZ;

  somaQuadrados += dx * dx + dy * dy + dz * dz;
  contador++;

  if (contador >= AMOSTRAS_JANELA) {
    const float rms = sqrt(somaQuadrados / contador);
    int nivel;

    if (rms < LIMITE_MEDIO) {
      nivel = 0;
    } else if (rms < LIMITE_ALTO) {
      nivel = 1;
    } else {
      nivel = 2;
    }

    Serial.print("Vibracao_RMS:");
    Serial.print(rms, 3);
    Serial.print(" Nivel:");
    Serial.println(nivel);

    somaQuadrados = 0;
    contador = 0;
  }
}
