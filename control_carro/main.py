import json
import time
from motor_controller import MotorController
from robot_arm_controller import BrazoRobotico
from my_oled_lib import MyOLED
from utils import UtilsProject
# --- Configuración de Pines I2C para la OLED ---
# Define los pines SDA y SCL que vas a usar.
# Para GP2 y GP3, puedes dejarlo así:
OLED_SDA_PIN = 26
OLED_SCL_PIN = 27
# Si quisieras usar otros pines, por ejemplo, GP4 y GP5, lo harías así:
# OLED_SDA_PIN = 4
# OLED_SCL_PIN = 5
# -----------------------------------------------

# --- Parámetros de modo prueba ---
modo_prueba = False  # True ejecuta prueba, luego pasa a modo normal

# JSON de prueba para modo_prueba (estructura Carro_1)
TEST_JSON = json.dumps({
    "Carro_1": {
        "Paso_1": {"Movimiento": {"distancia_mm": 1000, "velocidad_mm_s": 1000, "radio_mm": "inf"},
                   "Brazo":    {"angulo0_grados":90,   "angulo1_grados": 90,   "angulo2_grados": 90}},
         "Paso_2": {"Movimiento": {"distancia_mm":0, "velocidad_mm_s": 0, "radio_mm": "inf"},
                   "Brazo":    {"angulo0_grados":-90,   "angulo1_grados": 90,   "angulo2_grados": -90}},
    }
})
# Inicializa la pantalla OLED pasando los pines que has definido.
oled = MyOLED(sda_pin=OLED_SDA_PIN, scl_pin=OLED_SCL_PIN)

#-----------------


## Programa Principal Actualizado: Escucha Continua de Comandos

if __name__ == "__main__":
    # Inicializar hardware
    motors_controller = MotorController()
    arm_controller = BrazoRobotico()
    functions = UtilsProject()
    while modo_prueba:
        print("🚀 MODO PRUEBA ACTIVADO: ejecutando TEST_JSON")
        oled.write_text("MODO PRUEBA", 0, 0)
        pasos_prueba = functions.parsear_comando(TEST_JSON) 
        if pasos_prueba:
            for i, cmd in enumerate(pasos_prueba, start=1):
                print(f"[Prueba] Paso {i}: {cmd}")
                # Movimiento de brazo si aplica
                if cmd.get("angulos"):
                    arm_controller.mover_brazo(cmd["angulos"], cmd.get("t_ser", 1.0))
                    time.sleep(cmd.get("t_ser", 1.0))
                # Movimiento del rover: convertir mm a cm
                distancia_cm = cmd["distancia_abs"] / 10.0
                if cmd["tipo"] == "recto":
                    motors_controller.mover_adelante(distancia_cm)
                else:
                    if cmd["direccion_giro"] == "izquierda":
                        motors_controller.girar_izquierda(cmd["angulo"])
                    else:
                        motors_controller.girar_derecha(cmd["angulo"])
                    motors_controller.mover_adelante(distancia_cm)
            motors_controller.detener()
            oled.write_text("Fin prueba", 0, 20)
            print("✅ Modo prueba completado")
        else:
            print("ERROR: parsear_comando TEST_JSON devolvió None")
    # Buffer de comandos (cola FIFO)
    cola_comandos = []

    while True:
        oled.write_text("Proyecto final:3", 0, 0)

        # 📥 Leer mensaje UART si existe
        msg = functions.recibir_uart()
        if msg:
            accion = msg.get("accion")
            # 🛑 Detener todo: vaciar buffer y cortar movimiento
            if accion == "detener":
                cola_comandos.clear()
                motors_controller.detener()
                if hasattr(arm_controller, "detener"):
                    try:
                        arm_controller.detener()
                    except Exception:
                        pass
                try:
                    oled.write_text("⚠️ DETENER!", 0, 20)
                except Exception as e:
                    print("OLED error (detener):", e)
                # Saltar al inicio del bucle
                time.sleep(0.05)
                continue
            
            # Si no es detener, agregar al buffer
            cola_comandos.append(msg)

        # 🔄 Procesar próximo comando si existe
        if cola_comandos:
            prox = cola_comandos.pop(0)
            # Mostrar en OLED de forma segura
            try:
                oled.write_text("Ejecutando:", 0, 10)
                oled.write_text(prox.get("accion", ""), 0, 20)
                if prox.get(prox.get("ip")):
                   oled.write_text(prox.get("ip ", ""), 0, 20) 
            except Exception as e:
                print("OLED error (ejecución):", e)
            
            # Ejecutar comando con seguridad
            try:
                functions.parsear_json_uart(prox, motors_controller, arm_controller)
            except Exception as e:
                print("Error ejecutando comando:", prox, e)

        # Pequeña pausa para no saturar el CPU
        time.sleep(0.05)