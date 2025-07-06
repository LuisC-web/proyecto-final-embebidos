from machine import Pin, PWM
import time

# Velocidad base PWM (16 bits: 0–65535)
VELOCIDAD_BASE = 50000

# Corrección de motores (si se va chueco)
AJUSTE_MOTOR_A = 1.0
AJUSTE_MOTOR_B = 1.0

# Parámetros de movimiento
CM_POR_SEGUNDO = 25.0
GRADOS_POR_SEGUNDO = 120.0

# Pines (modificables si usas otros)
AIN1 = 12   # PWM
AIN2 = 13  # LOW/HIGH
BIN1 = 14  # PWM
BIN2 = 15  # LOW/HIGH

class MotorController:
    def __init__(self):
        self.ain1 = PWM(Pin(AIN1))
        self.ain2 = Pin(AIN2, Pin.OUT)
        self.bin1 = PWM(Pin(BIN1))
        self.bin2 = Pin(BIN2, Pin.OUT)

        self.ain1.freq(1000)
        self.bin1.freq(1000)

        self.velocidad_a = int(VELOCIDAD_BASE * AJUSTE_MOTOR_A)
        self.velocidad_b = int(VELOCIDAD_BASE * AJUSTE_MOTOR_B)

    def _mover_motor_a(self, direccion, velocidad):
        if direccion == "adelante":
            self.ain1.duty_u16(velocidad)
            self.ain2.value(0)
        elif direccion == "atras":
            self.ain1.duty_u16(0)
            self.ain2.value(1)
        else:
            self.ain1.duty_u16(0)
            self.ain2.value(0)

    def _mover_motor_b(self, direccion, velocidad):
        if direccion == "adelante":
            self.bin1.duty_u16(velocidad)
            self.bin2.value(0)
        elif direccion == "atras":
            self.bin1.duty_u16(0)
            self.bin2.value(1)
        else:
            self.bin1.duty_u16(0)
            self.bin2.value(0)

    def mover_adelante(self, distancia_cm):
        t = distancia_cm / CM_POR_SEGUNDO
        self._mover_motor_a("adelante", self.velocidad_a)
        self._mover_motor_b("adelante", self.velocidad_b)
        time.sleep(t)
        self.detener()

    def mover_atras(self, distancia_cm):
        t = distancia_cm / CM_POR_SEGUNDO
        self._mover_motor_a("atras", self.velocidad_a)
        self._mover_motor_b("atras", self.velocidad_b)
        time.sleep(t)
        self.detener()

    def girar_izquierda(self, angulo_grados):
        t = angulo_grados / GRADOS_POR_SEGUNDO
        self._mover_motor_a("atras", self.velocidad_a)
        self._mover_motor_b("adelante", int(self.velocidad_b * 1.2))
        time.sleep(t)
        self.detener()

    def girar_derecha(self, angulo_grados):
        t = angulo_grados / GRADOS_POR_SEGUNDO
        self._mover_motor_a("adelante", int(self.velocidad_a * 1.2))
        self._mover_motor_b("atras", self.velocidad_b)
        time.sleep(t)
        self.detener()

    def detener(self):
        self._mover_motor_a("stop", 0)
        self._mover_motor_b("stop", 0)

    def curva_suave(self, direccion, radio_cm, distancia_cm):
        t = distancia_cm / CM_POR_SEGUNDO
        if direccion == 'izquierda':
            self._mover_motor_a("adelante", int(self.velocidad_a * 0.7))
            self._mover_motor_b("adelante", self.velocidad_b)
        else:
            self._mover_motor_a("adelante", self.velocidad_a)
            self._mover_motor_b("adelante", int(self.velocidad_b * 0.7))
        time.sleep(t)
        self.detener()
