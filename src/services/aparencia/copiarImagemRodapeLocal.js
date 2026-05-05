import * as FileSystem from "expo-file-system/legacy";
import { EncodingType } from "expo-file-system/legacy";

/**
 * Copia URI (galeria, camera, tmp do view-shot, etc.) para documentDirectory.
 * Usa expo-file-system/legacy: o import principal do SDK 55+ lanca erro em copyAsync.
 * Se copy falhar (ex.: alguns content:// no Android), tenta via Base64.
 *
 * @param {string} uriOrigem
 * @returns {Promise<string>} file:// URI persistente
 */
export async function copiarImagemRodapeParaDocumentos(uriOrigem) {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error("documentDirectory indisponivel nesta plataforma");
  }

  const nomeArquivo = `rodape_${Date.now()}.png`;
  const destino = `${base}${nomeArquivo}`;

  try {
    await FileSystem.copyAsync({ from: uriOrigem, to: destino });
    return destino;
  } catch (erroCopy) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uriOrigem, {
        encoding: EncodingType.Base64,
      });
      await FileSystem.writeAsStringAsync(destino, base64, {
        encoding: EncodingType.Base64,
      });
      return destino;
    } catch {
      throw erroCopy;
    }
  }
}
