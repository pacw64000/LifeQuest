import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { bancoDadosFirebase } from "./config";

const dadosPadraoPerfil = {
  nomeUsuario: "",
  expAtual: 0,
  streakAtual: 0,
  ultimoDiaCompletado: null,
  dataAtualizacao: new Date().toISOString(),
  conquistasDesbloqueadas: [],
  xpMiniGamesHoje: 0,
  dataControleMiniGame: null,
  tokenPush: "",
};

export async function obterOuCriarPerfilUsuario(idUsuario, nomeUsuarioFallback = "") {
  const referenciaPerfil = doc(bancoDadosFirebase, "usuarios", idUsuario);
  const snapshotPerfil = await getDoc(referenciaPerfil);

  if (!snapshotPerfil.exists()) {
    const novoPerfil = {
      ...dadosPadraoPerfil,
      nomeUsuario: nomeUsuarioFallback || "Aventureiro",
    };
    await setDoc(referenciaPerfil, novoPerfil);
    return novoPerfil;
  }

  return snapshotPerfil.data();
}

export async function atualizarPerfilUsuario(idUsuario, dadosAtualizados) {
  const referenciaPerfil = doc(bancoDadosFirebase, "usuarios", idUsuario);
  await updateDoc(referenciaPerfil, {
    ...dadosAtualizados,
    dataAtualizacao: new Date().toISOString(),
  });
}
