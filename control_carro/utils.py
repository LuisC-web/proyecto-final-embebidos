# utils.py

import network
import socket
import json
import time
from machine import UART, Pin,time_pulse_us

class UtilsProject:
    def __init__(self, uart_id=0, baudrate=115200, tx_pin=16, rx_pin=17,timeout=100, timeout_char=10,trig_pin=10, echo_pin=11,
                 dist_min_cm=20):
        """
        Inicializa el UART y parámetros básicos para comunicación serial.
        """
        self.uart = UART(uart_id, baudrate=baudrate, tx=tx_pin, rx=rx_pin,timeout=timeout, timeout_char=timeout_char)
        self.uart_buffer = b""
        self.uart.read()
         # Ultrasonido
        self.TRIG = Pin(trig_pin, Pin.OUT)
        self.ECHO = Pin(echo_pin, Pin.IN)
        self.dist_min = dist_min_cm

    def enviar_uart(self, mensaje):
        """
        Envía un mensaje por UART seguido de nueva línea.
        """
        if isinstance(mensaje, str):
            mensaje = mensaje + "\n"
            self.uart.write(mensaje)
            print("📤 UART enviado:", mensaje.strip())
        else:
            raise TypeError("El mensaje debe ser una cadena de texto")

    def recibir_uart(self):
        line = self.uart.readline()
        if not line:
            return None
        print("RAW recibida:", line)

        try:
            texto = line.decode().strip()
            msg = json.loads(texto)
            return msg
        except Exception as e:
            print("⚠️ Error JSON:", texto if 'texto' in locals() else line, e)
            return None


    # Función para parsear comandos JSON
    def parsear_comando(datos_json):
        try:
            data = json.loads(datos_json)

            # Buscar la clave principal 'Carro_X'
            if not data or not any(key.startswith("Carro_") for key in data):
                raise ValueError("El JSON no contiene una clave 'Carro_X' principal.")

            # Obtener la clave del carro (asumimos que solo hay una, por ejemplo "Carro_1")
            carro_key = next(key for key in data if key.startswith("Carro_"))
            pasos = data[carro_key]

            if not pasos:
                raise ValueError("La sección '{}' no contiene ningún paso.".format(carro_key))

            # --- CORRECCIÓN: Ordenar pasos numéricamente ---
            # Extraer y ordenar las claves de los pasos por su número
            claves_pasos = [k for k in pasos.keys() if k.startswith("Paso_")]
            claves_ordenadas = sorted(claves_pasos, key=lambda x: int(x.split('_')[1]))
            
            secuencia_comandos = []

            # Iterar a través de cada paso EN ORDEN
            for paso_nombre in claves_ordenadas:
                paso_data = pasos[paso_nombre]
                if "Movimiento" not in paso_data:
                    raise ValueError("Falta la sección 'Movimiento' en el {}".format(paso_nombre))

                mov = paso_data["Movimiento"]

                if "distancia_mm" not in mov or "velocidad_mm_s" not in mov or "radio_mm" not in mov:
                    raise ValueError("Faltan los campos 'distancia_mm', 'velocidad_mm_s' o 'radio_mm' en la sección 'Movimiento' de {}".format(paso_nombre))

                comando_actual = {"tipo": None}
                comando_actual["distancia_original"] = mov["distancia_mm"]
                comando_actual["distancia_abs"] = abs(mov["distancia_mm"])
                comando_actual["velocidad"] = mov["velocidad_mm_s"]

                comando_actual["direccion_avance"] = "adelante" if mov["distancia_mm"] >= 0 else "atras"

                if str(mov["radio_mm"]).lower() == "inf":
                    comando_actual["tipo"] = "recto"
                    comando_actual["angulo"] = 0
                    comando_actual["direccion_giro"] = None
                    comando_actual["vel_giro"] = 0
                elif isinstance(mov["radio_mm"], (int, float)):
                    comando_actual["tipo"] = "giro_y_recto"
                    comando_actual["angulo"] = abs(mov["radio_mm"])

                    if mov["radio_mm"] < 0:
                        comando_actual["direccion_giro"] = "izquierda"
                    else:
                        comando_actual["direccion_giro"] = "derecha"
                    
                    comando_actual["vel_giro"] = mov.get("vel_grados_s", 60)
                else:
                    raise ValueError("El valor de 'radio_mm' en {} debe ser 'inf' o un número (grados de giro).".format(paso_nombre))

                # Manejar brazo robótico si está presente en el paso actual
                if "Brazo" in paso_data:
                    brazo = paso_data["Brazo"]
                    for campo in ["angulo0_grados", "angulo1_grados", "angulo2_grados"]:
                        if campo not in brazo:
                            raise ValueError("Falta el campo requerido: {} en Brazo para {}".format(campo, paso_nombre))

                    angulos = [
                        brazo["angulo0_grados"],
                        brazo["angulo1_grados"],
                        brazo["angulo2_grados"]
                    ]

                    if not all(isinstance(a, (int, float)) for a in angulos):
                        raise TypeError("Los ángulos del brazo deben ser numéricos para {}".format(paso_nombre))

                    comando_actual["angulos"] = angulos
                    # Obtener t_ser si está presente, de lo contrario usar un valor por defecto (ej. 1.0 segundos)
                    comando_actual["t_ser"] = brazo.get("t_ser", 1.0)  
                else:
                    comando_actual["angulos"] = None
                    comando_actual["t_ser"] = None # No hay movimiento de brazo, no hay tiempo de servo

                secuencia_comandos.append(comando_actual)

            return secuencia_comandos

        except Exception as e:
            print("ERROR en el parseo:", e)
            return None
        
    def parsear_json_uart(self, received, motor_controller, brazo_robotico):
        if received.get("accion") == "mover":
            mov = received["movimiento"]
            direccion = mov.get("direccion", "adelante")
            distancia = mov.get("distancia_cm", 10)
            if direccion == "adelante":
                motor_controller.mover_adelante(distancia)
            else:
                motor_controller.mover_atras(distancia)

        elif received.get("accion") == "girar":
            direccion = received.get("direccion")
            angulo = received.get("angulo", 90)
            if direccion == "izquierda":
                motor_controller.girar_izquierda(angulo)
            else:
                motor_controller.girar_derecha(angulo)

        elif received.get("accion") == "curva":
            radio = received.get("radio_cm", 20)
            distancia = received.get("distancia_cm", 40)
            direccion = received.get("direccion", "izquierda")
            motor_controller.curva_suave(direccion, radio, distancia)

        elif received.get("accion") == "brazo":
            angulos = received.get("angulos", [90, 90, 90])
            tiempo = received.get("tiempo_s", 1.0)
            brazo_robotico.mover_brazo(angulos, tiempo)

        elif received.get("accion") == "ir_a":
            x0 = received.get("coor_ix", 0)
            y0 = received.get("coor_iy", 0)
            xf = received.get("coor_fx", x0)
            yf = received.get("coor_fy", y0)
            n = received.get("n", 1)

            dxs, dys = self.bezier(x0, y0, xf, yf, n)
            for dx, dy in zip(dxs, dys):
                # cada segmento es relativo
                if dx > 0:
                    motor_controller.mover_adelante(abs(dx))
                elif dx < 0:
                    motor_controller.mover_atras(abs(dx))
                if dy > 0:
                    motor_controller.girar_izquierda(abs(dy))
                elif dy < 0:
                    motor_controller.girar_derecha(abs(dy))

    def medir_distancia_cm(self):
        # Referencia: SunFounder Pico W HC-SR04 :contentReference[oaicite:1]{index=1}
        self.TRIG.low()
        time.sleep_us(2)
        self.TRIG.high()
        time.sleep_us(10)
        self.TRIG.low()
        dur = time_pulse_us(self.ECHO, 1, 30000)
        # velocidad sonido ≈29.1 μs/cm. Divide por 2 (ida+vuelta)
        return (dur / 2) / 29.1
    def bezier(self, coor_ix, coor_iy, coor_fx, coor_fy, n):
        ptos_x = []; ptos_y = []
        dist_x = []; dist_y = []
        pc_x = 0; pc_y = 0

        if coor_ix == 200:       pc_x = 180
        if coor_ix == -70:       pc_x = -190
        if coor_iy == -70:       pc_y = -200
        if coor_iy == -270:      pc_y = -210

        t_values = [i / 10 for i in range(0, 11)]
        for t_aux in t_values:
            Pto_x = (coor_ix * (1 - t_aux)**n +
                     n * pc_x * (1 - t_aux) * t_aux +
                     coor_fx * (t_aux)**n)
            Pto_y = (coor_iy * (1 - t_aux)**n +
                     n * pc_y * (1 - t_aux) * t_aux +
                     coor_fy * (t_aux)**n)
            ptos_x.append(Pto_x)
            ptos_y.append(Pto_y)

        for i in range(len(ptos_x) - 1):
            dist_x.append(ptos_x[i+1] - ptos_x[i])
            dist_y.append(ptos_y[i+1] - ptos_y[i])

        return dist_x, dist_y

        
    
        for i in range(len(ptos_x) - 1):
            valor_actual = ptos_x[i]
            suma = ptos_x[i+1] - ptos_x[i]
            dist_x.append(suma)
            valor_actual1 = ptos_y[i]
            suma1 = ptos_y[i+1] - ptos_y[i]
            dist_y.append(suma1)
            
        return dist_x, dist_y

