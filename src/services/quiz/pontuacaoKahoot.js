import { PONTOS_BASE_CORRETO, PONTOS_MIN_CORRETO, TEMPO_MAX_PERGUNTA_MS } from "./constantesQuiz";

/**
 * Kahoot-like: faster correct answers yield more points.
 * Wrong answers: use 0 points and do not add time to tempo total (handled by caller).
 */
export function calcularPontosRespostaCorreta(tempoRespostaMs) {
  const t = Math.min(Math.max(0, tempoRespostaMs), TEMPO_MAX_PERGUNTA_MS);
  const ratio = 1 - t / TEMPO_MAX_PERGUNTA_MS;
  const bruto = Math.floor(PONTOS_BASE_CORRETO * ratio);
  return Math.max(PONTOS_MIN_CORRETO, bruto);
}
