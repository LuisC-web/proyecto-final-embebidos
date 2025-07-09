from machine import UART, Pin
from microdot import Microdot
import network
import json
import time
from microdot.cors import CORS
from utils import Utils
import _thread

PIN_LED = 18

# Configurar API REST
app = Microdot()
CORS(app, allowed_origins="*", allow_credentials=True)

# 🔌 Configurar UARTs
uart = UART(0, baudrate=115200, tx=Pin(16), rx=Pin(17), timeout=100)

# 🔴 Configurar LED para parpadeo
led = Pin(PIN_LED, Pin.OUT)
led_connected = False 

def led_blink_thread():
    """Función que hace parpadear el LED hasta que se conecte"""
    global led_connected
    while not led_connected:
        led.value(1)  
        time.sleep(0.3) 
        led.value(0)  
        time.sleep(0.3)  
    led.value(1)

# 🚀 Iniciar hilo del LED parpadeante
print("🔴 Iniciando LED parpadeante...")
_thread.start_new_thread(led_blink_thread, ())

# ✅ Inicializar Wi-Fi con conexión persistente
print("🚀 Iniciando sistema...")
wifi = Utils(
    ssid="luis",
    password="luis123!",
)
ip = wifi.get_ip()
if ip:
    led_connected = True
    print("🟢 LED fijo - Conexión establecida")
    time.sleep(0.5)  

# GET /api/status
@app.get("/api/status")
def status_handler(request):
    return json.dumps({
        "status": "online",
        "ip": ip
    }), 200

# POST /api/mover
@app.post("/api/mover")
def mover_handler(request):
    """
    Receives a movement command, sends it over UART, and returns a confirmation.
    """
    try:
        wifi.ensure_wifi()
        data = request.json
        if not data:
            return "Error: Body is empty. Direction is required.", 400
        # Convert the JSON data to a string and then to bytes to send via UART
        message = json.dumps(data).encode("utf-8")
        # Add a newline character as a delimiter for the receiving device
        uart.write(message + b"\n")
        print(f"📤 Sent via UART: {message.decode()}")
        response_data = {"status": "ok", "command_sent": data}
        return json.dumps(response_data), 200
        
    except Exception as e:
        print(f"❌ Error in mover_handler: {e}")
        return "Internal server error", 500

if ip:
    uart.write(json.dumps({"ip": ip, "accion": "ip"}).encode("utf-8"))
    print(f"🚀 Servidor HTTP escuchando en {ip}:5000/api/*")
else:
    print("⚠️  Iniciando servidor sin IP confirmada...")

app.run(host=ip or "0.0.0.0", port=5000, debug=True, ssl=None)

