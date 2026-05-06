function slugifyPart(texto) {
  const base = String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "geral").slice(0, 96);
}

export function construirIdCategoria(idFonte, nomeCategoria) {
  return `${idFonte}:${slugifyPart(nomeCategoria)}`;
}

function extrairCategoriaNome(meta) {
  const topic = meta.match(/^Topic:\s*(.+)$/m);
  if (topic) return topic[1].trim();
  const kw = meta.match(/^Key Word:\s*(.+)$/m);
  if (kw) return kw[1].trim();
  return null;
}

function extrairDificuldade(meta) {
  const m = meta.match(/^Difficulty:\s*(Easy|Medium|Hard)/m);
  return m ? m[1] : null;
}

function extrairRespostaCorretaLetra(meta, colA) {
  const m = meta.match(/Correct Answer:\s*([A-D])/i);
  if (m) return m[1].toUpperCase();
  if (colA && /^[A-D]$/i.test(String(colA).trim())) {
    return String(colA).trim().toUpperCase();
  }
  return null;
}

function extrairTextoPergunta(meta) {
  const m = meta.match(/Question:\s*([\s\S]*?)(?=\nOptions:|\nCorrect Answer:)/i);
  if (!m) return null;
  return m[1].replace(/\s+$/g, "").trim();
}

function extrairBlocoOpcoes(meta) {
  const m = meta.match(/Options:\s*([\s\S]*?)(?=\nCorrect Answer:|$)/i);
  if (!m) return null;
  return m[1].trim();
}

function extrairOpcoesUmaLinha(limpo) {
  const partes = limpo
    .split(/\s+(?=[A-D]\.\s)/i)
    .map((p) => p.replace(/^[A-D]\.\s*/i, "").trim())
    .filter((p) => p.length > 0);
  if (partes.length === 4) return partes;
  const m = limpo.match(/A\.\s*(.+?)\s+B\.\s*(.+?)\s+C\.\s*(.+?)\s+D\.\s*(.+)/is);
  if (m) {
    return [m[1], m[2], m[3], m[4]].map((s) => s.replace(/\s+/g, " ").trim());
  }
  return null;
}

function extrairOpcoesMultilinha(limpo) {
  const linhas = limpo.split(/\r?\n/).map((l) => l.trim());
  const out = ["", "", "", ""];
  for (const linha of linhas) {
    if (!linha) continue;
    const m = linha.match(/^([A-D])\.\s*(.*)$/i);
    if (m) {
      const idx = m[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < 4) out[idx] = m[2].trim();
    }
  }
  if (out.every((s) => s.length > 0)) return out;
  return extrairOpcoesUmaLinha(limpo.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim());
}

function extrairQuatroOpcoes(blocoOpcoes) {
  if (!blocoOpcoes) return null;
  const limpo = blocoOpcoes.replace(/^Options:\s*/i, "").trim();
  if (!limpo) return null;
  if (!limpo.includes("\n")) {
    return extrairOpcoesUmaLinha(limpo);
  }
  return extrairOpcoesMultilinha(limpo);
}

/**
 * @param {string} metaTexto full "question message" or Q column
 * @param {string} [colA] correct answer column
 * @returns {null | { nomeCategoria: string, textoPergunta: string, opcoes: string[], indiceCorreto: number, dificuldade: string|null }}
 */
export function parseRegistroPergunta(metaTexto, colA) {
  if (!metaTexto || typeof metaTexto !== "string") return null;
  const meta = metaTexto.trim();
  const nomeCategoria = extrairCategoriaNome(meta);
  if (!nomeCategoria) return null;

  const textoPergunta = extrairTextoPergunta(meta);
  if (!textoPergunta) return null;

  const bloco = extrairBlocoOpcoes(meta);
  const opcoes = extrairQuatroOpcoes(bloco || "");
  if (!opcoes || opcoes.length !== 4) return null;

  const letra = extrairRespostaCorretaLetra(meta, colA);
  if (!letra) return null;
  const indiceCorreto = letra.charCodeAt(0) - 65;
  if (indiceCorreto < 0 || indiceCorreto > 3) return null;

  return {
    nomeCategoria,
    textoPergunta,
    opcoes,
    indiceCorreto,
    dificuldade: extrairDificuldade(meta),
  };
}
