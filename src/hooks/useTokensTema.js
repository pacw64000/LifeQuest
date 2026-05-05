import { useTemaVisual } from "../context/TemaVisualContext";

/**
 * Tokens de espacamento, tipografia, raio e flags de estetica — sempre derivados do tema atual.
 * Preferir isto a importar espacamento/tipografia de constants/layout em telas.
 */
export function useTokensTema() {
  const { tokens } = useTemaVisual();
  return tokens;
}
