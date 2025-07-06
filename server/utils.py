# carro_wifi_module.py

import machine
import time
import network
import socket
import json

class Utils:
    def __init__(self, ssid, password, my_ip,host):
 
        # WiFi
        self.ssid = ssid
        self.password = password
        self.host = host
        self.my_ip = my_ip
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.ifconfig((self.my_ip, '255.255.255.0', self.host, '8.8.8.8'))


        # Conectar al iniciar
        self.connect_wifi()

    def connect_wifi(self):
        self.wlan.active(True)
        if not self.wlan.isconnected():
            print("Conectando a WiFi...")
            self.wlan.connect(self.ssid, self.password)
            timeout = 10
            start = time.time()
            while not self.wlan.isconnected():
                if time.time() - start > timeout:
                    print("❌ Timeout conectando WiFi")
                    break
                time.sleep(1)
        if self.wlan.isconnected():
            print("✅ WiFi conectado:", self.wlan.ifconfig())
        else:
            print("❌ No conectado a WiFi")

    def ensure_wifi(self):
        if not self.wlan.isconnected():
            print("WiFi desconectado, intentando reconectar...")
            self.connect_wifi()
    def get_ip(self):
        return self.my_ip
            




