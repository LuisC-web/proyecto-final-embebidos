import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
} from "lucide-react";
import { useRef } from "react";
import { AutoServices } from "../services/AutoServices";

function MovimientoCarro() {
  const intervalRef = useRef<number | null>(null);

  const iniciarMovimiento = (accion: () => Promise<any>) => {
    accion(); // Llama una vez
    intervalRef.current = setInterval(accion, 200); // Repite
  };

  const detenerMovimiento = (detener: () => Promise<any>) => {
    clearInterval(intervalRef.current ?? undefined);
    intervalRef.current = null;
    detener();
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 grid-rows-2 text-white">
        <ArrowBigUp
          className="size-10 col-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.mover_adelante)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigLeft
          className="size-10 col-start-1 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.girar_derecha)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigRight
          className="size-10 col-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.girar_izquierda)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigDown
          className="size-10 col-start-2 row-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.mover_atras)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
      </div>
    </div>
  );
}

export default MovimientoCarro;
