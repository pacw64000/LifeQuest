/**
 * Gera paleta de UI a partir de uma cor primaria (hex).
 * Sem dependencias externas.
 */

const COR_PRIMARIA_PADRAO = "#6C5CE7";

function normalizarHex(cor) {
  if (!cor || typeof cor !== "string") return COR_PRIMARIA_PADRAO;
  let h = cor.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    const r = h[1];
    const g = h[2];
    const b = h[3];
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

function misturarRgb(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  };
}

function escurecer(hex, fator = 0.2) {
  const { r, g, b } = hexParaRgb(hex);
  return rgbParaHex(r * (1 - fator), g * (1 - fator), b * (1 - fator));
}

function clarear(hex, fator = 0.2) {
  const { r, g, b } = hexParaRgb(hex);
  return rgbParaHex(r + (255 - r) * fator, g + (255 - g) * fator, b + (255 - b) * fator);
}

function luminanciaRelativa(hex) {
  const { r, g, b } = hexParaRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function textoContrasteSobreFundo(hexFundo) {
  const lum = luminanciaRelativa(hexFundo);
  return lum > 0.55 ? "#18212F" : "#FFFFFF";
}

/**
 * @param {string} corPrimariaHex
 * @param {{ corRodapeFim?: string|null }} [opcoes]
 */
export function gerarPaletaTema(corPrimariaHex, opcoes = {}) {
  const primaria = normalizarHex(corPrimariaHex);
  const corFimRodape = opcoes.corRodapeFim ? normalizarHex(opcoes.corRodapeFim) : escurecer(primaria, 0.35);

  const headerGradient = [escurecer(primaria, 0.22), primaria, clarear(primaria, 0.12)];
  const footerGradient = [escurecer(primaria, 0.28), corFimRodape];

  const fundoPrimario = clarear(primaria, 0.92);
  const fundoCartao = "#FFFFFF";
  const bordaSuave = misturarRgb(hexParaRgb(fundoPrimario), hexParaRgb(primaria), 0.08);
  const bordaHex = rgbParaHex(bordaSuave.r, bordaSuave.g, bordaSuave.b);

  const textoSobreGradiente = "#FFFFFF";
  const destaqueEscuro = escurecer(primaria, 0.15);

  return {
    corPrimaria: primaria,
    destaque: primaria,
    destaqueEscuro,
    fundoPrimario,
    fundoCartao,
    textoPrincipal: "#18212F",
    textoSecundario: "#5D6A7A",
    bordaSuave: bordaHex,
    sucesso: "#00B894",
    alerta: "#E17055",
    headerGradient,
    footerGradient,
    textoSobreGradiente,
    tabBarActiveTint: primaria,
    tabBarInactiveTint: "#8A96A8",
  };
}

export { normalizarHex, COR_PRIMARIA_PADRAO };
