/**
 * Valores base e construcao de tokens por estetica.
 * Telas devem usar useTemaVisual().tokens (derivado em theme/derivarTemaVisual.js), nao importar
 * espacamento/tipografia daqui diretamente — senao mudancas de tema nao aplicam por toda parte.
 */
/** Espacamento e tipografia compartilhados (complementam a paleta dinamica). */
export const espacamento = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
};

export const raio = {
  cartao: 14,
  botao: 12,
  pill: 999,
};

export const tipografia = {
  tituloHero: 26,
  tituloSecao: 20,
  corpo: 15,
  legenda: 13,
};

export const ESTETICA_COSMICO = "cosmico";
export const ESTETICA_PIXEL = "pixel";

/** Nome registrado pelo @expo-google-fonts/vt323 apos useFonts. */
export const FONTE_PIXEL_FAMILY = "VT323_400Regular";

export const ESCALA_FONTE_PADRAO = 1;
export const ESCALA_FONTE_MIN = 0.85;
export const ESCALA_FONTE_MAX = 1.35;
export const ESCALA_FONTE_PASSO = 0.05;

export function normalizarEscalaFonte(v) {
  if (v == null || typeof v !== "number" || Number.isNaN(v)) return ESCALA_FONTE_PADRAO;
  const n = Math.round(v / ESCALA_FONTE_PASSO) * ESCALA_FONTE_PASSO;
  return Math.min(ESCALA_FONTE_MAX, Math.max(ESCALA_FONTE_MIN, n));
}

/** Tamanho de fonte para TextInput e similares (px logicos). */
export function fonteEscalada(tamanhoBase, escalaFonte) {
  const e = normalizarEscalaFonte(escalaFonte);
  return Math.max(11, Math.round(tamanhoBase * e));
}

/**
 * Tokens de layout e estilo por estetica (cosmico = atual; pixel = retro).
 * @param {string} estetica - "cosmico" | "pixel"
 * @param {string|null|undefined} fontFamilyPixel - fontFamily para Text em modo pixel (null = sistema)
 */
export function tokensParaEstetica(estetica, fontFamilyPixel = null) {
  const pixel = estetica === ESTETICA_PIXEL;
  const ff = pixel && fontFamilyPixel ? fontFamilyPixel : undefined;

  const baseTipografia = pixel
    ? { tituloHero: 28, tituloSecao: 22, corpo: 17, legenda: 14, tabBarLabel: 12 }
    : { tituloHero: 26, tituloSecao: 20, corpo: 15, legenda: 13, tabBarLabel: 11 };

  return {
    estetica: pixel ? ESTETICA_PIXEL : ESTETICA_COSMICO,
    usarFaixasEmVezDeGradiente: pixel,
    fundoDecoracao: pixel ? "grade" : "estrelas",
    espacamento: pixel ? { xs: 4, sm: 8, md: 14, lg: 20, xl: 26 } : { ...espacamento },
    raio: pixel ? { cartao: 0, botao: 0, pill: 2 } : { ...raio },
    tipografia: baseTipografia,
    fontFamilyTexto: ff,
    bordaDestaque: pixel ? 2 : 0,
    tabBarBorderTop: pixel ? 2 : 0,
    tabBarTopRadius: pixel ? 0 : 18,
  };
}
