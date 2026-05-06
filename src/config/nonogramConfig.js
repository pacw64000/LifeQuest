/**
 * Configuração central do Nonogram (grade, pontuação, placar).
 * Ajuste estes valores sem alterar a lógica nas telas.
 */

export const nonogramConfig = {
  grade: {
    /** Maior dimensão (largura ou altura) ao gerar a partir de uma imagem */
    maxLado: 22,
    minLado: 5,
    /** 0–255: pixels mais escuros que o limiar viram célula preenchida */
    limiarLuminancia: 128,
  },

  /** Pesos para pontuação base derivada da imagem / grade solução */
  pontuacaoBase: {
    pesoArea: 0.35,
    pesoCelulasPreenchidas: 0.45,
    pesoMaiorRun: 1.2,
    valorMinimo: 40,
    valorMaximo: 220,
  },

  /** Partida final e XP (mini-game) */
  pontuacaoPartida: {
    penalidadePorSegundo: 1.8,
    penalidadePorErro: 12,
    /** XP entregue ao perfil = min(este teto, pontuação final arredondada) */
    xpMaxPorPartida: 120,
    xpMinPorPartida: 8,
  },

  /**
   * Ordem de desempate no placar: primeiro campo mais importante.
   * direcao 'asc' = menor valor melhor (tempo, erros).
   */
  ordenacaoPlacar: [
    { campo: "erros", direcao: "asc" },
    { campo: "tempoMs", direcao: "asc" },
  ],

  /** Modo de contagem de erros ao concluir */
  erros: {
    modo: "aoCompletar",
  },

  ui: {
    tamanhoMaximoCelula: 34,
    tamanhoMinimoCelula: 12,
    /** Máximo de entradas exibidas no placar local */
    limitePlacarExibicao: 50,
  },

  categorias: ["Animais", "Natureza", "Objetos", "Arte", "Outros"],

  filtrosComunidade: {
    recentes: { rotulo: "Recentes", campoOrdenacao: "criadoEm" },
    visualizacoes: { rotulo: "Mais visualizações", campoOrdenacao: "visualizacoes", emBreve: false },
    favoritos: { rotulo: "Favoritos", campoOrdenacao: "favoritos", emBreve: true },
    recompensas: { rotulo: "Recompensas", campoOrdenacao: "recompensaPontos", emBreve: true },
  },
};
