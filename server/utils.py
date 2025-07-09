# carro_wifi_module.py

import network
import time
import machine

class Utils:
    def __init__(self, ssid, password):
        self.ssid = ssid
        self.password = password
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)
        self.connect_wifi()

    def connect_wifi(self, timeout=10):
        if self.wlan.isconnected():
            return True

        print("🔌 Conectando a Wi‑Fi…")
        self.wlan.active(False)
        time.sleep(0.5)
        self.wlan.active(True)
        self.wlan.connect(self.ssid, self.password)

        start = time.ticks_ms()
        while not self.wlan.isconnected():
            if time.ticks_diff(time.ticks_ms(), start) > timeout * 1000:
                print(f"❌ Timeout de {timeout}s. Reintentando…")
                return False
            time.sleep(1)
        self.my_ip = self.wlan.ifconfig()[0]
        print(f"✅ Conectado: IP = {self.my_ip}")
        return True

    def ensure_wifi(self):
        while not self.wlan.isconnected():
            print("🔄 Wi‑Fi desconectado. Reintentando conexión...")
            if not self.connect_wifi():
                time.sleep(5)  # espera antes de reintentar
            else:
                break
        return True

    def get_ip(self):
        if self.wlan.isconnected():
            return getattr(self, 'my_ip', self.wlan.ifconfig()[0])
        return None

