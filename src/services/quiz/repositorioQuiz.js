import { obterBancoSqlite } from "../local/bancoLocal";
import { seedQuizSeNecessario } from "./seedQuiz";

/**
 * Ensures DB tables exist and bundled CSV is imported when seed version increases.
 */
export async function garantirQuizInicializado() {
  await seedQuizSeNecessario();
}

/**
 * @returns {Promise<Array<{ id: string, nomeExibicao: string, contagem: number, idFonte: string, rotuloFonte: string }>>}
 */
export async function listarCategorias() {
  const banco = await obterBancoSqlite();
  const linhas = await banco.getAllAsync(
    `
      SELECT c.id AS id, c.nome_exibicao AS nomeExibicao, c.contagem AS contagem,
             c.id_fonte AS idFonte, f.rotulo AS rotuloFonte
      FROM quiz_categoria c
      INNER JOIN quiz_fonte f ON f.id = c.id_fonte
      ORDER BY f.rotulo ASC, c.nome_exibicao COLLATE NOCASE ASC
    `
  );
  return linhas.map((r) => ({
    id: r.id,
    nomeExibicao: r.nomeExibicao,
    contagem: r.contagem,
    idFonte: r.idFonte,
    rotuloFonte: r.rotuloFonte,
  }));
}

/**
 * @returns {Promise<Array<{ id: string, textoPergunta: string, opcoesResposta: string[], indiceCorreto: number, dificuldade: string|null }>>}
 */
export async function sortearPerguntasPorCategoria(idCategoria, limite) {
  const banco = await obterBancoSqlite();
  const linhas = await banco.getAllAsync(
    `
      SELECT id, texto_pergunta AS textoPergunta, opcoes_json AS opcoesJson, indice_correto AS indiceCorreto, dificuldade AS dificuldade
      FROM quiz_pergunta
      WHERE id_categoria = ?
      ORDER BY RANDOM()
      LIMIT ?
    `,
    [idCategoria, limite]
  );
  return linhas.map((r) => ({
    id: r.id,
    textoPergunta: r.textoPergunta,
    opcoesResposta: JSON.parse(r.opcoesJson || "[]"),
    indiceCorreto: r.indiceCorreto,
    dificuldade: r.dificuldade,
  }));
}

export async function salvarResultadoRodada({
  idUsuario,
  nomeExibicao,
  idCategoria,
  acertos,
  totalPerguntas,
  tempoTotalMs,
  pontuacao,
}) {
  const banco = await obterBancoSqlite();
  await banco.runAsync(
    `
      INSERT INTO quiz_resultado (
        id_usuario, nome_exibicao, id_categoria, acertos, total_perguntas, tempo_total_ms, pontuacao, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      idUsuario,
      nomeExibicao,
      idCategoria,
      acertos,
      totalPerguntas,
      tempoTotalMs,
      pontuacao,
      new Date().toISOString(),
    ]
  );
}

/**
 * @returns {Promise<Array<{ id: number, nomeExibicao: string, acertos: number, totalPerguntas: number, tempoTotalMs: number, pontuacao: number, criadoEm: string, idUsuario: string }>>}
 */
export async function listarRankingPorCategoria(idCategoria, limite) {
  const banco = await obterBancoSqlite();
  const linhas = await banco.getAllAsync(
    `
      SELECT id, nome_exibicao AS nomeExibicao, acertos, total_perguntas AS totalPerguntas,
             tempo_total_ms AS tempoTotalMs, pontuacao, criado_em AS criadoEm, id_usuario AS idUsuario
      FROM quiz_resultado
      WHERE id_categoria = ?
      ORDER BY pontuacao DESC, tempo_total_ms ASC, criado_em DESC
      LIMIT ?
    `,
    [idCategoria, limite]
  );
  return linhas.map((r) => ({
    id: r.id,
    nomeExibicao: r.nomeExibicao,
    acertos: r.acertos,
    totalPerguntas: r.totalPerguntas,
    tempoTotalMs: r.tempoTotalMs,
    pontuacao: r.pontuacao,
    criadoEm: r.criadoEm,
    idUsuario: r.idUsuario,
  }));
}

/**
 * Best rank for this user's best run in the category (1 = top).
 */
export async function obterMelhorPosicaoUsuario(idCategoria, idUsuario) {
  const banco = await obterBancoSqlite();
  const melhor = await banco.getFirstAsync(
    `
      SELECT pontuacao AS pontuacao, tempo_total_ms AS tempoTotalMs
      FROM quiz_resultado
      WHERE id_categoria = ? AND id_usuario = ?
      ORDER BY pontuacao DESC, tempo_total_ms ASC
      LIMIT 1
    `,
    [idCategoria, idUsuario]
  );
  if (!melhor) return null;
  const row = await banco.getFirstAsync(
    `
      SELECT COUNT(*) AS c FROM quiz_resultado
      WHERE id_categoria = ? AND (
        pontuacao > ? OR (pontuacao = ? AND tempo_total_ms < ?)
      )
    `,
    [idCategoria, melhor.pontuacao, melhor.pontuacao, melhor.tempoTotalMs]
  );
  return (row?.c ?? 0) + 1;
}
