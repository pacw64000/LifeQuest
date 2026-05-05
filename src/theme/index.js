/**
 * API publica do tema / aparencia.
 * Regra: telas e componentes usam useTemaVisual() (tokens + paleta), nao importam espacamento/tipografia
 * estaticos de constants/layout — assim mudancas no tema aplicam em todo o app.
 */

export { derivarTemaVisual } from "./derivarTemaVisual";

export {
  ESTETICA_COSMICO,
  ESTETICA_PIXEL,
  ESCALA_FONTE_MIN,
  ESCALA_FONTE_MAX,
  ESCALA_FONTE_PASSO,
  ESCALA_FONTE_PADRAO,
  normalizarEscalaFonte,
  fonteEscalada,
  FONTE_PIXEL_FAMILY,
} from "../constants/layout";
