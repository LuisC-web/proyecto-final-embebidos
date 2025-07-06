# utils.py

import network
import socket
import json
import time
from machine import UART, Pin

class WifiAPI:
    def __init__(self, ssid, password, port=80, uart_tx=16, uart_rx=17, baudrate=9600):
        self.ssid = ssid
        self.password = password
        self.port = port

        # Configurar UART
        self.uart = UART(0, baudrate=baudrate, tx=Pin(uart_tx), rx=Pin(uart_rx))
        self.uart_buffer = b""
        # Configurar WiFi en modo cliente (STA)
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)

        self.connect_wifi()  # conexión por DHCP

        # Servidor HTTP
        self.server_socket = socket.socket()
        self.server_socket.bind(('0.0.0.0', self.port))
        self.server_socket.listen(1)
        print(f"🚀 API escuchando en puerto {self.port}...")

        # Endpoints registrados (ruta: función)
        self.endpoints = {
            "GET /api/status": self.api_status,
            "POST /api/mover": self.api_mover
        }

    def connect_wifi(self):
        print("📡 Conectando a WiFi...")
        self.wlan.connect(self.ssid, self.password)

        intento = 0
        while not self.wlan.isconnected() and intento < 20:
            print(f"⏳ Intentando conectar... ({intento})")
            time.sleep(1)
            intento += 1

        if self.wlan.isconnected():
            print("✅ Conectado a WiFi")
            print("🌐 IP:", self.wlan.ifconfig()[0])
        else:
            print("❌ No se pudo conectar al WiFi.")
            raise RuntimeError("Fallo de conexión WiFi")

    def manejar_peticion(self, request):
        try:
            headers = request.split("\r\n")
            metodo, ruta, _ = headers[0].split(" ")
            clave = f"{metodo} {ruta}"

            if clave in self.endpoints:
                return self.endpoints[clave](request)

            return "HTTP/1.1 404 Not Found\r\n\r\n"

        except Exception as e:
            print("❌ Error en petición:", e)
            return "HTTP/1.1 500 Internal Server Error\r\n\r\n"

    def api_status(self, _request):
        estado = {
            "status": "ok",
            "ip": self.wlan.ifconfig()[0],
            "ssid": self.ssid
        }
        return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + json.dumps(estado)

    def api_mover(self, request):
        try:
            body = request.split("\r\n\r\n")[1]
            data = json.loads(body)

            direccion = data.get("direccion")
            distancia = data.get("distancia", 10)

            comando = json.dumps({
                "accion": "mover",
                "direccion": direccion,
                "distancia": distancia
            })

            self.uart.write(comando + "\n")
            print("📤 Enviado por UART:", comando)

            return "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + json.dumps({"status": "ok"})
        except Exception as e:
            print("❌ Error en /api/mover:", e)
            return "HTTP/1.1 400 Bad Request\r\n\r\n"

    def servir(self):
        while True:
            cl, addr = self.server_socket.accept()
            try:
                request = cl.recv(1024).decode()
                print(f"📥 Petición de {addr[0]}:\n{request}")
                respuesta = self.manejar_peticion(request)
                cl.send(respuesta)
            except Exception as e:
                print("❌ Error en conexión:", e)
            finally:
                cl.close()


class UtilsProject:
    def __init__(self, uart_id=0, baudrate=9600, tx_pin=16, rx_pin=17,timeout=100, timeout_char=10):
        """
        Inicializa el UART y parámetros básicos para comunicación serial.
        """
        self.uart = UART(uart_id, baudrate=baudrate, tx=tx_pin, rx=rx_pin,timeout=timeout, timeout_char=timeout_char)
        self.uart_buffer = b""
        self.uart.read()

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

        elif received.get("accion") == "detener":
            motor_controller.detener()


