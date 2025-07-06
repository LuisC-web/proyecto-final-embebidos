import json
import time
from motor_controller import MotorController
from robot_arm_controller import BrazoRobotico
from carro_wifi_module import CarroWiFi
from my_oled_lib import MyOLED
from utils import UtilsProject
# --- Configuración de Pines I2C para la OLED ---
# Define los pines SDA y SCL que vas a usar.
# Para GP2 y GP3, puedes dejarlo así:
OLED_SDA_PIN = 2
OLED_SCL_PIN = 3 
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
#oled = MyOLED(sda_pin=OLED_SDA_PIN, scl_pin=OLED_SCL_PIN)

#-----------------


## Programa Principal Actualizado: Escucha Continua de Comandos

if __name__ == "__main__":
    # Inicializar hardware
    motors_controller = MotorController()
    arm_controller = BrazoRobotico()
    tiempo_ultima_actualizacion = time.ticks_ms()
    
    while modo_prueba:
        print("🚀 MODO PRUEBA ACTIVADO: ejecutando TEST_JSON")
        oled.write_text("MODO PRUEBA", 0, 0)
        pasos_prueba = parsear_comando(TEST_JSON) 
        ahora = time.ticks_ms()
        if time.ticks_diff(ahora, tiempo_ultima_actualizacion) > 5000:
            voltaje = utilidad.verificar_bateria()
            print(f"🔋 Voltaje: {voltaje}V")
            oled.write_text(f"Bat: {voltaje}V", 0, 20)
            tiempo_ultima_actualizacion = ahora
        if pasos_prueba:
            for i, cmd in enumerate(pasos_prueba, start=1):
                print(f"[Prueba] Paso {i}: {cmd}")
                # Movimiento de brazo si aplica
                if cmd.get("angulos"):
                    brazo_robotico.mover_brazo(cmd["angulos"], cmd.get("t_ser", 1.0))
                    time.sleep(cmd.get("t_ser", 1.0))
                # Movimiento del rover: convertir mm a cm
                distancia_cm = cmd["distancia_abs"] / 10.0
                if cmd["tipo"] == "recto":
                    controlador_rover.mover_adelante(distancia_cm)
                else:
                    if cmd["direccion_giro"] == "izquierda":
                        controlador_rover.girar_izquierda(cmd["angulo"])
                    else:
                        controlador_rover.girar_derecha(cmd["angulo"])
                    controlador_rover.mover_adelante(distancia_cm)
            controlador_rover.detener()
            oled.write_text("Fin prueba", 0, 20)
            print("✅ Modo prueba completado")
        else:
            print("ERROR: parsear_comando TEST_JSON devolvió None")
    functions = UtilsProject()


    while True: # Bucle infinito para escuchar continuamente
        msg = functions.recibir_uart()
        if msg:
            functions.parsear_json_uart(msg, motors_controller, arm_controller)
        
        
        
 