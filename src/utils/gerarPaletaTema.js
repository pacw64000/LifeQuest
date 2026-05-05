/**
 * Gera paleta de UI a partir de uma cor primaria (hex).
 * Tema base escuro “cosmic quest” (alinhado ao design LifeQuest em PDF).
 */

const COR_PRIMARIA_PADRAO = "#26D0CE";

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

/** Hex (#RRGGBB) para string rgba — alpha em [0, 1]. */
function hexParaRgba(hex, alpha) {
  const { r, g, b } = hexParaRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r},${g},${b},${a})`;
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

function misturarHex(hexA, hexB, t) {
  const a = hexParaRgb(hexA);
  const b = hexParaRgb(hexB);
  const m = misturarRgb(a, b, t);
  return rgbParaHex(m.r, m.g, m.b);
}

function escurecer(hex, fator = 0.2) {
  const { r, g, b } = hexParaRgb(hex);
  return rgbParaHex(r * (1 - fator), g * (1 - fator), b * (1 - fator));
}

function clarear(hex, fator = 0.2) {
  const { r, g, b } = hexParaRgb(hex);
  return rgbParaHex(r + (255 - r) * fator, g + (255 - g) * fator, b + (255 - b) * fator);
}

/** 0–1: valores altos = cor de texto clara (branco, cinza claro). */
function luminanciaSimples(rgb) {
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

const OURO_DESTAQUE = "#F4C15A";

/** Limiar acima do qual evitamos misturar texto com o azul do fundo (fica acinzentado/falso “escuro”). */
const LIMIAR_TEXTO_CLARO = 0.52;

/**
 * @param {string} corPrimariaHex
 * @param {{ corRodapeFim?: string|null, corTexto?: string|null }} [opcoes]
 */
export function gerarPaletaTema(corPrimariaHex, opcoes = {}) {
  const primaria = normalizarHex(corPrimariaHex);
  const corFimRodape = opcoes.corRodapeFim ? normalizarHex(opcoes.corRodapeFim) : escurecer(misturarHex("#1A0F2E", primaria, 0.35), 0.15);

  const fundoProfundo = misturarHex("#050814", primaria, 0.04);
  const fundoPrimario = misturarHex("#0C1228", primaria, 0.07);
  const fundoCartao = misturarHex("#141C33", primaria, 0.06);
  const bordaSuave = misturarHex(fundoCartao, primaria, 0.22);

  const roxoHeader = misturarHex("#2D1B4E", primaria, 0.25);
  const headerGradient = [escurecer(roxoHeader, 0.12), misturarHex(primaria, "#1E3A5F", 0.4), escurecer(primaria, 0.08)];
  const footerGradient = [misturarHex("#0F1629", primaria, 0.12), corFimRodape];

  const destaqueEscuro = escurecer(primaria, 0.18);

  let textoPrincipal = "#E8EDF5";
  let textoSecundario = "#94A0B8";
  let textoSobreGradiente = "#F8FAFC";
  let tabBarInactiveTint = "#6B7589";
  let estrela = "#FFFFFF";

  if (opcoes.corTexto && typeof opcoes.corTexto === "string") {
    const base = normalizarHex(opcoes.corTexto);
    const rgbBase = hexParaRgb(base);
    const textoEhClaro = luminanciaSimples(rgbBase) > LIMIAR_TEXTO_CLARO;

    textoPrincipal = base;

    if (textoEhClaro) {
      // Branco/cores claras: misturar com fundo azul escurecia tudo para um cinza-azulado.
      // Escurecer só o RGB da própria cor mantém tons neutros e o branco legível.
      textoSecundario = escurecer(base, 0.2);
      textoSobreGradiente = luminanciaSimples(rgbBase) > 0.94 ? base : clarear(base, 0.05);
      tabBarInactiveTint = escurecer(base, 0.3);
      estrela = luminanciaSimples(rgbBase) > 0.94 ? base : clarear(base, 0.08);
    } else {
      textoSecundario = misturarHex(base, fundoPrimario, 0.4);
      textoSobreGradiente = clarear(base, 0.06);
      tabBarInactiveTint = misturarHex(base, fundoCartao, 0.55);
      estrela = clarear(base, 0.12);
    }
  }

  return {
    corPrimaria: primaria,
    destaque: primaria,
    destaqueSecundario: OURO_DESTAQUE,
    destaqueEscuro,
    fundoProfundo,
    fundoPrimario,
    fundoCartao,
    textoPrincipal,
    textoSecundario,
    bordaSuave: bordaSuave,
    sucesso: "#2EE6A8",
    alerta: "#E85D4C",
    headerGradient,
    footerGradient,
    textoSobreGradiente,
    tabBarActiveTint: OURO_DESTAQUE,
    tabBarInactiveTint,
    estrela,
  };
}

export { normalizarHex, COR_PRIMARIA_PADRAO, hexParaRgba };
