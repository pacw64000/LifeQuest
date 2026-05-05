import {
  atualizarMissaoNoFirebase,
  criarMissaoNoFirebase,
  excluirMissaoNoFirebase,
  listarMissoesPorUsuario,
} from "../firebase/repositorioMissoes";
import { atualizarPerfilUsuario, obterOuCriarPerfilUsuario } from "../firebase/repositorioPerfil";
import {
  enfileirarOperacaoPendente,
  excluirMissaoLocal,
  inicializarBancoLocal,
  listarMissoesLocais,
  listarOperacoesPendentes,
  obterPerfilLocal,
  removerOperacaoPendente,
  salvarMissaoLocal,
  salvarPerfilLocal,
  substituirMissoesLocais,
} from "../local/bancoLocal";

const perfilPadrao = {
  expAtual: 0,
  streakAtual: 0,
  ultimoDiaCompletado: null,
  conquistasDesbloqueadas: [],
  xpMiniGamesHoje: 0,
  dataControleMiniGame: null,
};

export async function carregarDadosDoUsuario(idUsuario, nomeUsuario, permitirNuvem) {
  await inicializarBancoLocal();
  const [perfilLocal, missoesLocais] = await Promise.all([obterPerfilLocal(idUsuario), listarMissoesLocais(idUsuario)]);
  const fallbackPerfil = { ...perfilPadrao, nomeUsuario: nomeUsuario || "Aventureiro", ...(perfilLocal || {}) };

  if (!permitirNuvem) {
    return { perfil: fallbackPerfil, missoes: missoesLocais };
  }

  try {
    await sincronizarPendenciasDoUsuario(idUsuario);
    const [perfilNuvem, missoesNuvem] = await Promise.all([
      obterOuCriarPerfilUsuario(idUsuario, nomeUsuario),
      listarMissoesPorUsuario(idUsuario),
    ]);
    await Promise.all([salvarPerfilLocal(idUsuario, perfilNuvem), substituirMissoesLocais(idUsuario, missoesNuvem)]);
    return { perfil: { ...perfilPadrao, ...perfilNuvem }, missoes: missoesNuvem };
  } catch (erro) {
    return { perfil: fallbackPerfil, missoes: missoesLocais };
  }
}

export async function sincronizarPendenciasDoUsuario(idUsuario) {
  const operacoes = await listarOperacoesPendentes(idUsuario);
  for (const operacao of operacoes) {
    try {
      if (operacao.tipoOperacao === "criar_missao") {
        await criarMissaoNoFirebase(idUsuario, operacao.payload);
      } else if (operacao.tipoOperacao === "atualizar_missao") {
        await atualizarMissaoNoFirebase(idUsuario, operacao.idMissao, operacao.payload);
      } else if (operacao.tipoOperacao === "excluir_missao") {
        await excluirMissaoNoFirebase(idUsuario, operacao.idMissao);
      } else if (operacao.tipoOperacao === "atualizar_perfil") {
        await atualizarPerfilUsuario(idUsuario, operacao.payload);
      }
      await removerOperacaoPendente(operacao.id);
    } catch (erro) {
      break;
    }
  }
}

export async function persistirPerfilComFallback(idUsuario, dadosAtualizados, permitirNuvem) {
  const perfilLocal = (await obterPerfilLocal(idUsuario)) || perfilPadrao;
  const proximoPerfil = { ...perfilLocal, ...dadosAtualizados };
  await salvarPerfilLocal(idUsuario, proximoPerfil);

  if (!permitirNuvem) return;
  try {
    await atualizarPerfilUsuario(idUsuario, dadosAtualizados);
  } catch (erro) {
    await enfileirarOperacaoPendente({
      idUsuario,
      tipoOperacao: "atualizar_perfil",
      payload: dadosAtualizados,
    });
  }
}

export async function persistirMissaoComFallback(idUsuario, missao, permitirNuvem) {
  await salvarMissaoLocal(idUsuario, missao);
  if (!permitirNuvem) return;
  try {
    await criarMissaoNoFirebase(idUsuario, missao);
  } catch (erro) {
    await enfileirarOperacaoPendente({
      idUsuario,
      tipoOperacao: "criar_missao",
      idMissao: missao.idMissao,
      payload: missao,
    });
  }
}

export async function atualizarMissaoComFallback(idUsuario, idMissao, dadosAtualizados, permitirNuvem) {
  const missoesLocais = await listarMissoesLocais(idUsuario);
  const missaoAtual = missoesLocais.find((item) => item.idMissao === idMissao);
  if (missaoAtual) {
    await salvarMissaoLocal(idUsuario, { ...missaoAtual, ...dadosAtualizados });
  }
  if (!permitirNuvem) return;
  try {
    await atualizarMissaoNoFirebase(idUsuario, idMissao, dadosAtualizados);
  } catch (erro) {
    await enfileirarOperacaoPendente({
      idUsuario,
      tipoOperacao: "atualizar_missao",
      idMissao,
      payload: dadosAtualizados,
    });
  }
}

export async function excluirMissaoComFallback(idUsuario, idMissao, permitirNuvem) {
  await excluirMissaoLocal(idUsuario, idMissao);
  if (!permitirNuvem) return;
  try {
    await excluirMissaoNoFirebase(idUsuario, idMissao);
  } catch (erro) {
    await enfileirarOperacaoPendente({
      idUsuario,
      tipoOperacao: "excluir_missao",
      idMissao,
    });
  }
}
