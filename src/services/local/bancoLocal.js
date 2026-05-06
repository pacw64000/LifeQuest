import * as SQLite from "expo-sqlite";

export const bancoPromise = SQLite.openDatabaseAsync("lifequest.db");
let inicializado = false;

function serializar(valor) {
  return JSON.stringify(valor ?? null);
}

function desserializar(valor) {
  if (!valor) return null;
  try {
    return JSON.parse(valor);
  } catch (erro) {
    return null;
  }
}

export async function inicializarBancoLocal() {
  if (inicializado) return;
  const banco = await bancoPromise;
  await banco.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS perfil_local (
      id_usuario TEXT PRIMARY KEY NOT NULL,
      dados_json TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS missoes_local (
      id_missao TEXT NOT NULL,
      id_usuario TEXT NOT NULL,
      dados_json TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      PRIMARY KEY (id_missao, id_usuario)
    );
    CREATE TABLE IF NOT EXISTS operacoes_pendentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario TEXT NOT NULL,
      tipo_operacao TEXT NOT NULL,
      id_missao TEXT,
      payload_json TEXT,
      criado_em TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quiz_meta (
      chave TEXT PRIMARY KEY NOT NULL,
      valor_integer INTEGER
    );
    CREATE TABLE IF NOT EXISTS quiz_fonte (
      id TEXT PRIMARY KEY NOT NULL,
      rotulo TEXT NOT NULL,
      versao_seed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS quiz_categoria (
      id TEXT PRIMARY KEY NOT NULL,
      id_fonte TEXT NOT NULL,
      nome_exibicao TEXT NOT NULL,
      contagem INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS quiz_pergunta (
      id TEXT PRIMARY KEY NOT NULL,
      id_categoria TEXT NOT NULL,
      texto_pergunta TEXT NOT NULL,
      opcoes_json TEXT NOT NULL,
      indice_correto INTEGER NOT NULL,
      dificuldade TEXT,
      ordem_arquivo INTEGER
    );
    CREATE TABLE IF NOT EXISTS quiz_resultado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario TEXT NOT NULL,
      nome_exibicao TEXT NOT NULL,
      id_categoria TEXT NOT NULL,
      acertos INTEGER NOT NULL,
      total_perguntas INTEGER NOT NULL,
      tempo_total_ms INTEGER NOT NULL,
      pontuacao INTEGER NOT NULL,
      criado_em TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_quiz_resultado_rank
      ON quiz_resultado(id_categoria, pontuacao DESC, tempo_total_ms ASC, criado_em DESC);
    CREATE TABLE IF NOT EXISTS nonogram_puzzles (
      id TEXT PRIMARY KEY NOT NULL,
      id_usuario TEXT,
      titulo TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'Outros',
      visibilidade TEXT NOT NULL,
      codigo_compartilhamento TEXT,
      grade_json TEXT NOT NULL,
      largura INTEGER NOT NULL,
      altura INTEGER NOT NULL,
      pontuacao_base REAL NOT NULL,
      criado_em TEXT NOT NULL,
      id_firestore TEXT,
      uri_origem_local TEXT,
      meta_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_nonogram_codigo ON nonogram_puzzles(codigo_compartilhamento)
      WHERE codigo_compartilhamento IS NOT NULL AND length(codigo_compartilhamento) > 0;
    CREATE TABLE IF NOT EXISTS nonogram_leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_puzzle TEXT NOT NULL,
      id_usuario TEXT NOT NULL,
      tempo_ms INTEGER NOT NULL,
      erros INTEGER NOT NULL,
      pontuacao_final REAL NOT NULL,
      finalizado_em TEXT NOT NULL,
      nome_exibicao TEXT,
      UNIQUE(id_puzzle, id_usuario)
    );
    CREATE INDEX IF NOT EXISTS idx_nonogram_lb_puzzle ON nonogram_leaderboard(id_puzzle);
  `);
  inicializado = true;
}

export async function obterBancoSqlite() {
  await inicializarBancoLocal();
  return await bancoPromise;
}

export async function obterPerfilLocal(idUsuario) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linha = await banco.getFirstAsync("SELECT dados_json FROM perfil_local WHERE id_usuario = ?", [idUsuario]);
  return desserializar(linha?.dados_json);
}

export async function salvarPerfilLocal(idUsuario, dadosPerfil) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.runAsync(
    `
      INSERT INTO perfil_local (id_usuario, dados_json, atualizado_em)
      VALUES (?, ?, ?)
      ON CONFLICT(id_usuario) DO UPDATE SET
        dados_json = excluded.dados_json,
        atualizado_em = excluded.atualizado_em
    `,
    [idUsuario, serializar(dadosPerfil), new Date().toISOString()]
  );
}

export async function listarMissoesLocais(idUsuario) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linhas = await banco.getAllAsync(
    "SELECT dados_json FROM missoes_local WHERE id_usuario = ? ORDER BY atualizado_em DESC",
    [idUsuario]
  );
  return linhas.map((linha) => desserializar(linha.dados_json)).filter(Boolean);
}

export async function substituirMissoesLocais(idUsuario, listaMissoes) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.withTransactionAsync(async () => {
    await banco.runAsync("DELETE FROM missoes_local WHERE id_usuario = ?", [idUsuario]);
    for (const missao of listaMissoes) {
      await banco.runAsync(
        `
          INSERT INTO missoes_local (id_missao, id_usuario, dados_json, atualizado_em)
          VALUES (?, ?, ?, ?)
        `,
        [missao.idMissao, idUsuario, serializar(missao), new Date().toISOString()]
      );
    }
  });
}

export async function salvarMissaoLocal(idUsuario, missao) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.runAsync(
    `
      INSERT INTO missoes_local (id_missao, id_usuario, dados_json, atualizado_em)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id_missao, id_usuario) DO UPDATE SET
        dados_json = excluded.dados_json,
        atualizado_em = excluded.atualizado_em
    `,
    [missao.idMissao, idUsuario, serializar(missao), new Date().toISOString()]
  );
}

export async function excluirMissaoLocal(idUsuario, idMissao) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.runAsync("DELETE FROM missoes_local WHERE id_usuario = ? AND id_missao = ?", [idUsuario, idMissao]);
}

export async function enfileirarOperacaoPendente({ idUsuario, tipoOperacao, idMissao = null, payload = null }) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.runAsync(
    `
      INSERT INTO operacoes_pendentes (id_usuario, tipo_operacao, id_missao, payload_json, criado_em)
      VALUES (?, ?, ?, ?, ?)
    `,
    [idUsuario, tipoOperacao, idMissao, serializar(payload), new Date().toISOString()]
  );
}

export async function listarOperacoesPendentes(idUsuario) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  const linhas = await banco.getAllAsync(
    "SELECT id, tipo_operacao, id_missao, payload_json FROM operacoes_pendentes WHERE id_usuario = ? ORDER BY id ASC",
    [idUsuario]
  );
  return linhas.map((linha) => ({
    id: linha.id,
    tipoOperacao: linha.tipo_operacao,
    idMissao: linha.id_missao,
    payload: desserializar(linha.payload_json),
  }));
}

export async function removerOperacaoPendente(idOperacao) {
  await inicializarBancoLocal();
  const banco = await bancoPromise;
  await banco.runAsync("DELETE FROM operacoes_pendentes WHERE id = ?", [idOperacao]);
}
