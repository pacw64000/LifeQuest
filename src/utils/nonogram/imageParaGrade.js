import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import jpeg from "jpeg-js";
import { nonogramConfig } from "../../config/nonogramConfig";

function base64ParaUint8Array(base64) {
  const globalAtob = typeof atob !== "undefined" ? atob : (str) => Buffer.from(str, "base64").toString("binary");
  const binario = globalAtob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

function luminancia(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Converte imagem local em grade binária NxN para nonograma.
 * @param {string} uri - file:// ou content://
 * @param {{ ladoGrade?: number, limiar?: number }} opcoes
 * @returns {Promise<{ grade: number[][], largura: number, altura: number }>}
 */
export async function imagemUriParaGrade(uri, opcoes = {}) {
  const { maxLado, minLado, limiarLuminancia } = nonogramConfig.grade;
  const lado = Math.min(
    maxLado,
    Math.max(minLado, typeof opcoes.ladoGrade === "number" ? opcoes.ladoGrade : maxLado)
  );
  const limiar = typeof opcoes.limiar === "number" ? opcoes.limiar : limiarLuminancia;

  const resultado = await manipulateAsync(
    uri,
    [{ resize: { width: lado, height: lado } }],
    {
      compress: 1,
      format: SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!resultado.base64) {
    throw new Error("Nao foi possivel ler a imagem processada.");
  }

  const bytes = base64ParaUint8Array(resultado.base64);
  const decodificado = jpeg.decode(bytes, { useTArray: true });
  const { width, height, data } = decodificado;

  if (!width || !height || !data) {
    throw new Error("Falha ao decodificar JPEG.");
  }

  const grade = [];
  for (let y = 0; y < height; y++) {
    const linha = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const lum = luminancia(r, g, b);
      const escuro = a < 16 ? false : lum < limiar;
      linha.push(escuro ? 1 : 0);
    }
    grade.push(linha);
  }

  validarGradeNaoTrivial(grade);

  return { grade, largura: width, altura: height };
}

function validarGradeNaoTrivial(grade) {
  let soma = 0;
  for (const linha of grade) {
    for (const v of linha) {
      soma += v;
    }
  }
  const total = grade.length * (grade[0]?.length ?? 0);
  if (soma === 0) {
    throw new Error("A imagem ficou toda vazia. Tente outra foto ou ajuste o limiar.");
  }
  if (soma === total) {
    throw new Error("A imagem ficou toda preenchida. Tente outra foto ou ajuste o limiar.");
  }
}
