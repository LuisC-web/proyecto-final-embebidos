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
modo_prueba = False

# Variable global simple
oled_ok = False

def try_oled_operation(operation):
    """Ejecuta operación OLED y retorna si fue exitosa"""
    global oled_ok
    try:
        operation()
        oled_ok = True
        return True
    except:
        oled_ok = False
        return False

def init_oled():
    """Inicializa OLED una sola vez"""
    global oled
    try:
        oled = MyOLED(sda_pin=OLED_SDA_PIN, scl_pin=OLED_SCL_PIN)
        return True
    except:
        return False

# TEST JSON
TEST_JSON = json.dumps({
    "Carro_1": {
        "Paso_1": {"Movimiento": {"distancia_mm": 1000, "velocidad_mm_s": 1000, "radio_mm": "inf"},
                   "Brazo":    {"angulo0_grados":90,   "angulo1_grados": 90,   "angulo2_grados": 90}},
         "Paso_2": {"Movimiento": {"distancia_mm":0, "velocidad_mm_s": 0, "radio_mm": "inf"},
                   "Brazo":    {"angulo0_grados":-90,   "angulo1_grados": 90,   "angulo2_grados": -90}},
    }
})

if __name__ == "__main__":
    # Inicializar hardware crítico PRIMERO
    motors_controller = MotorController()
    arm_controller = BrazoRobotico()
    functions = UtilsProject()
    
    # Intentar OLED (si falla, continúa sin ella)
    oled = None
    init_oled()
    
    # Modo prueba
    while modo_prueba:
        print("🚀 MODO PRUEBA ACTIVADO")
        try_oled_operation(lambda: oled.write_text("MODO PRUEBA", 0, 0))
        
        pasos_prueba = functions.parsear_comando(TEST_JSON) 
        if pasos_prueba:
            for i, cmd in enumerate(pasos_prueba, start=1):
                print(f"[Prueba] Paso {i}: {cmd}")
                if cmd.get("angulos"):
                    arm_controller.mover_brazo(cmd["angulos"], cmd.get("t_ser", 1.0))
                    time.sleep(cmd.get("t_ser", 1.0))
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
            try_oled_operation(lambda: oled.write_text("Fin prueba", 0, 20))
            print("✅ Modo prueba completado")
        modo_prueba = False
    
    # Variables del programa principal
    cola_comandos = []
    DIST_CRITICA = 10
    oled_retry_counter = 0

    # CICLO PRINCIPAL ULTRA-SIMPLE
    while True:
        # Cada 50 ciclos, intentar reconectar OLED si falló
        oled_retry_counter += 1
        if oled_retry_counter > 50 and not oled_ok:
            oled_retry_counter = 0
            init_oled()

        # Mostrar estado (con lambda para evitar errores)
        try_oled_operation(lambda: oled.write_text("Proyecto final:3", 0, 0))

        # LÓGICA PRINCIPAL (sin dependencias de OLED)
        msg = functions.recibir_uart()
        ultra_sonido_distancia = functions.medir_distancia_cm()
        
        if ultra_sonido_distancia is not None:
            if ultra_sonido_distancia < DIST_CRITICA:
                motors_controller.girar_derecha(30)
                try_oled_operation(lambda: [
                    oled.clear(),
                    oled.write_text("Proyecto final:3", 0, 0),
                    oled.write_text(f"🚨 Obstáculo {ultra_sonido_distancia:.1f}cm", 0, 20)
                ])
                time.sleep(0.1)
                continue
            else:
                motors_controller.detener()
        
        if msg: 
            accion = msg.get("accion")
            if accion == "detener":
                cola_comandos.clear()
                motors_controller.detener()
                if hasattr(arm_controller, "detener"):
                    try:
                        arm_controller.detener()
                    except:
                        pass
                try_oled_operation(lambda: [
                    oled.clear(),
                    oled.write_text("Proyecto final:3", 0, 0),
                    oled.write_text("⚠️ DETENER!", 0, 20)
                ])
                time.sleep(0.05)
                continue
            
            cola_comandos.append(msg)

        if cola_comandos:
            prox = cola_comandos.pop(0)
            try_oled_operation(lambda: [
                oled.clear(),
                oled.write_text("Ejecutando:", 0, 10),
                oled.write_text(prox.get("accion", ""), 0, 20),
                oled.write_text(prox.get("ip", ""), 0, 50) if prox.get("ip") else None
            ])
            
            try:
                functions.parsear_json_uart(prox, motors_controller, arm_controller)
            except Exception as e:
                print(f"Error ejecutando comando: {prox}, {e}")

        time.sleep(0.05)

