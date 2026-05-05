import * as FileSystem from "expo-file-system";

/**
 * Copia URI temporaria do picker para diretorio do app (persiste apos reinicio).
 * @param {string} uriOrigem
 * @returns {Promise<string>} file:// URI no documentDirectory
 */
export async function copiarImagemRodapeParaDocumentos(uriOrigem) {
  const nomeArquivo = `rodape_${Date.now()}.jpg`;
  const destino = `${FileSystem.documentDirectory}${nomeArquivo}`;
  await FileSystem.copyAsync({ from: uriOrigem, to: destino });
  return destino;
}
