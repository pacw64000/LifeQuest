import { inicializarBancoLocal, bancoPromise } from "./bancoLocal";
import {
  novoRunEhMelhorQueAnterior,
  primeiroResultadoMelhorQueSegundo,
} from "../../utils/nonogram/pontuacaoNonogram";
import { nonogramConfig } from "../../config/nonogramConfig";

function serializar(valor) {
  return JSON.stringify(valor ?? null);
}

function desserializar(valor) {
  if (!valor) return null;
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

function linhaParaPuzzle(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    idUsuario: linha.id_usuario,
    titulo: linha.titulo,
    categoria: linha.categoria,
    visibilidade: linha.visibilidade,
    codigoCompartilhamento: linha.codigo_compartilhamento,
    grade: desserializar(linha.grade_json),
    largura: linha.largura,
    altura: linha.altura,
    pontuacaoBase: linha.pontuacao_base,
    criadoEm: linha.criado_em,
    idFirestore: linha.id_firestore,
    uriOrigemLocal: linha.uri_origem_local,
    meta: desserializar(linha.meta_json) || {},
  };
}

/**
 * @param {object} dados
 * @param {string} dados.id
 * @param {string|null} dados.idUsuario
 * @param {string} dados.titulo
 * @param {string} dados.categoria
 * @param {'privado'|'publico'} dados.visibilidade
 * @param {string|null} dados.codigoCompartilhamento
 * @param {number[][]} dados.grade
 * @param {number} dados.largura
 * @param {number} dados.altura
 * @param {number} dados.pontuacaoBase
 * @param {string|null} dados.idFirestore
 * @param {string|null} dados.uriOrigemLocal
 * @param {Record<string, unknown>} [dados.meta]
 */
