import { api } from "../api/api_base";

export class AutoServices {
  static async mover_adelante() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "mover",
        movimiento: {
          direccion: "adelante",
          distancia_cm: 20,
        },
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async mover_atras() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "mover",
        movimiento: {
          direccion: "atras",
          distancia_cm: 20,
        },
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async girar_izquierda() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "girar",
        direccion: "izquierda",
        angulo: 45,
      });
      return data.ok;
    } catch (error) {
      console.log("Se produjo un error", error);
    }
  }
  static async girar_derecha() {
    try {
      const { data } = await api.post("/api/mover", {
        accion: "girar",
        direccion: "derecha",
        angulo: 45,
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
