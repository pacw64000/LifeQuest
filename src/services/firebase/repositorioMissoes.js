import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
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
  const resposta = await addDoc(obterColecaoMissoes(idUsuario), dadosMissao);
  return resposta.id;
}

export async function atualizarMissaoNoFirebase(idUsuario, idMissao, dadosAtualizados) {
  const referenciaDocumento = doc(bancoDadosFirebase, "usuarios", idUsuario, "missoes", idMissao);
  await updateDoc(referenciaDocumento, dadosAtualizados);
}

export async function excluirMissaoNoFirebase(idUsuario, idMissao) {
  const referenciaDocumento = doc(bancoDadosFirebase, "usuarios", idUsuario, "missoes", idMissao);
  await deleteDoc(referenciaDocumento);
}
