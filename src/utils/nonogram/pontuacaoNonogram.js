import { nonogramConfig } from "../../config/nonogramConfig";
import { gerarDicasCompletas, maiorRunDasDicas } from "./gerarDicas";

export function contarCelulasPreenchidas(grade) {
  let n = 0;
  for (const linha of grade) {
    for (const v of linha) {
      if (v === 1) n++;
    }
  }
  return n;
}

export function calcularPontuacaoBaseImagem(grade) {
  const { pesoArea, pesoCelulasPreenchidas, pesoMaiorRun, valorMinimo, valorMaximo } =
    nonogramConfig.pontuacaoBase;
  const altura = grade.length;
  const largura = grade[0]?.length ?? 0;
  const area = largura * altura;
  const preenchidas = contarCelulasPreenchidas(grade);
  const { dicasLinhas, dicasColunas } = gerarDicasCompletas(grade);
  const maiorRun = maiorRunDasDicas(dicasLinhas, dicasColunas);

  const bruto =
    pesoArea * area + pesoCelulasPreenchidas * preenchidas + pesoMaiorRun * maiorRun;
  return Math.round(Math.min(valorMaximo, Math.max(valorMinimo, bruto)));
}

/**
 * @param {number} pontuacaoBase
 * @param {number} tempoSegundos
 * @param {number} erros
 */
export function calcularPontuacaoFinalPartida(pontuacaoBase, tempoSegundos, erros) {
  const { penalidadePorSegundo, penalidadePorErro } = nonogramConfig.pontuacaoPartida;
  const val = pontuacaoBase - penalidadePorSegundo * tempoSegundos - penalidadePorErro * erros;
  return Math.max(0, Math.round(val));
}

export function calcularXpMiniGameAPartirDaPontuacao(pontuacaoFinal) {
  const { xpMaxPorPartida, xpMinPorPartida } = nonogramConfig.pontuacaoPartida;
  const xp = Math.round(pontuacaoFinal);
  return Math.min(xpMaxPorPartida, Math.max(xpMinPorPartida, xp));
}

/**
 * Retorna true se o primeiro resultado deve aparecer antes do segundo no placar (melhor).
 */
export function primeiroResultadoMelhorQueSegundo(a, b) {
  const regras = nonogramConfig.ordenacaoPlacar;
  for (const { campo, direcao } of regras) {
    const va = a[campo];
    const vb = b[campo];
    if (va !== vb) {
      if (direcao === "asc") return va < vb;
      return va > vb;
    }
  }
  const pa = a.pontuacao ?? 0;
  const pb = b.pontuacao ?? 0;
  return pa > pb;
}

export function novoRunEhMelhorQueAnterior(novo, anterior) {
  if (!anterior) return true;
  return primeiroResultadoMelhorQueSegundo(
    {
      erros: novo.erros,
      tempoMs: novo.tempoMs,
      pontuacao: novo.pontuacao,
    },
    {
      erros: anterior.erros,
      tempoMs: anterior.tempoMs,
      pontuacao: anterior.pontuacao,
    }
  );
}

export function contarErrosGrade(solucao, jogador) {
  let erros = 0;
  for (let i = 0; i < solucao.length; i++) {
    for (let j = 0; j < solucao[i].length; j++) {
      if ((jogador[i][j] ?? 0) !== solucao[i][j]) erros++;
    }
  }
  return erros;
}
