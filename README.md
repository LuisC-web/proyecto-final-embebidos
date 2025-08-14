#  Sistema de Control Robótico con React y Raspberry Pi Pico W

Un sistema completo de control robótico que integra un frontend web desarrollado en **React.js** con un backend en **MicroPython** usando **Microdot**, comunicándose con una **Raspberry Pi Pico W** para el control de motores y brazo robótico.

## 📋 Descripción del Proyecto

Este proyecto implementa una arquitectura distribuida para el control remoto de un sistema robótico, permitiendo el manejo de un carro móvil y un brazo robótico a través de una interfaz web intuitiva con joysticks virtuales.

### 🏗️ Arquitectura del Sistema

```
Frontend (React.js) → API REST (Microdot) → UART → Raspberry Pi Pico W → Hardware
```

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React.js** con TypeScript
- **Tailwind CSS** para estilos
- **Joysticks personalizados** para control de movimiento
- **Fetch API** para comunicación HTTP

### **Backend**
- **MicroPython** con framework **Microdot**
- **API REST** para endpoints de control
- **CORS** habilitado para comunicación cross-origin
- **UART** para comunicación serie

### **Hardware**
- **Raspberry Pi Pico W** como controlador principal
- **Motores** para movimiento del carro
- **Servomotores** para control del brazo robótico
- **Display OLED** para información del sistema

## 🚀 Características Principales

### **Control de Movimiento**
- ✅ **Joystick para carro**: Control omnidireccional con retención de tiempo
- ✅ **Joysticks para brazo**: Control independiente de base, brazo y hombro
- ✅ **Bloqueo de ejes**: Joysticks con restricción horizontal/vertical
- ✅ **Feedback visual**: Estados en tiempo real de todos los componentes

### **Comunicación Robusta**
- ✅ **API REST completa**: Endpoints para todos los controles
- ✅ **Protocolo JSON**: Comunicación estructurada via UART
- ✅ **Manejo de errores**: Reconexión automática y recuperación

## 📁 Estructura del Proyecto

```
proyecto-robotico/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Joystick.tsx          # Joystick personalizado
│   │   │   └── MovimientoCarro.tsx   # Componente principal
│   │   ├── services/
│   │   │   └── AutoServices.ts       # API calls
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
├── server/
│   ├── main.py                       # Servidor Microdot
│   ├── utils.py                     # Utilidades WiFi
│   └── requirements.txt
└──control_carro/
    ├── motor_controller.py          # Control motores
    ├── robot_arm_controller.py      # Control brazo
    └── my_oled_lib.py              # Display OLED
```

## 🔧 Instalación y Configuración

### **Frontend (React.js)**

```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd proyecto-robotico/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "REACT_APP_API_URL=http://192.168.1.100:5000" > .env

# Iniciar desarrollo
npm run dev
```

### **Backend (Raspberry Pi Pico W)**

```python
# Subir archivos a la Pico W
# main.py - Servidor principal
# utils.py - Conexión WiFi

# Configurar WiFi en main.py
wifi = Utils(
    ssid="tu_red_wifi",
    password="tu_password"
)
```

## 🎮 Uso del Sistema

### **Controles Disponibles**

#### **Control del Carro**
- **Joystick principal**: Movimiento omnidireccional
- **Retención**: Mantener posición por 50ms para ejecutar
- **Detención automática**: Al soltar el joystick

#### **Control del Brazo Robótico**
- **Base**: Joystick con bloqueo horizontal para rotación
- **Brazo**: Joystick con bloqueo vertical para elevación
- **Hombro**: Joystick libre para articulación del hombro

### **Endpoints API Disponibles**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/status` | GET | Estado general del sistema |
| `/api/mover` | POST | Enviar comandos de movimiento |

### **Formato de Comandos JSON**

```json
{
  "accion": "mover_carro",
  "dx": 15,
  "dy": 10,
  "tiempo_s": 1.0
}
```

```json
{
  "accion": "brazo_relativo",
  "desplazamientos": [10, -5, 20],
  "tiempo_s": 1.5
}
```

## 🔌 Conexiones Hardware

### **Comunicación UART**
```
TX → GP16 (Pin 21)
RX → GP17 (Pin 22)
Baudrate: 115200
```

## 🤝 Contribuciones del Curso

Este proyecto integra código y conocimientos compartidos por compañeros del curso:

- **Conexión WiFi**: Implementación robusta con reconexión automática
- **Control de motores**: Algoritmos de movimiento y navegación
- **Control de brazo robótico**: Cinemática y control de servomotores
- **Integración OLED**: Display de información del sistema
- **Manejo de sensores**: Ultrasonido y otros sensores de navegación

## ⚠️ Limitaciones Conocidas

### **Sistema de Cámara**
**❌ Cámara OV7670 no implementada**: Durante el desarrollo se intentó integrar una cámara OV7670 para captura de imágenes, pero se presentaron los siguientes problemas técnicos:

- **Conflictos de Core1**: Error "Core1 in use" al intentar ejecutar hilos simultáneos
- **Problemas de I2C**: La cámara no fue detectada consistentemente en la dirección 0x21
- **Limitaciones de memoria**: La Raspberry Pi Pico W no tenía suficiente RAM para manejar el buffer de imágenes junto con el servidor HTTP
- **Complejidad de integración**: Los drivers de la OV7670 requerían configuraciones específicas que no fueron compatibles con el framework Microdot

**Decisión técnica**: Se optó por enfocar el proyecto en el control de movimiento robusto en lugar de incluir funcionalidades de cámara que podrían comprometer la estabilidad del sistema principal.

## 🚨 Solución de Problemas

### **Problemas Comunes**

#### **Core1 ocupado**
```python
# Reiniciar físicamente la Pico W
# Desconectar y reconectar alimentación
```

#### **Error de conexión WiFi**
- Verificar SSID y contraseña
- Comprobar que la red esté disponible
- Revisar configuración de IP estática si se usa

## 📊 Rendimiento

- **Latencia de control**: ~50-100ms
- **Comunicación UART**: 115200 baudios
- **Consumo de memoria**: Optimizado para 264KB RAM
- **Estabilidad**: Sistema robusto sin funcionalidades de cámara

## 🔮 Funcionalidades Futuras

- [ ] **Sistema de cámara alternativo**: Explorar cámaras más simples o módulos externos
- [ ] **Control por voz**: Integración con Web Speech API
- [ ] **Modo autónomo**: Navegación automática con sensores
- [ ] **Grabación de trayectorias**: Reproducir secuencias de movimiento
- [ ] **Múltiples dispositivos**: Soporte para varios robots simultáneos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- Luis Angel Camargo Guzman - 20221005086
- Andrea Carolina León Riveros- 20152005049
