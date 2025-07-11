import Joystick from "../components/Joystick";
import { AutoServices } from "../services/AutoServices";
import { useState, useRef } from "react";

interface JoystickValue {
  angle?: number;
  distance: number;
  direction: string;
}

function MovimientoCarro() {
  const [isExecuting, setIsExecuting] = useState(false);
  // Eliminado joystickData porque no se usa

  // Estados para cada componente del brazo
  const [isBaseExecuting, setIsBaseExecuting] = useState(false);
  const [isBrazoExecuting, setIsBrazoExecuting] = useState(false);
  const [isHombroExecuting, setIsHombroExecuting] = useState(false);

  const [baseData, setBaseData] = useState<JoystickValue | null>(null);
  const [brazoData, setBrazoData] = useState<JoystickValue | null>(null);
  const [hombroData, setHombroData] = useState<JoystickValue | null>(null);

  // Referencias para timers
  const carroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brazoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hombroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HOLD_TIME = 50;

  const changeCarro = async (val: JoystickValue) => {
    // Eliminado setJoystickData porque no se usa

    if (carroTimerRef.current) {
      clearTimeout(carroTimerRef.current);
      carroTimerRef.current = null;
    }

    if (val.direction === "Center") {
      await AutoServices.detener();
      return;
    }

    if (val.angle !== undefined && val.distance > 0.1) {
      carroTimerRef.current = setTimeout(async () => {
        if (!isExecuting) {
          setIsExecuting(true);

          const radio = 10 * val.distance;
          const radianes = (val.angle! * Math.PI) / 180;
          const cosAngulo = Math.cos(radianes);
          const senAngulo = Math.sin(radianes);
          const coodernadaY = Math.round(cosAngulo * radio);
          const coodernadaX = Math.round(senAngulo * radio);
          console.log("Coordanada x-y", coodernadaX, coodernadaY);

          await AutoServices.mover_carro({ dx: coodernadaX, dy: coodernadaY });
          setIsExecuting(false);
        }
      }, HOLD_TIME);
    }
  };

  // Control de la BASE (rotación horizontal)
  const changeBase = async (val: JoystickValue) => {
    setBaseData(val);

    if (baseTimerRef.current) {
      clearTimeout(baseTimerRef.current);
      baseTimerRef.current = null;
    }

    if (val.direction === "Center") {
      setBaseData(null);
      return;
    }

    if (val.angle !== undefined && val.distance > 0.1) {
      baseTimerRef.current = setTimeout(async () => {
        if (!isBaseExecuting) {
          setIsBaseExecuting(true);

          const intensidad = 10 * val.distance;
          const radianes = (val.angle! * Math.PI) / 180;
          const senAngulo = Math.cos(radianes);

          // Solo controla la base (rotación horizontal)
          const angulo_base = Math.round(senAngulo * intensidad);

          await AutoServices.mover_brazo({
            angulo_base,
            angulos_brazo: 0,
            angulo_hombro: 0,
          });

          setIsBaseExecuting(false);
        }
      }, HOLD_TIME);
    }
  };

  // Control del BRAZO (elevación/extensión)
  const changeBrazo = async (val: JoystickValue) => {
    setBrazoData(val);
    if (brazoTimerRef.current) {
      clearTimeout(brazoTimerRef.current);
      brazoTimerRef.current = null;
    }

    if (val.direction === "Center") {
      setBrazoData(null);
      return;
    }

    if (val.angle !== undefined && val.distance > 0.1) {
      brazoTimerRef.current = setTimeout(async () => {
        if (!isBrazoExecuting) {
          setIsBrazoExecuting(true);

          const intensidad = 20 * val.distance;
          const radianes = (val.angle! * Math.PI) / 180;
          const cosAngulo = Math.sin(radianes);

          // Solo controla el brazo (elevación/extensión)
          const angulos_brazo = Math.round(cosAngulo * intensidad);
          console.log(angulos_brazo);
          await AutoServices.mover_brazo({
            angulo_base: 0,
            angulos_brazo,
            angulo_hombro: 0,
          });

          setIsBrazoExecuting(false);
        }
      }, HOLD_TIME);
    }
  };

  // Control del HOMBRO (articulación del hombro)
  const changeHombro = async (val: JoystickValue) => {
    setHombroData(val);

    if (hombroTimerRef.current) {
      clearTimeout(hombroTimerRef.current);
      hombroTimerRef.current = null;
    }

    if (val.direction === "Center") {
      setHombroData(null);
      return;
    }

    if (val.angle !== undefined && val.distance > 0.1) {
      hombroTimerRef.current = setTimeout(async () => {
        if (!isHombroExecuting) {
          setIsHombroExecuting(true);

          const intensidad = 20 * val.distance;
          const radianes = (val.angle! * Math.PI) / 180;
          const senAngulo = Math.sin(radianes);

          // Solo controla el hombro
          const angulo_hombro = Math.round(senAngulo * intensidad);

          await AutoServices.mover_brazo({
            angulo_base: 0,
            angulos_brazo: 0,
            angulo_hombro,
          });

          setIsHombroExecuting(false);
        }
      }, HOLD_TIME);
    }
  };

  return (
    <div className="w-full mx-auto p-6 min-h-screen">
      {/* Control del Carro */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Control Carro</h2>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4 inline-block">
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isExecuting ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {isExecuting ? "Moviendo carro..." : "Carro listo"}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <Joystick onChange={changeCarro} size="lg" variant="primary" />
        </div>
      </div>

      {/* Control del Brazo Robótico */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Control Brazo Robótico
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Control de BASE */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              🔄 Base (Rotación)
            </h3>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isBaseExecuting
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-blue-700">
                  {isBaseExecuting ? "Rotando..." : "Listo"}
                </span>
              </div>
              {baseData && (
                <div className="text-xs mt-2 font-mono text-blue-600">
                  {baseData.angle !== undefined
                    ? `${baseData.angle.toFixed(0)}°`
                    : "Centro"}
                </div>
              )}
            </div>

            <Joystick
              onChange={changeBase}
              size="md"
              variant="secondary"
              lockAxis="horizontal"
            />
            <p className="text-xs text-gray-500 mt-2">Izq/Der para rotar</p>
          </div>

          {/* Control de BRAZO */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              📐 Brazo (Elevación)
            </h3>

            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isBrazoExecuting
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-green-700">
                  {isBrazoExecuting ? "Moviendo..." : "Listo"}
                </span>
              </div>
              {brazoData && (
                <div className="text-xs mt-2 font-mono text-green-600">
                  {brazoData.angle !== undefined
                    ? `${brazoData.angle.toFixed(0)}°`
                    : "Centro"}
                </div>
              )}
            </div>

            <Joystick
              onChange={changeBrazo}
              size="md"
              variant="accent"
              lockAxis="vertical"
            />
            <p className="text-xs text-gray-500 mt-2">
              Arriba/Abajo para elevar
            </p>
          </div>

          {/* Control de HOMBRO */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">
              🦾 Hombro (Articulación)
            </h3>
            <div className="bg-purple-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isHombroExecuting
                      ? "bg-purple-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-purple-700">
                  {isHombroExecuting ? "Moviendo..." : "Listo"}
                </span>
              </div>
              {hombroData && (
                <div className="text-xs mt-2 font-mono text-purple-600">
                  {hombroData.angle !== undefined
                    ? `${hombroData.angle.toFixed(0)}°`
                    : "Centro"}
                </div>
              )}
            </div>
            <Joystick
              onChange={changeHombro}
              size="md"
              variant="primary"
              lockAxis="vertical"
            />
            <p className="text-xs text-gray-500 mt-2">Flexión del hombro</p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          📋 Instrucciones de Control
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
          <div>
            <h4 className="font-semibold">🚗 Carro:</h4>
            <ul className="text-sm space-y-1">
              <li>• Joystick grande para movimiento compconsto</li>
              <li>• Todas las direcciones disponibles</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">🦾 Brazo:</h4>
            <ul className="text-sm space-y-1">
              <li>
                • <span className="text-blue-600">Base</span>: Rotación
                izquierda/derecha
              </li>
              <li>
                • <span className="text-green-600">Brazo</span>: Elevación
                arriba/abajo
              </li>
              <li>
                • <span className="text-purple-600">Hombro</span>: Articulación
                del hombro
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovimientoCarro;
