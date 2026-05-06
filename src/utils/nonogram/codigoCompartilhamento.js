import * as Crypto from "expo-crypto";
import { codigoCompartilhamentoExiste } from "../../services/local/repositorioNonogram";
import { existeCodigoPublicoNoFirebase } from "../../services/firebase/repositorioNonogramPublico";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function gerarCodigoCompartilhamentoUnico() {
  for (let tentativa = 0; tentativa < 48; tentativa++) {
    const bytes = await Crypto.getRandomBytesAsync(12);
    let codigo = "";
    for (let i = 0; i < 6; i++) {
      codigo += ALFABETO[bytes[i % bytes.length] % ALFABETO.length];
    }
    if (await codigoCompartilhamentoExiste(codigo)) continue;
    if (await existeCodigoPublicoNoFirebase(codigo)) continue;
    return codigo;
  }
  throw new Error("Nao foi possivel gerar um codigo unico. Tente de novo.");
}
