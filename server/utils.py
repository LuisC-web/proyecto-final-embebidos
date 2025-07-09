import network
import time
import machine

class Utils:
    def __init__(self, ssid, password):
        self.ssid = ssid
        self.password = password
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)
        self.my_ip = None
        
        # 🚀 Optimizaciones para reducir latencia
        self.wlan.config(pm=0xa11140)  # Desactivar power management para menor latencia
        
        # Iniciar conexión inmediatamente
        self.connect_with_retry()

    def connect_wifi(self, timeout=15):
        """Conecta a Wi-Fi con timeout optimizado"""
        if self.wlan.isconnected():
            self.my_ip = self.wlan.ifconfig()[0]
            print(f"✅ Ya conectado: IP = {self.my_ip}")
            return True

        print(f"🔌 Conectando a '{self.ssid}'...")
        
        # Reiniciar interfaz para conexión limpia
        self.wlan.active(False)
        time.sleep(0.3)  # Tiempo mínimo necesario
        self.wlan.active(True)
        
        # Optimizaciones de latencia
        self.wlan.config(pm=0xa11140)  # Desactivar power management
        
        # Conectar
        self.wlan.connect(self.ssid, self.password)
        
        start = time.ticks_ms()
        dot_count = 0
        
        while not self.wlan.isconnected():
            elapsed = time.ticks_diff(time.ticks_ms(), start)
            
            if elapsed > timeout * 1000:
                print(f"\n❌ Timeout de {timeout}s alcanzado")
                return False
            
            # Mostrar progreso visual
            if dot_count % 4 == 0:
                print(".", end="")
            dot_count += 1
            
            time.sleep(0.25)  # Verificar cada 250ms para respuesta rápida
        
        # ✅ Conexión exitosa
        self.my_ip = self.wlan.ifconfig()[0]
        print(f"\n✅ Conectado exitosamente!")
        print(f"📍 IP asignada: {self.my_ip}")
        print(f"⚡ Tiempo de conexión: {elapsed/1000:.2f}s")
        
        # Configuraciones adicionales para optimizar latencia
        self.optimize_connection()
        
        return True

    def optimize_connection(self):
        """Aplica optimizaciones específicas para reducir latencia"""
        try:
            # Configurar parámetros de red para baja latencia
            config = self.wlan.ifconfig()
            print(f"🔧 Configuración de red: IP={config[0]}, Máscara={config[1]}, Gateway={config[2]}, DNS={config[3]}")
            
            # Verificar señal Wi-Fi
            signal_strength = self.wlan.status('rssi')
            print(f"📶 Intensidad de señal: {signal_strength} dBm")
            
            if signal_strength < -70:
                print("⚠️  Señal débil detectada. Considera acercarte al router.")
            
        except Exception as e:
            print(f"⚠️  No se pudieron aplicar todas las optimizaciones: {e}")

    def connect_with_retry(self, max_attempts=None):
        """
        Conecta en ciclo hasta lograr conexión exitosa
        max_attempts: None para intentos infinitos, número para límite
        """
        attempt = 1
        
        print("🚀 Iniciando conexión Wi-Fi persistente...")
        print(f"📡 Red objetivo: '{self.ssid}'")
        
        while True:
            if max_attempts and attempt > max_attempts:
                print(f"❌ Se alcanzó el límite de {max_attempts} intentos")
                break
                
            print(f"\n🔄 Intento #{attempt}")
            
            if self.connect_wifi():
                print("🎉 ¡Conexión establecida con éxito!")
                return True
            
            print(f"💤 Esperando 2 segundos antes del siguiente intento...")
            time.sleep(2)  # Pausa corta entre intentos
            attempt += 1
        
        return False

    def ensure_wifi(self):
        """Mantiene la conexión Wi-Fi activa"""
        if not self.wlan.isconnected():
            print("🔄 Conexión perdida. Reconectando...")
            return self.connect_with_retry()
        return True

    def get_ip(self):
        """Obtiene la IP actual"""
        if self.wlan.isconnected():
            return self.my_ip or self.wlan.ifconfig()[0]
        return None
    
    def get_connection_info(self):
        """Obtiene información detallada de la conexión"""
        if not self.wlan.isconnected():
            return None
        
        config = self.wlan.ifconfig()
        return {
            "ip": config[0],
            "subnet": config[1], 
            "gateway": config[2],
            "dns": config[3],
            "signal_strength": self.wlan.status('rssi'),
            "connected": True
        }

