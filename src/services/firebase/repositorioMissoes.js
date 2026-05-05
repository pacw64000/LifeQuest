import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { bancoDadosFirebase } from "./config";

function obterColecaoMissoes(idUsuario) {
  return collection(bancoDadosFirebase, "usuarios", idUsuario, "missoes");
}

export async function listarMissoesPorUsuario(idUsuario) {
  const consulta = query(obterColecaoMissoes(idUsuario), orderBy("dataCriacao", "desc"));
  const resposta = await getDocs(consulta);
  return resposta.docs.map((documento) => ({ idMissao: documento.id, ...documento.data() }));
}

export async function criarMissaoNoFirebase(idUsuario, dadosMissao) {
  const idMissao = dadosMissao.idMissao || `${Date.now()}`;
  const referenciaDocumento = doc(bancoDadosFirebase, "usuarios", idUsuario, "missoes", idMissao);
  await setDoc(referenciaDocumento, { ...dadosMissao, idMissao });
  return idMissao;
}

export async function atualizarMissaoNoFirebase(idUsuario, idMissao, dadosAtualizados) {
  const referenciaDocumento = doc(bancoDadosFirebase, "usuarios", idUsuario, "missoes", idMissao);
  await updateDoc(referenciaDocumento, dadosAtualizados);
}

export async function excluirMissaoNoFirebase(idUsuario, idMissao) {
  const referenciaDocumento = doc(bancoDadosFirebase, "usuarios", idUsuario, "missoes", idMissao);
  await deleteDoc(referenciaDocumento);
}
