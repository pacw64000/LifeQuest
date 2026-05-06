import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { bancoDadosFirebase } from "./config";
import {
  novoRunEhMelhorQueAnterior,
  primeiroResultadoMelhorQueSegundo,
} from "../../utils/nonogram/pontuacaoNonogram";

const COLECAO = "nonogramasPublicos";

function refNonograma(idDoc) {
  return doc(bancoDadosFirebase, COLECAO, idDoc);
}

function refPlacar(idDoc, idUsuario) {
  return doc(bancoDadosFirebase, COLECAO, idDoc, "placar", idUsuario);
}

function colecaoPlacar(idDoc) {
  return collection(bancoDadosFirebase, COLECAO, idDoc, "placar");
}

/**
 * @param {object} payload
 * @param {string} payload.codigoCompartilhamento
 * @param {string} payload.titulo
 * @param {string} payload.categoria
 * @param {string} payload.idAutor
 * @param {string} payload.nomeAutor
 * @param {number} payload.largura
 * @param {number} payload.altura
 * @param {number[][]} payload.grade
 * @param {number} payload.pontuacaoBase
 */
export async function criarNonogramaPublicoNoFirebase(payload) {
  const referencia = payload.idDoc ? refNonograma(payload.idDoc) : doc(collection(bancoDadosFirebase, COLECAO));
  const gradeCompactada = JSON.stringify(payload.grade);
  await setDoc(referencia, {
    codigoCompartilhamento: payload.codigoCompartilhamento,
    titulo: payload.titulo,
    categoria: payload.categoria,
    idAutor: payload.idAutor,
    nomeAutor: payload.nomeAutor,
    largura: payload.largura,
    altura: payload.altura,
    gradeCompactada,
    pontuacaoBase: payload.pontuacaoBase,
    criadoEm: new Date().toISOString(),
    visualizacoes: 0,
    favoritos: 0,
    recompensaPontos: 0,
  });
  return { idDoc: referencia.id };
}

export async function existeCodigoPublicoNoFirebase(codigo) {
  const normalizado = codigo.trim().toUpperCase();
  const consulta = query(
    collection(bancoDadosFirebase, COLECAO),
    where("codigoCompartilhamento", "==", normalizado),
    limit(1)
  );
  const resultado = await getDocs(consulta);
  return !resultado.empty;
}

export async function obterNonogramaPublicoPorCodigo(codigo) {
  const normalizado = codigo.trim().toUpperCase();
  const consulta = query(
    collection(bancoDadosFirebase, COLECAO),
    where("codigoCompartilhamento", "==", normalizado),
    limit(1)
  );
  const resultado = await getDocs(consulta);
  if (resultado.empty) return null;
  const snap = resultado.docs[0];
  return documentoParaPublico(snap.id, snap.data());
}

export async function obterNonogramaPublicoPorIdDoc(idDoc) {
  const snap = await getDoc(refNonograma(idDoc));
  if (!snap.exists()) return null;
  return documentoParaPublico(snap.id, snap.data());
}

function documentoParaPublico(idDoc, dados) {
  let grade = [];
  try {
    grade = JSON.parse(dados.gradeCompactada || "[]");
  } catch {
    grade = [];
  }
  return {
    idDoc,
    codigoCompartilhamento: dados.codigoCompartilhamento,
    titulo: dados.titulo,
    categoria: dados.categoria,
    idAutor: dados.idAutor,
    nomeAutor: dados.nomeAutor,
    largura: dados.largura,
    altura: dados.altura,
    grade,
    pontuacaoBase: dados.pontuacaoBase,
    criadoEm: dados.criadoEm,
    visualizacoes: dados.visualizacoes ?? 0,
    favoritos: dados.favoritos ?? 0,
    recompensaPontos: dados.recompensaPontos ?? 0,
  };
}

/**
 * @param {'recentes'|'visualizacoes'|'favoritos'|'recompensas'} modoFiltro
 */
export async function listarNonogramasPublicos(modoFiltro = "recentes", limiteLista = 40) {
  let campoOrdem = "criadoEm";
  let direcao = "desc";
  if (modoFiltro === "visualizacoes") {
    campoOrdem = "visualizacoes";
    direcao = "desc";
  } else if (modoFiltro === "favoritos") {
    campoOrdem = "favoritos";
    direcao = "desc";
  } else if (modoFiltro === "recompensas") {
    campoOrdem = "recompensaPontos";
    direcao = "desc";
  }

  const consulta = query(
    collection(bancoDadosFirebase, COLECAO),
    orderBy(campoOrdem, direcao),
    limit(limiteLista)
  );
  const resultado = await getDocs(consulta);
  return resultado.docs.map((d) => documentoParaPublico(d.id, d.data()));
}

export async function incrementarVisualizacaoNonogramaPublico(idDoc) {
  await updateDoc(refNonograma(idDoc), {
    visualizacoes: increment(1),
  });
}

/**
 * @returns {Promise<boolean>} true se gravou novo recorde
 */
export async function salvarPlacarPublicoSeMelhor(idDocFirestore, idUsuario, entrada) {
  const ref = refPlacar(idDocFirestore, idUsuario);
  const snap = await getDoc(ref);
  const anterior = snap.exists()
    ? {
        erros: snap.data().erros,
        tempoMs: snap.data().tempoMs,
        pontuacao: snap.data().pontuacao,
      }
    : null;
  const candidato = {
    erros: entrada.erros,
    tempoMs: entrada.tempoMs,
    pontuacao: entrada.pontuacao,
  };
  if (!novoRunEhMelhorQueAnterior(candidato, anterior)) {
    return false;
  }
  await setDoc(ref, {
    tempoMs: entrada.tempoMs,
    erros: entrada.erros,
    pontuacao: entrada.pontuacao,
    nomeExibicao: entrada.nomeExibicao || "Jogador",
    atualizadoEm: new Date().toISOString(),
  });
  return true;
}

export async function listarPlacarPublicoOrdenado(idDocFirestore, limiteLista = 50) {
  const snaps = await getDocs(colecaoPlacar(idDocFirestore));
  const entradas = snaps.docs.map((d) => ({
    idUsuario: d.id,
    tempoMs: d.data().tempoMs,
    erros: d.data().erros,
    pontuacao: d.data().pontuacao,
    nomeExibicao: d.data().nomeExibicao || "Jogador",
    atualizadoEm: d.data().atualizadoEm,
  }));
  entradas.sort((a, b) => {
    if (primeiroResultadoMelhorQueSegundo(a, b)) return -1;
    if (primeiroResultadoMelhorQueSegundo(b, a)) return 1;
    return 0;
  });
  return entradas.slice(0, limiteLista);
}
