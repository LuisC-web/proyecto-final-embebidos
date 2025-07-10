import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  MoveDownLeft,
  MoveDownRight,
  MoveUpLeft,
  MoveUpRight,
  RouteOff,
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
    <div className="w-full">
      <h2 className="text-2xl">Control carro</h2>
      <div className="grid grid-cols-3 gap-4 grid-rows-3 text-white w-1/2">
        <MoveUpLeft
          className="size-10 col-start-1 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.avanzar_izquierda)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <MoveUpRight
          className="size-10 col-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.avanzar_derecha)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <MoveDownLeft
          className="size-10 col-start-1 row-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() =>
            iniciarMovimiento(AutoServices.retroceder_izquierda)
          }
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <MoveDownRight
          className="size-10 col-start-3 row-start-3  cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.retroceder_derecha)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigUp
          className="size-10 col-start-2 row-start-1 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.mover_adelante)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <RouteOff
          className="size-10 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onClick={async () => AutoServices.detener()}
        />
        <ArrowBigLeft
          className="size-10 col-start-1 row-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.girar_izquierda)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigRight
          className="size-10 col-start-3 row-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.girar_derecha)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
        <ArrowBigDown
          className="size-10 col-start-2 row-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
          onMouseDown={() => iniciarMovimiento(AutoServices.mover_atras)}
          onMouseUp={() => detenerMovimiento(AutoServices.detener)}
          onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
        />
      </div>
      <h2 className="text-2xl">Control Brazo</h2>
      <div className="flex">
        <div className=" ">
          <h3>Ante brazo</h3>
          <div className="grid grid-cols-3 gap-4 grid-rows-3 text-white ">
            <ArrowBigUp
              className="size-10 col-start-2 row-start-1 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() => iniciarMovimiento(AutoServices.mover_adelante)}
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />

            <ArrowBigDown
              className="size-10 col-start-2 row-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() => iniciarMovimiento(AutoServices.mover_atras)}
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />
          </div>
        </div>
        <div className="">
          <h3>Hombro</h3>
          <div className="grid grid-cols-3 gap-4 grid-rows-3 text-white">
            <ArrowBigUp
              className="size-10 col-start-2 row-start-1 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() => iniciarMovimiento(AutoServices.mover_adelante)}
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />
            <ArrowBigDown
              className="size-10 col-start-2 row-start-3 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() => iniciarMovimiento(AutoServices.mover_atras)}
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />
          </div>
        </div>
        <div className="">
          <h3>Base</h3>
          <div className="grid grid-cols-3 gap-4 grid-rows-3 text-white">
            <ArrowBigLeft
              className="size-10 col-start-1 row-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() =>
                iniciarMovimiento(AutoServices.girar_izquierda)
              }
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />
            <ArrowBigRight
              className="size-10 col-start-3 row-start-2 cursor-pointer hover:bg-white/20 hover:scale-105 transition-all"
              onMouseDown={() => iniciarMovimiento(AutoServices.girar_derecha)}
              onMouseUp={() => detenerMovimiento(AutoServices.detener)}
              onMouseLeave={() => detenerMovimiento(AutoServices.detener)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovimientoCarro;
