import React, { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { calcularNivelPorXp, calcularXpMissaoPorDificuldade } from "../utils/calculoProgresso";
import {
  atualizarMissaoNoFirebase,
  criarMissaoNoFirebase,
  excluirMissaoNoFirebase,
  listarMissoesPorUsuario,
} from "../services/firebase/repositorioMissoes";
import { atualizarPerfilUsuario, obterOuCriarPerfilUsuario } from "../services/firebase/repositorioPerfil";

const DadosAppContext = createContext(null);
const limiteXpMiniGameDiario = Number(process.env.EXPO_PUBLIC_DAILY_MINIGAME_XP_LIMIT || 200);

const catalogoConquistasPadrao = [
  { idConquista: "primeira_missao", tituloConquista: "Primeira Missao", descricaoConquista: "Complete sua primeira missao." },
  { idConquista: "xp_1000", tituloConquista: "Herói Iniciante", descricaoConquista: "Alcance 1000 XP." },
  { idConquista: "streak_7", tituloConquista: "Disciplina de Ferro", descricaoConquista: "Atinja 7 dias de streak." },
];

export function DadosAppProvider({ children }) {
  const { usuarioAutenticado } = useAuth();
  const [listaMissoes, setListaMissoes] = useState([]);
  const [expAtual, setExpAtual] = useState(0);
  const [streakAtual, setStreakAtual] = useState(0);
  const [dataUltimaMissaoConcluida, setDataUltimaMissaoConcluida] = useState(null);
  const [listaConquistasDesbloqueadas, setListaConquistasDesbloqueadas] = useState([]);
  const [xpMiniGamesHoje, setXpMiniGamesHoje] = useState(0);
  const [dataControleMiniGames, setDataControleMiniGames] = useState(null);

  React.useEffect(() => {
    async function carregarDadosIniciais() {
      if (!usuarioAutenticado?.idUsuario) {
        setListaMissoes([]);
        return;
      }
      try {
        const [missoesFirebase, perfilFirebase] = await Promise.all([
          listarMissoesPorUsuario(usuarioAutenticado.idUsuario),
          obterOuCriarPerfilUsuario(usuarioAutenticado.idUsuario, usuarioAutenticado.nomeUsuario),
        ]);
        setListaMissoes(missoesFirebase);
        setExpAtual(perfilFirebase.expAtual || 0);
        setStreakAtual(perfilFirebase.streakAtual || 0);
        setDataUltimaMissaoConcluida(perfilFirebase.ultimoDiaCompletado || null);
        setListaConquistasDesbloqueadas(perfilFirebase.conquistasDesbloqueadas || []);
        setXpMiniGamesHoje(perfilFirebase.xpMiniGamesHoje || 0);
        setDataControleMiniGames(perfilFirebase.dataControleMiniGame || null);
      } catch (erro) {
        // O app continua funcional localmente mesmo se o backend falhar.
      }
    }
    carregarDadosIniciais();
  }, [usuarioAutenticado]);

  async function salvarPerfilParcial(dadosAtualizadosPerfil) {
    if (!usuarioAutenticado?.idUsuario) return;
    try {
      await atualizarPerfilUsuario(usuarioAutenticado.idUsuario, dadosAtualizadosPerfil);
    } catch (erro) {
      // Evita quebra de UX em caso de falha de rede.
    }
  }

  function criarMissao({ tituloMissao, descricaoMissao, dificuldadeMissao, segundosLembrete = 0 }) {
    const idMissao = `${Date.now()}`;
    const novaMissao = {
      idMissao,
      idUsuario: usuarioAutenticado?.idUsuario || "",
      tituloMissao,
      descricaoMissao,
      dificuldadeMissao,
      concluida: false,
      segundosLembrete,
      idNotificacao: null,
      dataCriacao: new Date().toISOString(),
    };
    setListaMissoes((estadoAnterior) => [novaMissao, ...estadoAnterior]);
    if (usuarioAutenticado?.idUsuario) {
      criarMissaoNoFirebase(usuarioAutenticado.idUsuario, novaMissao).catch(() => {});
    }
    return novaMissao;
  }

  function removerMissao(idMissao) {
    setListaMissoes((estadoAnterior) => estadoAnterior.filter((missaoAtual) => missaoAtual.idMissao !== idMissao));
    if (usuarioAutenticado?.idUsuario) {
      excluirMissaoNoFirebase(usuarioAutenticado.idUsuario, idMissao).catch(() => {});
    }
  }

  function atualizarStreakAoConcluirMissao() {
    const hoje = new Date();
    const dataHojeIso = hoje.toISOString().slice(0, 10);
    const dataUltima = dataUltimaMissaoConcluida?.slice(0, 10);

    if (!dataUltima) {
      setStreakAtual(1);
      setDataUltimaMissaoConcluida(hoje.toISOString());
      salvarPerfilParcial({ streakAtual: 1, ultimoDiaCompletado: hoje.toISOString() });
      return;
    }

    const diferencaDias = Math.floor(
      (new Date(`${dataHojeIso}T00:00:00`).getTime() - new Date(`${dataUltima}T00:00:00`).getTime()) / 86400000
    );

    if (diferencaDias === 0) {
      return;
    }
    if (diferencaDias === 1) {
      const novoStreak = streakAtual + 1;
      setStreakAtual(novoStreak);
      salvarPerfilParcial({ streakAtual: novoStreak, ultimoDiaCompletado: hoje.toISOString() });
    } else {
      setStreakAtual(1);
      salvarPerfilParcial({ streakAtual: 1, ultimoDiaCompletado: hoje.toISOString() });
    }
    setDataUltimaMissaoConcluida(hoje.toISOString());
  }

  function processarConquistas(expAposAtualizacao, streakAposAtualizacao, totalMissoesConcluidas) {
    const novosIds = [];
    if (totalMissoesConcluidas >= 1) novosIds.push("primeira_missao");
    if (expAposAtualizacao >= 1000) novosIds.push("xp_1000");
    if (streakAposAtualizacao >= 7) novosIds.push("streak_7");

    setListaConquistasDesbloqueadas((listaAtual) =>
      Array.from(new Set([...listaAtual, ...novosIds]))
    );
    salvarPerfilParcial({ conquistasDesbloqueadas: Array.from(new Set([...listaConquistasDesbloqueadas, ...novosIds])) });
  }

  function concluirMissao(idMissao) {
    let xpGanhoMissao = 0;
    let totalMissoesConcluidas = 0;
    setListaMissoes((estadoAnterior) =>
      estadoAnterior.map((missaoAtual) => {
        if (missaoAtual.idMissao !== idMissao || missaoAtual.concluida) {
          if (missaoAtual.concluida) totalMissoesConcluidas += 1;
          return missaoAtual;
        }
        xpGanhoMissao = calcularXpMissaoPorDificuldade(missaoAtual.dificuldadeMissao);
        totalMissoesConcluidas += 1;
        if (usuarioAutenticado?.idUsuario) {
          atualizarMissaoNoFirebase(usuarioAutenticado.idUsuario, missaoAtual.idMissao, {
            concluida: true,
            dataConclusao: new Date().toISOString(),
          }).catch(() => {});
        }
        return { ...missaoAtual, concluida: true, dataConclusao: new Date().toISOString() };
      })
    );

    atualizarStreakAoConcluirMissao();
    setExpAtual((xpAnterior) => {
      const xpAposAtualizacao = xpAnterior + xpGanhoMissao;
      processarConquistas(xpAposAtualizacao, streakAtual, totalMissoesConcluidas);
      salvarPerfilParcial({ expAtual: xpAposAtualizacao });
      return xpAposAtualizacao;
    });
  }

  function registrarResultadoMiniGame(idGame, pontuacaoBase) {
    const dataHoje = new Date().toISOString().slice(0, 10);
    let xpDisponivel = limiteXpMiniGameDiario;
    if (dataControleMiniGames === dataHoje) {
      xpDisponivel = Math.max(0, limiteXpMiniGameDiario - xpMiniGamesHoje);
    } else {
      setDataControleMiniGames(dataHoje);
      setXpMiniGamesHoje(0);
    }

    const xpCalculado = Math.min(xpDisponivel, Math.max(0, pontuacaoBase));
    if (xpCalculado <= 0) {
      return 0;
    }

    setExpAtual((xpAnterior) => {
      const xpAposAtualizacao = xpAnterior + xpCalculado;
      processarConquistas(xpAposAtualizacao, streakAtual, listaMissoes.filter((missao) => missao.concluida).length);
      salvarPerfilParcial({ expAtual: xpAposAtualizacao });
      return xpAposAtualizacao;
    });
    setXpMiniGamesHoje((xpAnterior) => xpAnterior + xpCalculado);
    salvarPerfilParcial({
      xpMiniGamesHoje: xpMiniGamesHoje + xpCalculado,
      dataControleMiniGame: dataHoje,
    });
    return xpCalculado;
  }

  const progressoNivel = calcularNivelPorXp(expAtual);

  const valorContexto = useMemo(
    () => ({
      listaMissoes,
      criarMissao,
      removerMissao,
      concluirMissao,
      expAtual,
      streakAtual,
      progressoNivel,
      registrarResultadoMiniGame,
      limiteXpMiniGameDiario,
      xpMiniGamesHoje,
      catalogoConquistasPadrao,
      listaConquistasDesbloqueadas,
    }),
    [listaMissoes, expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, listaConquistasDesbloqueadas]
  );

  return <DadosAppContext.Provider value={valorContexto}>{children}</DadosAppContext.Provider>;
}

export function useDadosApp() {
  const contextoDados = useContext(DadosAppContext);
  if (!contextoDados) {
    throw new Error("useDadosApp deve ser usado dentro de DadosAppProvider");
  }
  return contextoDados;
}
