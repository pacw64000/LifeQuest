import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import TextoApp from "../../components/TextoApp";
import {
  PERGUNTAS_POR_RODADA,
  TEMPO_MAX_PERGUNTA_MS,
} from "../../services/quiz/constantesQuiz";
import { calcularPontosRespostaCorreta } from "../../services/quiz/pontuacaoKahoot";
import {
  garantirQuizInicializado,
  listarCategorias,
  listarRankingPorCategoria,
  obterMelhorPosicaoUsuario,
  salvarResultadoRodada,
  sortearPerguntasPorCategoria,
} from "../../services/quiz/repositorioQuiz";

const TOP_RANKING = 10;

function formatarSegundos(ms) {
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function TelaJogoQuiz() {
  const { usuarioAutenticado } = useAuth();
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();

  const [fase, setFase] = useState("carregando");
  const [mensagemErro, setMensagemErro] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [textoRankingTitulo, setTextoRankingTitulo] = useState("");

  const [perguntasRodada, setPerguntasRodada] = useState([]);
  const [indicePergunta, setIndicePergunta] = useState(0);
  const [pontuacaoRodada, setPontuacaoRodada] = useState(0);
  const [acertosRodada, setAcertosRodada] = useState(0);
  const [tempoTotalCorretosMs, setTempoTotalCorretosMs] = useState(0);
  const [decoridoMs, setDecoridoMs] = useState(0);

  const [linhasRanking, setLinhasRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [resumoFim, setResumoFim] = useState(null);

  const pontuacaoRef = useRef(0);
  const acertosRef = useRef(0);
  const tempoCorretosRef = useRef(0);

  const inicioPerguntaRef = useRef(0);
  const respondidoRef = useRef(false);
  const intervalRef = useRef(null);

  const idUsuario = usuarioAutenticado?.idUsuario || "anon";
  const nomeExibicao = usuarioAutenticado?.nomeUsuario || "Jogador";

  const perguntaAtual = perguntasRodada[indicePergunta] ?? null;

  const progressoTempo = useMemo(() => {
    if (!perguntaAtual) return 0;
    const p = 1 - Math.min(decoridoMs, TEMPO_MAX_PERGUNTA_MS) / TEMPO_MAX_PERGUNTA_MS;
    return Math.max(0, Math.min(1, p));
  }, [decoridoMs, perguntaAtual]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        setMensagemErro(null);
        await garantirQuizInicializado();
        const lista = await listarCategorias();
        if (cancelado) return;
        setCategorias(lista);
        setFase("categorias");
      } catch (erro) {
        if (cancelado) return;
        setMensagemErro(String(erro?.message || erro));
        setFase("erro");
      }
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, []);

  const processarRespostaRef = useRef(async () => {});

  const finalizarPersistencia = useCallback(
    async (acertosFinais, pontosFinais, tempoFinais, cat, totalPerguntas) => {
      setFase("salvando");
      try {
        await salvarResultadoRodada({
          idUsuario,
          nomeExibicao,
          idCategoria: cat.id,
          acertos: acertosFinais,
          totalPerguntas,
          tempoTotalMs: tempoFinais,
          pontuacao: pontosFinais,
        });
        const xpRecebido = registrarResultadoMiniGame("quiz", pontosFinais);
        const top = await listarRankingPorCategoria(cat.id, TOP_RANKING);
        const pos = await obterMelhorPosicaoUsuario(cat.id, idUsuario);
        setLinhasRanking(top);
        setPosicaoUsuario(pos);
        setResumoFim({
          acertos: acertosFinais,
          total: totalPerguntas,
          tempoTotalMs: tempoFinais,
          pontuacao: pontosFinais,
          xpRecebido,
        });
        setFase("resultado");
      } catch (erro) {
        setMensagemErro(String(erro?.message || erro));
        setFase("erro");
      }
    },
    [idUsuario, nomeExibicao, registrarResultadoMiniGame]
  );

  const processarResposta = useCallback(async (indiceOpcao) => {
      if (!perguntaAtual || !categoriaSelecionada) return;
      const tempoMs = Math.min(Date.now() - inicioPerguntaRef.current, TEMPO_MAX_PERGUNTA_MS);
      const acertou = indiceOpcao !== null && indiceOpcao === perguntaAtual.indiceCorreto;

      let novoPontos = pontuacaoRef.current;
      let novoAcertos = acertosRef.current;
      let novoTempo = tempoCorretosRef.current;

      if (acertou) {
        novoPontos = pontuacaoRef.current + calcularPontosRespostaCorreta(tempoMs);
        novoAcertos = acertosRef.current + 1;
        novoTempo = tempoCorretosRef.current + tempoMs;
      }

      pontuacaoRef.current = novoPontos;
      acertosRef.current = novoAcertos;
      tempoCorretosRef.current = novoTempo;
      setPontuacaoRodada(novoPontos);
      setAcertosRodada(novoAcertos);
      setTempoTotalCorretosMs(novoTempo);

      const ultimoIndice = perguntasRodada.length - 1;
      if (indicePergunta >= ultimoIndice) {
        await finalizarPersistencia(novoAcertos, novoPontos, novoTempo, categoriaSelecionada, perguntasRodada.length);
        return;
      }
      setIndicePergunta((i) => i + 1);
    },
    [
      perguntaAtual,
      categoriaSelecionada,
      indicePergunta,
      perguntasRodada.length,
      finalizarPersistencia,
    ]
  );

  processarRespostaRef.current = processarResposta;

  useEffect(() => {
    if (fase !== "jogando" || !perguntaAtual) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }
    respondidoRef.current = false;
    inicioPerguntaRef.current = Date.now();
    setDecoridoMs(0);
    intervalRef.current = setInterval(() => {
      const decorrido = Date.now() - inicioPerguntaRef.current;
      setDecoridoMs(decorrido);
      if (decorrido >= TEMPO_MAX_PERGUNTA_MS && !respondidoRef.current) {
        respondidoRef.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        processarRespostaRef.current(null);
      }
    }, 80);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fase, indicePergunta, perguntaAtual?.id]);

  async function iniciarCategoria(cat) {
    setMensagemErro(null);
    setCategoriaSelecionada(cat);
    const limite = Math.min(PERGUNTAS_POR_RODADA, Math.max(1, cat.contagem || 0));
    if (limite <= 0) {
      setMensagemErro("Esta categoria ainda nao tem perguntas.");
      return;
    }
    try {
      const sorteadas = await sortearPerguntasPorCategoria(cat.id, limite);
      if (sorteadas.length === 0) {
        setMensagemErro("Nao foi possivel carregar perguntas.");
        return;
      }
      setPerguntasRodada(sorteadas);
      setIndicePergunta(0);
      pontuacaoRef.current = 0;
      acertosRef.current = 0;
      tempoCorretosRef.current = 0;
      setPontuacaoRodada(0);
      setAcertosRodada(0);
      setTempoTotalCorretosMs(0);
      setFase("jogando");
    } catch (erro) {
      setMensagemErro(String(erro?.message || erro));
    }
  }

  async function abrirRankingCategoria(cat) {
    setCategoriaSelecionada(cat);
    setTextoRankingTitulo(cat.nomeExibicao);
    setFase("carregandoRanking");
    try {
      const top = await listarRankingPorCategoria(cat.id, TOP_RANKING);
      const pos = await obterMelhorPosicaoUsuario(cat.id, idUsuario);
      setLinhasRanking(top);
      setPosicaoUsuario(pos);
      setFase("ranking");
    } catch (erro) {
      setMensagemErro(String(erro?.message || erro));
      setFase("categorias");
    }
  }

  function tocarOpcao(indiceOpcao) {
    if (respondidoRef.current) return;
    respondidoRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    processarResposta(indiceOpcao);
  }

  function voltarCategorias() {
    setCategoriaSelecionada(null);
    setPerguntasRodada([]);
    setResumoFim(null);
    setLinhasRanking([]);
    setPosicaoUsuario(null);
    setMensagemErro(null);
    setFase("categorias");
  }

  const paddingVertical = {
    paddingTop: insetsChrome.paddingTopConteudo + 8,
    paddingBottom: insetsChrome.paddingBottomConteudo + 8,
  };

  if (fase === "carregando" || fase === "carregandoRanking" || fase === "salvando") {
    return (
      <View style={[styles.container, paddingVertical, { backgroundColor: paleta.fundoPrimario }]}>
        <ActivityIndicator size="large" color={paleta.destaque} />
        <TextoApp style={[styles.centralTexto, { color: paleta.textoSecundario, marginTop: 12 }]}>
          {fase === "salvando"
            ? "Salvando resultado..."
            : fase === "carregandoRanking"
              ? "Carregando ranking..."
              : "Carregando quiz..."}
        </TextoApp>
      </View>
    );
  }

  if (fase === "erro") {
    return (
      <View style={[styles.container, paddingVertical, { backgroundColor: paleta.fundoPrimario }]}>
        <TextoApp style={[styles.pergunta, { color: paleta.textoPrincipal }]}>Algo deu errado</TextoApp>
        <TextoApp style={{ color: paleta.textoSecundario }}>{mensagemErro}</TextoApp>
        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: paleta.destaque, marginTop: 16 }]}
          onPress={voltarCategorias}
        >
          <TextoApp style={[styles.textoBotaoPrimario, { color: "#0A1628" }]}>Voltar</TextoApp>
        </TouchableOpacity>
      </View>
    );
  }

  if (fase === "ranking") {
    return (
      <View style={[styles.container, paddingVertical, { backgroundColor: paleta.fundoPrimario }]}>
        <TextoApp style={[styles.tituloSecao, { color: paleta.textoPrincipal }]}>Ranking</TextoApp>
        <TextoApp style={[styles.subTitulo, { color: paleta.textoSecundario }]}>{textoRankingTitulo}</TextoApp>
        {posicaoUsuario != null && (
          <TextoApp style={[styles.suaPosicao, { color: paleta.destaque }]}>
            Sua melhor posicao: {posicaoUsuario}º
          </TextoApp>
        )}
        <FlatList
          data={linhasRanking}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1, marginTop: 12 }}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.linhaRanking,
                { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
              ]}
            >
              <TextoApp style={[styles.rankNum, { color: paleta.destaque }]}>{index + 1}º</TextoApp>
              <View style={{ flex: 1 }}>
                <TextoApp style={[styles.rankNome, { color: paleta.textoPrincipal }]}>{item.nomeExibicao}</TextoApp>
                <TextoApp style={[styles.rankMeta, { color: paleta.textoSecundario }]}>
                  {item.acertos}/{item.totalPerguntas} acertos · {formatarSegundos(item.tempoTotalMs)} · {item.pontuacao}{" "}
                  pts
                </TextoApp>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <TextoApp style={{ color: paleta.textoSecundario }}>Nenhuma partida registrada ainda.</TextoApp>
          }
        />
        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: paleta.destaque, marginTop: 12 }]}
          onPress={voltarCategorias}
        >
          <TextoApp style={[styles.textoBotaoPrimario, { color: "#0A1628" }]}>Voltar as categorias</TextoApp>
        </TouchableOpacity>
      </View>
    );
  }

  if (fase === "resultado" && resumoFim) {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
        contentContainerStyle={[paddingVertical, styles.scrollPad]}
      >
        <TextoApp style={[styles.tituloSecao, { color: paleta.textoPrincipal }]}>Partida concluida</TextoApp>
        <TextoApp style={[styles.resumoLinha, { color: paleta.textoPrincipal }]}>
          Pontuacao: {resumoFim.pontuacao} pts
        </TextoApp>
        <TextoApp style={[styles.resumoLinha, { color: paleta.textoSecundario }]}>
          Acertos: {resumoFim.acertos}/{resumoFim.total}
        </TextoApp>
        <TextoApp style={[styles.resumoLinha, { color: paleta.textoSecundario }]}>
          Tempo (acertos): {formatarSegundos(resumoFim.tempoTotalMs)}
        </TextoApp>
        <TextoApp style={[styles.resumoLinha, { color: paleta.destaque }]}>XP ganho: {resumoFim.xpRecebido}</TextoApp>

        {posicaoUsuario != null && (
          <TextoApp style={[styles.suaPosicao, { color: paleta.textoPrincipal, marginTop: 8 }]}>
            Sua posicao no ranking: {posicaoUsuario}º
          </TextoApp>
        )}

        <TextoApp style={[styles.tituloSecao, { color: paleta.textoPrincipal, marginTop: 20 }]}>Top {TOP_RANKING}</TextoApp>
        {linhasRanking.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.linhaRanking,
              { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            ]}
          >
            <TextoApp style={[styles.rankNum, { color: paleta.destaque }]}>{index + 1}º</TextoApp>
            <View style={{ flex: 1 }}>
              <TextoApp style={[styles.rankNome, { color: paleta.textoPrincipal }]}>{item.nomeExibicao}</TextoApp>
              <TextoApp style={[styles.rankMeta, { color: paleta.textoSecundario }]}>
                {item.acertos}/{item.totalPerguntas} · {formatarSegundos(item.tempoTotalMs)} · {item.pontuacao} pts
              </TextoApp>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.botaoPrimario, { backgroundColor: paleta.destaque, marginTop: 16 }]}
          onPress={voltarCategorias}
        >
          <TextoApp style={[styles.textoBotaoPrimario, { color: "#0A1628" }]}>Jogar de novo</TextoApp>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (fase === "jogando" && perguntaAtual) {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
        contentContainerStyle={[paddingVertical, styles.scrollPad]}
      >
        <View style={styles.linhaTopoJogo}>
          <TextoApp style={[styles.metaJogo, { color: paleta.textoSecundario }]}>
            {indicePergunta + 1}/{perguntasRodada.length}
          </TextoApp>
          <TextoApp style={[styles.metaJogo, { color: paleta.destaque }]}>{pontuacaoRodada} pts</TextoApp>
        </View>
        <View style={[styles.barraTempoFundo, { backgroundColor: paleta.bordaSuave }]}>
          <View
            style={[
              styles.barraTempoPreench,
              {
                width: `${progressoTempo * 100}%`,
                backgroundColor: progressoTempo < 0.25 ? "#E53935" : paleta.destaque,
              },
            ]}
          />
        </View>
        <TextoApp style={[styles.timerTexto, { color: paleta.textoSecundario }]}>
          {formatarSegundos(Math.max(0, TEMPO_MAX_PERGUNTA_MS - decoridoMs))} restantes
        </TextoApp>

        <TextoApp style={[styles.pergunta, { color: paleta.textoPrincipal }]}>{perguntaAtual.textoPergunta}</TextoApp>
        {perguntaAtual.opcoesResposta.map((texto, indice) => (
          <TouchableOpacity
            key={`${perguntaAtual.id}-${indice}`}
            style={[
              styles.botaoResposta,
              { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            ]}
            onPress={() => tocarOpcao(indice)}
            activeOpacity={0.75}
          >
            <TextoApp style={[styles.textoResposta, { color: paleta.textoPrincipal }]}>{texto}</TextoApp>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, paddingVertical, { backgroundColor: paleta.fundoPrimario }]}>
      <TextoApp style={[styles.tituloSecao, { color: paleta.textoPrincipal }]}>Escolha uma categoria</TextoApp>
      {mensagemErro ? (
        <TextoApp style={{ color: "#E53935", marginBottom: 8 }}>{mensagemErro}</TextoApp>
      ) : null}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: tokens?.espacamento?.md ?? 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cartaoCategoria,
              { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            ]}
          >
            <TouchableOpacity style={styles.areaPrincipalCat} onPress={() => iniciarCategoria(item)} activeOpacity={0.75}>
              <TextoApp style={[styles.nomeCategoria, { color: paleta.textoPrincipal }]}>{item.nomeExibicao}</TextoApp>
              <TextoApp style={[styles.metaCategoria, { color: paleta.textoSecundario }]}>
                {item.rotuloFonte} · {item.contagem} perguntas
              </TextoApp>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirRankingCategoria(item)} style={styles.botaoRankingInline}>
              <TextoApp style={{ color: paleta.destaque, fontWeight: "700" }}>Ranking</TextoApp>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <TextoApp style={{ color: paleta.textoSecundario }}>Nenhuma categoria disponivel.</TextoApp>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  scroll: { flex: 1 },
  scrollPad: { paddingHorizontal: 16 },
  centralTexto: { textAlign: "center" },
  tituloSecao: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  subTitulo: { fontSize: 15, marginBottom: 4 },
  pergunta: { fontSize: 18, fontWeight: "700", marginBottom: 16, lineHeight: 26 },
  botaoResposta: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10 },
  textoResposta: { fontWeight: "600", fontSize: 15 },
  linhaTopoJogo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaJogo: { fontSize: 14, fontWeight: "700" },
  barraTempoFundo: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  barraTempoPreench: {
    height: 8,
    borderRadius: 4,
  },
  timerTexto: { fontSize: 13, marginBottom: 14 },
  cartaoCategoria: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  areaPrincipalCat: { padding: 14 },
  nomeCategoria: { fontSize: 16, fontWeight: "700" },
  metaCategoria: { fontSize: 13, marginTop: 4 },
  botaoRankingInline: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.35)",
    alignItems: "center",
  },
  linhaRanking: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  rankNum: { fontSize: 18, fontWeight: "800", width: 40 },
  rankNome: { fontSize: 15, fontWeight: "700" },
  rankMeta: { fontSize: 12, marginTop: 2 },
  resumoLinha: { fontSize: 16, marginBottom: 4 },
  suaPosicao: { fontSize: 15, fontWeight: "700" },
  botaoPrimario: { borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  textoBotaoPrimario: { fontWeight: "800", fontSize: 16 },
});
