import React, { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { calcularNivelPorXp, calcularXpMissaoPorDificuldade } from "../utils/calculoProgresso";
import {
  atualizarMissaoComFallback,
  carregarDadosDoUsuario,
  excluirMissaoComFallback,
  persistirMissaoComFallback,
  persistirPerfilComFallback,
  sincronizarPendenciasDoUsuario,
} from "../services/servicoSincronizacaoUsuario";

const DadosAppContext = createContext(null);
const limiteXpMiniGameDiario = Number(process.env.EXPO_PUBLIC_DAILY_MINIGAME_XP_LIMIT || 200);

// XP → Moedas: 1 moeda a cada 5 XP ganho
const XP_POR_MOEDA = 5;

export const CATEGORIAS_MISSAO = ["SAÚDE", "ESTUDO", "FITNESS", "LEITURA", "MENTE", "CASA"];

const catalogoConquistasPadrao = [
  { idConquista: "primeira_missao",   tituloConquista: "PRIMEIRA QUEST",       descricaoConquista: "Complete sua 1ª missão.",         icone: "⭐", cor: "#F4C15A" },
  { idConquista: "streak_3",          tituloConquista: "TRINCA DE FOGO",        descricaoConquista: "3 dias seguidos.",                 icone: "🔥", cor: "#CC3B2F" },
  { idConquista: "streak_7",          tituloConquista: "SEMANA LENDÁRIA",       descricaoConquista: "7 dias seguidos.",                 icone: "🔥", cor: "#CC3B2F" },
  { idConquista: "nivel_5",           tituloConquista: "APRENDIZ",              descricaoConquista: "Alcance o nível 5.",               icone: "✏️", cor: "#4A7BC4" },
  { idConquista: "memoria_elite",     tituloConquista: "MEMÓRIA DE ELEFANTE",   descricaoConquista: "Vença a Memória em < 20 mov.",     icone: "🧠", cor: "#7B5EA7" },
  { idConquista: "cobra_mestra",      tituloConquista: "COBRA MESTRA",          descricaoConquista: "Score 15+ na Snake.",              icone: "🐍", cor: "#2D8B4E" },
  { idConquista: "quiz_perfeito",     tituloConquista: "SABE-TUDO",             descricaoConquista: "5/5 no Quiz.",                     icone: "❓", cor: "#4A7BC4" },
  { idConquista: "reflexo_felino",    tituloConquista: "REFLEXO FELINO",        descricaoConquista: "40+ taps em 5s.",                  icone: "⚡", cor: "#F4C15A" },
  { idConquista: "nivel_10",          tituloConquista: "CAVALEIRO",             descricaoConquista: "Alcance o nível 10.",              icone: "⚔️", cor: "#F4C15A" },
  { idConquista: "xp_1000",          tituloConquista: "HERÓI INICIANTE",       descricaoConquista: "Alcance 1000 XP.",                 icone: "🏅", cor: "#3DAA6E" },
  { idConquista: "missoes_10",       tituloConquista: "CAÇADOR DE MISSÕES",    descricaoConquista: "Complete 10 missões.",             icone: "🎯", cor: "#C86A2A" },
  { idConquista: "xp_5000",          tituloConquista: "LENDA VIVA",            descricaoConquista: "Alcance 5000 XP.",                 icone: "👑", cor: "#F4C15A" },
];

export function DadosAppProvider({ children }) {
  const { usuarioAutenticado } = useAuth();
  const [listaMissoes, setListaMissoes]                         = useState([]);
  const [expAtual, setExpAtual]                                 = useState(0);
  const [moedas, setMoedas]                                     = useState(0);
  const [streakAtual, setStreakAtual]                           = useState(0);
  const [dataUltimaMissaoConcluida, setDataUltimaMissaoConcluida] = useState(null);
  const [listaConquistasDesbloqueadas, setListaConquistasDesbloqueadas] = useState([]);
  const [xpMiniGamesHoje, setXpMiniGamesHoje]                   = useState(0);
  const [dataControleMiniGames, setDataControleMiniGames]       = useState(null);

  React.useEffect(() => {
    async function carregarDadosIniciais() {
      if (!usuarioAutenticado?.idUsuario) {
        setListaMissoes([]); setExpAtual(0); setMoedas(0); setStreakAtual(0);
        setDataUltimaMissaoConcluida(null); setListaConquistasDesbloqueadas([]);
        setXpMiniGamesHoje(0); setDataControleMiniGames(null);
        return;
      }
      try {
        const permitirNuvem = !usuarioAutenticado?.isGuest;
        const { missoes, perfil } = await carregarDadosDoUsuario(
          usuarioAutenticado.idUsuario, usuarioAutenticado.nomeUsuario, permitirNuvem
        );
        setListaMissoes(missoes);
        setExpAtual(perfil.expAtual || 0);
        setMoedas(perfil.moedas || Math.floor((perfil.expAtual || 0) / XP_POR_MOEDA));
        setStreakAtual(perfil.streakAtual || 0);
        setDataUltimaMissaoConcluida(perfil.ultimoDiaCompletado || null);
        setListaConquistasDesbloqueadas(perfil.conquistasDesbloqueadas || []);
        setXpMiniGamesHoje(perfil.xpMiniGamesHoje || 0);
        setDataControleMiniGames(perfil.dataControleMiniGame || null);
      } catch (erro) { /* continua offline */ }
    }
    carregarDadosIniciais();
  }, [usuarioAutenticado]);

  async function salvarPerfilParcial(dadosAtualizados) {
    if (!usuarioAutenticado?.idUsuario) return;
    const permitirNuvem = !usuarioAutenticado?.isGuest;
    await persistirPerfilComFallback(usuarioAutenticado.idUsuario, dadosAtualizados, permitirNuvem);
    if (permitirNuvem) sincronizarPendenciasDoUsuario(usuarioAutenticado.idUsuario).catch(() => {});
  }

  function criarMissao({ tituloMissao, descricaoMissao, dificuldadeMissao, categoriaMissao = "SAÚDE", horaMissao = "", segundosLembrete = 0 }) {
    const idMissao = `${Date.now()}`;
    const novaMissao = {
      idMissao, idUsuario: usuarioAutenticado?.idUsuario || "",
      tituloMissao, descricaoMissao, dificuldadeMissao,
      categoriaMissao, horaMissao,
      concluida: false, segundosLembrete, idNotificacao: null,
      dataCriacao: new Date().toISOString(),
    };
    setListaMissoes((prev) => [novaMissao, ...prev]);
    if (usuarioAutenticado?.idUsuario) {
      const permitirNuvem = !usuarioAutenticado?.isGuest;
      persistirMissaoComFallback(usuarioAutenticado.idUsuario, novaMissao, permitirNuvem).then(() => {
        if (permitirNuvem) sincronizarPendenciasDoUsuario(usuarioAutenticado.idUsuario).catch(() => {});
      });
    }
    return novaMissao;
  }

  function removerMissao(idMissao) {
    setListaMissoes((prev) => prev.filter((m) => m.idMissao !== idMissao));
    if (usuarioAutenticado?.idUsuario) {
      const permitirNuvem = !usuarioAutenticado?.isGuest;
      excluirMissaoComFallback(usuarioAutenticado.idUsuario, idMissao, permitirNuvem).then(() => {
        if (permitirNuvem) sincronizarPendenciasDoUsuario(usuarioAutenticado.idUsuario).catch(() => {});
      });
    }
  }

  function atualizarStreakAoConcluirMissao() {
    const hoje = new Date();
    const dataHojeIso = hoje.toISOString().slice(0, 10);
    const dataUltima  = dataUltimaMissaoConcluida?.slice(0, 10);
    if (!dataUltima) {
      setStreakAtual(1); setDataUltimaMissaoConcluida(hoje.toISOString());
      salvarPerfilParcial({ streakAtual: 1, ultimoDiaCompletado: hoje.toISOString() });
      return;
    }
    const diff = Math.floor(
      (new Date(`${dataHojeIso}T00:00:00`).getTime() - new Date(`${dataUltima}T00:00:00`).getTime()) / 86400000
    );
    if (diff === 0) return;
    const novoStreak = diff === 1 ? streakAtual + 1 : 1;
    setStreakAtual(novoStreak); setDataUltimaMissaoConcluida(hoje.toISOString());
    salvarPerfilParcial({ streakAtual: novoStreak, ultimoDiaCompletado: hoje.toISOString() });
  }

  function processarConquistas(xp, streak, totalConcluidas) {
    const novos = [];
    if (totalConcluidas >= 1)   novos.push("primeira_missao");
    if (totalConcluidas >= 10)  novos.push("missoes_10");
    if (xp >= 1000)             novos.push("xp_1000");
    if (xp >= 5000)             novos.push("xp_5000");
    if (streak >= 3)            novos.push("streak_3");
    if (streak >= 7)            novos.push("streak_7");
    // nivel checado via progressoNivel no render
    setListaConquistasDesbloqueadas((prev) => Array.from(new Set([...prev, ...novos])));
    salvarPerfilParcial({ conquistasDesbloqueadas: Array.from(new Set([...listaConquistasDesbloqueadas, ...novos])) });
  }

  function concluirMissao(idMissao) {
    let xpGanho = 0;
    let totalConcluidas = 0;
    setListaMissoes((prev) =>
      prev.map((m) => {
        if (m.concluida) { totalConcluidas++; return m; }
        if (m.idMissao !== idMissao) return m;
        xpGanho = calcularXpMissaoPorDificuldade(m.dificuldadeMissao);
        totalConcluidas++;
        if (usuarioAutenticado?.idUsuario) {
          const permitirNuvem = !usuarioAutenticado?.isGuest;
          atualizarMissaoComFallback(usuarioAutenticado.idUsuario, m.idMissao,
            { concluida: true, dataConclusao: new Date().toISOString() }, permitirNuvem)
            .then(() => { if (permitirNuvem) sincronizarPendenciasDoUsuario(usuarioAutenticado.idUsuario).catch(() => {}); });
        }
        return { ...m, concluida: true, dataConclusao: new Date().toISOString() };
      })
    );
    atualizarStreakAoConcluirMissao();
    setExpAtual((xpAnterior) => {
      const xpNovo = xpAnterior + xpGanho;
      const moedasGanhas = Math.floor(xpGanho / XP_POR_MOEDA);
      setMoedas((prev) => { const novo = prev + moedasGanhas; salvarPerfilParcial({ moedas: novo }); return novo; });
      processarConquistas(xpNovo, streakAtual, totalConcluidas);
      salvarPerfilParcial({ expAtual: xpNovo });
      return xpNovo;
    });
  }

  function registrarResultadoMiniGame(idGame, pontuacaoBase) {
    const dataHoje = new Date().toISOString().slice(0, 10);
    let xpDisponivel = limiteXpMiniGameDiario;
    if (dataControleMiniGames === dataHoje) {
      xpDisponivel = Math.max(0, limiteXpMiniGameDiario - xpMiniGamesHoje);
    } else {
      setDataControleMiniGames(dataHoje); setXpMiniGamesHoje(0);
    }
    const xpCalculado = Math.min(xpDisponivel, Math.max(0, pontuacaoBase));
    if (xpCalculado <= 0) return 0;
    setExpAtual((prev) => {
      const xpNovo = prev + xpCalculado;
      const moedasGanhas = Math.floor(xpCalculado / XP_POR_MOEDA);
      setMoedas((m) => { const novo = m + moedasGanhas; salvarPerfilParcial({ moedas: novo }); return novo; });
      processarConquistas(xpNovo, streakAtual, listaMissoes.filter((m) => m.concluida).length);
      salvarPerfilParcial({ expAtual: xpNovo });
      return xpNovo;
    });
    const novoXpHoje = xpMiniGamesHoje + xpCalculado;
    setXpMiniGamesHoje(novoXpHoje);
    salvarPerfilParcial({ xpMiniGamesHoje: novoXpHoje, dataControleMiniGame: dataHoje });
    return xpCalculado;
  }

  // Conquistas por nível
  const progressoNivel = calcularNivelPorXp(expAtual);
  React.useEffect(() => {
    if (progressoNivel.nivelAtual >= 5)  setListaConquistasDesbloqueadas((p) => Array.from(new Set([...p, "nivel_5"])));
    if (progressoNivel.nivelAtual >= 10) setListaConquistasDesbloqueadas((p) => Array.from(new Set([...p, "nivel_10"])));
  }, [progressoNivel.nivelAtual]);

  const partidas = Math.max(0, 3 - Math.floor(xpMiniGamesHoje / (limiteXpMiniGameDiario / 3)));

  const valorContexto = useMemo(() => ({
    listaMissoes, criarMissao, removerMissao, concluirMissao,
    expAtual, moedas, streakAtual, progressoNivel,
    registrarResultadoMiniGame, limiteXpMiniGameDiario, xpMiniGamesHoje,
    partidasRestantesHoje: partidas,
    catalogoConquistasPadrao, listaConquistasDesbloqueadas,
  }), [listaMissoes, expAtual, moedas, streakAtual, progressoNivel,
       xpMiniGamesHoje, partidas, listaConquistasDesbloqueadas]);

  return <DadosAppContext.Provider value={valorContexto}>{children}</DadosAppContext.Provider>;
}

export function useDadosApp() {
  const ctx = useContext(DadosAppContext);
  if (!ctx) throw new Error("useDadosApp deve ser usado dentro de DadosAppProvider");
  return ctx;
}
