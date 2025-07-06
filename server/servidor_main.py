from machine import UART, Pin
from microdot import Microdot
import network
import json
import time
from phew import connect_to_wifi
from microdot.cors import CORS
#Credenciales
ssid="luis"
password="luis123!"
#Configurar de api rest
app = Microdot()
CORS(app, allowed_origins="*", allow_credentials=True)
# 🔌 Configurar UART (TX = GP0, RX = GP1)
uart = UART(0, baudrate=9600, tx=Pin(16), rx=Pin(17))
ip = connect_to_wifi("luis", "luis123!")
if not ip:
    raise RuntimeError("❌ No se pudo conectar a WiFi")
print("✅ Conectado a WiFi. IP:", ip)
# ✅ GET /api/status
@app.get("/api/status")
def status_handler(request):
    return json.dumps({ "status": "online", "ip": ip }), 200

# 🚗 POST /api/mover
@app.post("/api/mover")
def mover_handler(request):
    """
    Receives a movement command, sends it over UART,
    and returns a confirmation.
    """
    try:
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

# 🟢 Ejecutar servidor
print("🚀 Servidor HTTP escuchando en /api/*")
app.run(host=ip, port=5000, debug=True, ssl=None)
