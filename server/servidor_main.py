from machine import UART, Pin
from phew import server, connect_to_wifi
import json

# 🔌 Configurar UART (TX = GP0, RX = GP1)
uart = UART(0, baudrate=9600, tx=Pin(16), rx=Pin(17))

# 📶 Conexión WiFi con DHCP
ip = connect_to_wifi("luis", "luis123!")
if not ip:
    raise RuntimeError("❌ No se pudo conectar a WiFi")
print("✅ Conectado a WiFi. IP:", ip)

# ✅ GET /api/status
@server.route("/api/status", methods=["GET"])
def status_handler(request):
    return json.dumps({ "status": "online", "ip": ip }), 200, {"Content-Type": "application/json"}

# 🚗 POST /api/mover
@server.route("/api/mover", methods=["POST"])
def mover_handler(request):
    try:
        data = request.data
        if not data:
            return "Dirección requerida", 400
        print(data)
        mensaje = json.dumps(data).encode("utf-8")
        uart.write(mensaje+"\n")
        print("📤 Enviado por UART:", mensaje)

        return json.dumps({ "status": "ok", "comando": mensaje }), 200, {"Content-Type": "application/json"}

    except Exception as e:
        print("❌ Error en mover_handler:", e)
        return "Error interno", 500

# 🌐 Ruta no encontrada
@server.catchall()
def not_found_handler(request):
    return "Ruta no encontrada", 404

# 🟢 Ejecutar servidor
print("🚀 Servidor HTTP escuchando en /api/*")
server.run()
