/**
 * Gera paleta de UI a partir de uma cor primaria (hex).
 * Tema "Retro Pixel Quest" – alinhado ao design do PDF LifeQuest.
 */

const COR_PRIMARIA_PADRAO = "#4A7BC4";

function normalizarHex(cor) {
  if (!cor || typeof cor !== "string") return COR_PRIMARIA_PADRAO;
  let h = cor.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    const r = h[1]; const g = h[2]; const b = h[3];
    h = `#${r}${r}${g}${g}${b}${b}`;
  }
  if (h.length !== 7) return COR_PRIMARIA_PADRAO;
  return h.toUpperCase();
}

function hexParaRgb(hex) {
  const h = normalizarHex(hex);
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbParaHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function misturarHex(hexA, hexB, t) {
  const a = hexParaRgb(hexA); const b = hexParaRgb(hexB);
  return rgbParaHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

function escurecer(hex, fator = 0.2) {
  const { r, g, b } = hexParaRgb(hex);
  return rgbParaHex(r * (1 - fator), g * (1 - fator), b * (1 - fator));
}

/**
 * @param {string} corPrimariaHex
 * @param {{ corRodapeFim?: string|null }} [opcoes]
 */
export function gerarPaletaTema(corPrimariaHex, opcoes = {}) {
  const primaria = normalizarHex(corPrimariaHex);
  const corFimRodape = opcoes.corRodapeFim
    ? normalizarHex(opcoes.corRodapeFim)
    : escurecer(misturarHex("#2D1B0E", primaria, 0.3), 0.1);

  // Tema claro / creme – visual do PDF
  const fundoPrimario  = "#E8DFC8";   // creme escuro (fundo geral)
  const fundoCartao    = "#F5F0E5";   // creme claro  (cartões)
  const fundoProfundo  = "#2D1B0E";   // marrom escuro
  const bordaSuave     = "#C8B89A";   // borda creme/marrom

  const destaqueEscuro = escurecer(primaria, 0.18);

  // Gradientes do header e footer inspirados no azul do PDF
  const headerGradient = [primaria, escurecer(primaria, 0.25)];
  const footerGradient = opcoes.corRodapeFim
    ? [primaria, corFimRodape]
    : [primaria, escurecer(primaria, 0.3)];

  return {
    corPrimaria: primaria,
    destaque: primaria,
    destaqueSecundario: "#F4C15A",   // dourado
    destaqueEscuro,
    fundoProfundo,
    fundoPrimario,
    fundoCartao,
    textoPrincipal:   "#1A0A04",
    textoSecundario:  "#5C4A35",
    textoSobreGradiente: "#FFFFFF",
    bordaSuave,
    sucesso:  "#3DAA6E",
    alerta:   "#CC3B2F",
    moeda:    "#F4C15A",
    headerGradient,
    footerGradient,
    tabBarActiveTint:   "#FFFFFF",
    tabBarInactiveTint: "rgba(255,255,255,0.55)",
    estrela: "#F4C15A",
    // Cores fixas das categorias (conforme PDF)
    categorias: {
      SAÚDE:    { bg: "#4A7BC4", text: "#FFFFFF" },
      ESTUDO:   { bg: "#7B5EA7", text: "#FFFFFF" },
      FITNESS:  { bg: "#2D8B4E", text: "#FFFFFF" },
      LEITURA:  { bg: "#C86A2A", text: "#FFFFFF" },
      MENTE:    { bg: "#2B8BA0", text: "#FFFFFF" },
      CASA:     { bg: "#7B7B6B", text: "#FFFFFF" },
    },
  };
}

export { normalizarHex, COR_PRIMARIA_PADRAO };
