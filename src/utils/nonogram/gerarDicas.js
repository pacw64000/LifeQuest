/**
 * Gera pistas (runs) para linhas e colunas de um nonograma binário (0/1).
 */

export function runsParaLinha(linha) {
  const grupos = [];
  let atual = 0;
  for (let i = 0; i < linha.length; i++) {
    if (linha[i] === 1) {
      atual++;
    } else if (atual > 0) {
      grupos.push(atual);
      atual = 0;
    }
  }
  if (atual > 0) grupos.push(atual);
  if (grupos.length === 0) grupos.push(0);
  return grupos;
}

export function extrairColuna(grade, indiceColuna) {
  return grade.map((linha) => linha[indiceColuna]);
}

/**
 * @param {number[][]} grade - matriz 0/1
 * @returns {{ dicasLinhas: number[][], dicasColunas: number[][] }}
 */
export function gerarDicasCompletas(grade) {
  const altura = grade.length;
  const largura = grade[0]?.length ?? 0;
  const dicasLinhas = grade.map((linha) => runsParaLinha(linha));
  const dicasColunas = [];
  for (let c = 0; c < largura; c++) {
    dicasColunas.push(runsParaLinha(extrairColuna(grade, c)));
  }
  return { dicasLinhas, dicasColunas };
}

export function formatarDicasParaExibicao(dicas) {
  return dicas.map((grupo) => grupo.join(" ")).join(" | ");
}

export function maiorRunDasDicas(dicasLinhas, dicasColunas) {
  let max = 0;
  for (const linha of dicasLinhas) {
    for (const n of linha) {
      if (n > max) max = n;
    }
  }
  for (const col of dicasColunas) {
    for (const n of col) {
      if (n > max) max = n;
    }
  }
  return max;
}
