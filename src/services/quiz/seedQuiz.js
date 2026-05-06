import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { obterBancoSqlite } from "../local/bancoLocal";
import {
  CHAVE_SEED_BUNDLE,
  ID_FONTE_MULTI,
  ID_FONTE_WIKI,
  QUIZ_SEED_VERSION,
  TAMANHO_LOTE_INSERCAO,
} from "./constantesQuiz";
import { construirIdCategoria, parseRegistroPergunta } from "./parserQuizCsv";

const ASSET_MULTI = require("../../../assets/quiz/multi-theme.csv");
const ASSET_WIKI = require("../../../assets/quiz/wiki-based.csv");

async function lerCsvDoAsset(moduloRequire) {
  const asset = Asset.fromModule(moduloRequire);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  if (!uri) throw new Error("Quiz: URI do asset CSV ausente.");
  return FileSystem.readAsStringAsync(uri);
}

function extrairCampoLinha(linha, nomeAlternativos) {
  for (const nome of nomeAlternativos) {
    if (linha[nome] != null && linha[nome] !== "") return linha[nome];
  }
  const chaves = Object.keys(linha);
  const lower = nomeAlternativos.map((n) => n.toLowerCase());
  for (const chave of chaves) {
    if (lower.includes(chave.toLowerCase())) return linha[chave];
  }
  return null;
}

function parseCsvParaLinhas(texto) {
  const resultado = Papa.parse(texto, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (resultado.errors?.length) {
    const graves = resultado.errors.filter((e) => e.type === "Quotes" || e.code === "TooManyFields");
    if (graves.length > 0) {
      console.warn("Quiz CSV parse warnings:", graves.slice(0, 3));
    }
  }
  return resultado.data || [];
}

async function processarArquivoCsv(texto, idFonte) {
  const linhas = parseCsvParaLinhas(texto);
  /** @type {Map<string, { nomeExibicao: string, perguntas: Array<{ textoPergunta: string, opcoes: string[], indiceCorreto: number, dificuldade: string|null, ordem: number }> }} */
  const grupos = new Map();
  let ordem = 0;

  for (const linha of linhas) {
    const metaBruto = extrairCampoLinha(linha, ["question message", "question_message"]);
    const colQ = extrairCampoLinha(linha, ["Q"]);
    const colA = extrairCampoLinha(linha, ["A"]);
    const metaTexto = metaBruto || colQ;
    const parsed = parseRegistroPergunta(metaTexto, colA);
    if (!parsed) continue;

    const idCategoria = construirIdCategoria(idFonte, parsed.nomeCategoria);
    ordem += 1;

    if (!grupos.has(idCategoria)) {
      grupos.set(idCategoria, { nomeExibicao: parsed.nomeCategoria, perguntas: [] });
    }
    grupos.get(idCategoria).perguntas.push({
      textoPergunta: parsed.textoPergunta,
      opcoes: parsed.opcoes,
      indiceCorreto: parsed.indiceCorreto,
      dificuldade: parsed.dificuldade,
      ordem,
    });
  }

  return grupos;
}

async function inserirPerguntasEmLotes(banco, idFonte, grupos) {
  const sql =
    "INSERT INTO quiz_pergunta (id, id_categoria, texto_pergunta, opcoes_json, indice_correto, dificuldade, ordem_arquivo) VALUES (?, ?, ?, ?, ?, ?, ?)";
  let buffer = [];
  let idSeq = 0;

  async function flush() {
    if (buffer.length === 0) return;
    await banco.withTransactionAsync(async () => {
      for (const params of buffer) {
        await banco.runAsync(sql, params);
      }
    });
    buffer = [];
  }

  for (const [idCategoria, info] of grupos) {
    for (const p of info.perguntas) {
      idSeq += 1;
      const idPergunta = `${idFonte}:${idSeq}`;
      buffer.push([
        idPergunta,
        idCategoria,
        p.textoPergunta,
        JSON.stringify(p.opcoes),
        p.indiceCorreto,
        p.dificuldade,
        p.ordem,
      ]);
      if (buffer.length >= TAMANHO_LOTE_INSERCAO) {
        await flush();
      }
    }
  }
  await flush();
}

export async function seedQuizSeNecessario() {
  const banco = await obterBancoSqlite();
  const meta = await banco.getFirstAsync("SELECT valor_integer FROM quiz_meta WHERE chave = ?", [CHAVE_SEED_BUNDLE]);
  const versaoAtual = meta?.valor_integer ?? 0;
  if (versaoAtual >= QUIZ_SEED_VERSION) {
    return { reseed: false, versao: versaoAtual };
  }

  await banco.execAsync(`
    DELETE FROM quiz_resultado;
    DELETE FROM quiz_pergunta;
    DELETE FROM quiz_categoria;
    DELETE FROM quiz_fonte;
  `);

  await banco.runAsync("INSERT INTO quiz_fonte (id, rotulo, versao_seed) VALUES (?, ?, ?)", [
    ID_FONTE_MULTI,
    "Multi-Theme",
    QUIZ_SEED_VERSION,
  ]);
  await banco.runAsync("INSERT INTO quiz_fonte (id, rotulo, versao_seed) VALUES (?, ?, ?)", [
    ID_FONTE_WIKI,
    "Wiki-Based",
    QUIZ_SEED_VERSION,
  ]);

  const textoMulti = await lerCsvDoAsset(ASSET_MULTI);
  const textoWiki = await lerCsvDoAsset(ASSET_WIKI);

  const gruposMulti = await processarArquivoCsv(textoMulti, ID_FONTE_MULTI);
  const gruposWiki = await processarArquivoCsv(textoWiki, ID_FONTE_WIKI);

  async function inserirCategorias(grupos, idFonteEsperado) {
    for (const [idCategoria, info] of grupos) {
      await banco.runAsync(
        "INSERT INTO quiz_categoria (id, id_fonte, nome_exibicao, contagem) VALUES (?, ?, ?, ?)",
        [idCategoria, idFonteEsperado, info.nomeExibicao, info.perguntas.length]
      );
    }
  }

  await banco.withTransactionAsync(async () => {
    await inserirCategorias(gruposMulti, ID_FONTE_MULTI);
    await inserirCategorias(gruposWiki, ID_FONTE_WIKI);
  });

  await inserirPerguntasEmLotes(banco, ID_FONTE_MULTI, gruposMulti);
  await inserirPerguntasEmLotes(banco, ID_FONTE_WIKI, gruposWiki);

  await banco.runAsync(
    `
      INSERT INTO quiz_meta (chave, valor_integer)
      VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET valor_integer = excluded.valor_integer
    `,
    [CHAVE_SEED_BUNDLE, QUIZ_SEED_VERSION]
  );

  return { reseed: true, versao: QUIZ_SEED_VERSION };
}
