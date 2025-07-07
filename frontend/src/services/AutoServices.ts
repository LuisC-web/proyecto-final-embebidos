import { api } from "../api/api_base";

export class AutoServices {
  static async mover_adelante() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: 20,
        coor_fy: 0,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async mover_atras() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: -20,
        coor_fy: 0,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async avanzar_derecha() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: 40,
        coor_fy: 10,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async avanzar_izquierda() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: 40,
        coor_fy: -1,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async retroceder_derecha() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: -20,
        coor_fy: -20,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async retroceder_izquierda() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: -20,
        coor_fy: 20,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async girar_izquierda() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: 5,
        coor_fy: -35,
        n: 1,
        coor_ix: 0,
        coor_iy: 0,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async girar_derecha() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "ir_a",
        coor_fx: 5,
        coor_fy: 35,
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
}