export async function inserirNonogramPuzzle(dados) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const criadoEm = dados.criadoEm || new Date().toISOString();
  const meta = dados.meta || {};
  await banco.runAsync(
    `
      INSERT INTO nonogram_puzzles (
        id, id_usuario, titulo, categoria, visibilidade, codigo_compartilhamento,
        grade_json, largura, altura, pontuacao_base, criado_em, id_firestore, uri_origem_local, meta_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      dados.id,
      dados.idUsuario ?? null,
      dados.titulo,
      dados.categoria,
      dados.visibilidade,
      dados.codigoCompartilhamento ?? null,
      serializar(dados.grade),
      dados.largura,
      dados.altura,
      dados.pontuacaoBase,
      criadoEm,
      dados.idFirestore ?? null,
      dados.uriOrigemLocal ?? null,
      serializar(meta),
    ]
  );
}

export async function atualizarNonogramPuzzle(id, campos) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const atualizacoes = [];
  const valores = [];
  if (campos.codigoCompartilhamento !== undefined) {
    atualizacoes.push("codigo_compartilhamento = ?");
    valores.push(campos.codigoCompartilhamento);
  }
  if (campos.idFirestore !== undefined) {
    atualizacoes.push("id_firestore = ?");
    valores.push(campos.idFirestore);
  }
  if (campos.visibilidade !== undefined) {
    atualizacoes.push("visibilidade = ?");
    valores.push(campos.visibilidade);
  }
  if (campos.meta !== undefined) {
    atualizacoes.push("meta_json = ?");
    valores.push(serializar(campos.meta));
  }
  if (atualizacoes.length === 0) return;
  valores.push(id);
  await banco.runAsync(
    `UPDATE nonogram_puzzles SET ${atualizacoes.join(", ")} WHERE id = ?`,
    valores
  );
}

export async function obterNonogramPuzzlePorId(id) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linha = await banco.getFirstAsync("SELECT * FROM nonogram_puzzles WHERE id = ?", [id]);
  return linhaParaPuzzle(linha);
}

export async function obterNonogramPuzzlePorCodigo(codigo) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linha = await banco.getFirstAsync(
    "SELECT * FROM nonogram_puzzles WHERE codigo_compartilhamento = ?",
    [codigo.trim().toUpperCase()]
  );
  return linhaParaPuzzle(linha);
}

export async function obterNonogramPuzzlePorIdFirestore(idFirestore) {
  if (!idFirestore) return null;
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linha = await banco.getFirstAsync("SELECT * FROM nonogram_puzzles WHERE id_firestore = ?", [
    idFirestore,
  ]);
  return linhaParaPuzzle(linha);
}

export async function listarNonogramPuzzlesDoUsuario(idUsuario) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linhas = await banco.getAllAsync(
    "SELECT * FROM nonogram_puzzles WHERE id_usuario = ? ORDER BY criado_em DESC",
    [idUsuario]
  );
  return linhas.map(linhaParaPuzzle).filter(Boolean);
}

export async function codigoCompartilhamentoExiste(codigo) {
  const p = await obterNonogramPuzzlePorCodigo(codigo);
  return Boolean(p);
}

/**
 * @returns {Promise<{ idUsuario: string, tempoMs: number, erros: number, pontuacao: number, finalizadoEm: string, nomeExibicao: string }|null>}
 */
export async function obterMelhorResultadoLocal(idPuzzle, idUsuario) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linha = await banco.getFirstAsync(
    "SELECT * FROM nonogram_leaderboard WHERE id_puzzle = ? AND id_usuario = ?",
    [idPuzzle, idUsuario]
  );
  if (!linha) return null;
  return {
    idUsuario: linha.id_usuario,
    tempoMs: linha.tempo_ms,
    erros: linha.erros,
    pontuacao: linha.pontuacao_final,
    finalizadoEm: linha.finalizado_em,
    nomeExibicao: linha.nome_exibicao,
  };
}

/**
 * @param {object} run
 * @param {number} run.tempoMs
 * @param {number} run.erros
 * @param {number} run.pontuacao
 * @param {string} [run.nomeExibicao]
 */
export async function salvarMelhorResultadoSeForRecorde(idPuzzle, idUsuario, run) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const anterior = await obterMelhorResultadoLocal(idPuzzle, idUsuario);
  const candidato = {
    erros: run.erros,
    tempoMs: run.tempoMs,
    pontuacao: run.pontuacao,
  };
  if (!novoRunEhMelhorQueAnterior(candidato, anterior)) {
    return { atualizado: false, anterior };
  }
  const agora = new Date().toISOString();
  const nome = run.nomeExibicao || "Jogador";
  if (anterior) {
    await banco.runAsync(
      `
        UPDATE nonogram_leaderboard
        SET tempo_ms = ?, erros = ?, pontuacao_final = ?, finalizado_em = ?, nome_exibicao = ?
        WHERE id_puzzle = ? AND id_usuario = ?
      `,
      [run.tempoMs, run.erros, run.pontuacao, agora, nome, idPuzzle, idUsuario]
    );
  } else {
    await banco.runAsync(
      `
        INSERT INTO nonogram_leaderboard (id_puzzle, id_usuario, tempo_ms, erros, pontuacao_final, finalizado_em, nome_exibicao)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [idPuzzle, idUsuario, run.tempoMs, run.erros, run.pontuacao, agora, nome]
    );
  }
  return { atualizado: true, anterior };
}

export async function listarPlacarLocalOrdenado(idPuzzle, limite) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linhas = await banco.getAllAsync(
    "SELECT * FROM nonogram_leaderboard WHERE id_puzzle = ?",
    [idPuzzle]
  );
  const entradas = linhas.map((linha) => ({
    idUsuario: linha.id_usuario,
    tempoMs: linha.tempo_ms,
    erros: linha.erros,
    pontuacao: linha.pontuacao_final,
    finalizadoEm: linha.finalizado_em,
    nomeExibicao: linha.nome_exibicao || "Jogador",
  }));
  entradas.sort((a, b) => {
    if (primeiroResultadoMelhorQueSegundo(a, b)) return -1;
    if (primeiroResultadoMelhorQueSegundo(b, a)) return 1;
    return 0;
  });
  const max = limite ?? nonogramConfig.ui.limitePlacarExibicao;
  return entradas.slice(0, max);
}
