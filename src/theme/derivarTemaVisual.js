import { gerarPaletaTema } from "../utils/gerarPaletaTema";
import {
  ESTETICA_PIXEL,
  FONTE_PIXEL_FAMILY,
  normalizarEscalaFonte,
  tokensParaEstetica,
} from "../constants/layout";

/**
 * Ponto unico de derivacao: cores + tokens de layout a partir das preferencias persistidas.
 * Novas opcoes de aparencia: estender preferencias, mesclagem em TemaVisualContext e este modulo.
 *
 * @param {{ preferencias: object, fontesPixelCarregadas: boolean }} args
 * @returns {{ paleta: object, tokens: object }}
 */
export function derivarTemaVisual({ preferencias, fontesPixelCarregadas }) {
  const paleta = gerarPaletaTema(preferencias.corPrimaria, { corRodapeFim: preferencias.corRodapeFim });
  const fontePixelCarregada =
    preferencias.estetica === ESTETICA_PIXEL && fontesPixelCarregadas ? FONTE_PIXEL_FAMILY : null;
  const escalaFonte = normalizarEscalaFonte(preferencias.escalaFonte);
  const tokens = { ...tokensParaEstetica(preferencias.estetica, fontePixelCarregada), escalaFonte };
  return { paleta, tokens };
}
