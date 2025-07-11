import { api } from "../api/api_base";

export class AutoServices {
  static async mover_carro({ dx, dy }: { dx: number; dy: number }) {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: dx,
        coor_fy: dy,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }

  static async detener() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "detener",
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async mover_brazo({
    angulo_base,
    angulos_brazo,
    angulo_hombro,
  }: {
    angulo_base: number;
    angulos_brazo: number;
    angulo_hombro: number;
  }) {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "brazo_relativo",
        desplazamientos: [angulo_base, angulos_brazo, angulo_hombro],
        tiempo_s: 0.6,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
}
