export function calcularNivelPorXp(expAtual) {
  const expSegura = Math.max(0, expAtual || 0);
  const nivelAtual = Math.floor(expSegura / 100) + 1;
  const expInicioNivel = (nivelAtual - 1) * 100;
  const expMaximo = nivelAtual * 100;
  const progressoNivel = ((expSegura - expInicioNivel) / 100) * 100;

  return {
    nivelAtual,
    expInicioNivel,
    expMaximo,
    progressoNivel,
  };
}

export function calcularXpMissaoPorDificuldade(dificuldadeMissao) {
  const mapaDificuldadeParaXp = {
    facil: 20,
    media: 35,
    dificil: 50,
  };

  return mapaDificuldadeParaXp[dificuldadeMissao] || 20;
}
