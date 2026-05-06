import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { nonogramConfig } from "../../config/nonogramConfig";
import { useAuth } from "../../context/AuthContext";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import { salvarPlacarPublicoSeMelhor } from "../../services/firebase/repositorioNonogramPublico";
import {
  obterNonogramPuzzlePorId,
  salvarMelhorResultadoSeForRecorde,
} from "../../services/local/repositorioNonogram";
import { gerarDicasCompletas, formatarDicasParaExibicao } from "../../utils/nonogram/gerarDicas";
import {
  calcularPontuacaoFinalPartida,
  calcularXpMiniGameAPartirDaPontuacao,
  contarErrosGrade,
} from "../../utils/nonogram/pontuacaoNonogram";

function criarGradeVazia(altura, largura) {
  return Array.from({ length: altura }, () => Array.from({ length: largura }, () => 0));
}

export default function TelaJogoNonogram() {
  const route = useRoute();
  const navigation = useNavigation();
  const { idPuzzle, tituloPuzzle } = route.params || {};
  const { usuarioAutenticado } = useAuth();
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const [puzzle, setPuzzle] = useState(null);
  const [gradeJogador, setGradeJogador] = useState(null);
  const [dicasLinhas, setDicasLinhas] = useState([]);
  const [dicasColunas, setDicasColunas] = useState([]);
  const [decorrerMs, setDecorrerMs] = useState(0);
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const inicioRef = useRef(null);
  const tickRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!idPuzzle) {
      Alert.alert("Puzzle", "ID ausente.");
      navigation.goBack();
      return;
    }
    const p = await obterNonogramPuzzlePorId(idPuzzle);
    if (!p?.grade) {
      Alert.alert("Puzzle", "Nao encontrado.");
      navigation.goBack();
      return;
    }
    setPuzzle(p);
    const { dicasLinhas: dl, dicasColunas: dc } = gerarDicasCompletas(p.grade);
    setDicasLinhas(dl);
    setDicasColunas(dc);
    setGradeJogador(criarGradeVazia(p.altura, p.largura));
  }, [idPuzzle, navigation]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const tituloCabecalho = tituloPuzzle || puzzle?.titulo || "Nonogram";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tituloCabecalho,
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingHorizontal: 12 }}
          onPress={() =>
            navigation.navigate(rotas.nonogramLeaderboard, {
              idPuzzle,
              idFirestore: puzzle?.idFirestore,
              tituloPuzzle: tituloCabecalho,
            })
          }
        >
          <TextoApp style={{ color: paleta.destaque, fontWeight: "700" }}>Placar</TextoApp>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tituloCabecalho, idPuzzle, puzzle?.idFirestore, paleta.destaque]);

  useEffect(() => {
    if (!jogoIniciado) return undefined;
    tickRef.current = setInterval(() => {
      if (inicioRef.current) {
        setDecorrerMs(Date.now() - inicioRef.current);
      }
    }, 200);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [jogoIniciado]);

  function iniciarSeNecessario() {
    if (!jogoIniciado) {
      inicioRef.current = Date.now();
      setJogoIniciado(true);
      setDecorrerMs(0);
    }
  }

  function alternarCelula(il, ic) {
    iniciarSeNecessario();
    setGradeJogador((prev) =>
      prev.map((linha, i) =>
        i !== il
          ? linha
          : linha.map((v, j) => (j !== ic ? v : v ? 0 : 1))
      )
    );
  }

  async function concluirPuzzle() {
    if (!puzzle?.grade || !gradeJogador) return;
    iniciarSeNecessario();
    const decorridoMsFinal = inicioRef.current ? Date.now() - inicioRef.current : decorrerMs;
    const tempoSeg = decorridoMsFinal / 1000;
    const erros = contarErrosGrade(puzzle.grade, gradeJogador);
    const pontuacaoFinal = calcularPontuacaoFinalPartida(puzzle.pontuacaoBase, tempoSeg, erros);
    const xp = calcularXpMiniGameAPartirDaPontuacao(pontuacaoFinal);
    const xpGanho = registrarResultadoMiniGame("nonogram", xp);

    const uid = usuarioAutenticado?.idUsuario || "guest-local";
    const nome =
      usuarioAutenticado?.nomeUsuario ||
      (usuarioAutenticado?.isGuest ? "Convidado" : "Jogador");

    await salvarMelhorResultadoSeForRecorde(idPuzzle, uid, {
      tempoMs: Math.round(decorridoMsFinal),
      erros,
      pontuacao: pontuacaoFinal,
      nomeExibicao: nome,
    });

    if (puzzle.idFirestore && usuarioAutenticado?.idUsuario && !usuarioAutenticado?.isGuest) {
      try {
        await salvarPlacarPublicoSeMelhor(puzzle.idFirestore, usuarioAutenticado.idUsuario, {
          tempoMs: Math.round(decorridoMsFinal),
          erros,
          pontuacao: pontuacaoFinal,
          nomeExibicao: nome,
        });
      } catch {
        /* nuvem opcional */
      }
    }

    Alert.alert(
      "Resultado",
      `Tempo: ${tempoSeg.toFixed(1)}s · Erros: ${erros}\nPontuacao: ${pontuacaoFinal} · XP: ${xpGanho}`,
      [
        {
          text: "Ver placar",
          onPress: () =>
            navigation.navigate(rotas.nonogramLeaderboard, {
              idPuzzle,
              idFirestore: puzzle.idFirestore,
              tituloPuzzle: tituloCabecalho,
            }),
        },
        { text: "OK" },
      ]
    );
  }

  const larguraTela = Dimensions.get("window").width - 32;
  const { tamanhoMaximoCelula, tamanhoMinimoCelula } = nonogramConfig.ui;

  const tamanhoCelula = useMemo(() => {
    if (!puzzle) return tamanhoMaximoCelula;
    const n = Math.max(puzzle.largura, puzzle.altura);
    const bruto = Math.floor((larguraTela - 56) / n);
    return Math.min(tamanhoMaximoCelula, Math.max(tamanhoMinimoCelula, bruto));
  }, [puzzle, larguraTela, tamanhoMaximoCelula, tamanhoMinimoCelula]);

  if (!puzzle || !gradeJogador) {
    return (
      <View style={[styles.container, { backgroundColor: paleta.fundoPrimario }]}>
        <TextoApp style={{ color: paleta.textoSecundario }}>Carregando...</TextoApp>
      </View>
    );
  }

  const textoColunas = formatarDicasParaExibicao(dicasColunas);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: paleta.fundoPrimario,
          paddingTop: insetsChrome.paddingTopConteudo + 8,
          paddingBottom: insetsChrome.paddingBottomConteudo + 8,
        },
      ]}
    >
      <TextoApp style={[styles.timer, { color: paleta.textoPrincipal }]}>
        {(decorrerMs / 1000).toFixed(1)} s
      </TextoApp>
      <TextoApp style={[styles.dicaTopo, { color: paleta.textoSecundario }]} numberOfLines={2}>
        Colunas: {textoColunas}
      </TextoApp>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {gradeJogador.map((linhaAtual, il) => (
            <View key={`linha-${il}`} style={styles.linha}>
              <TextoApp style={[styles.dicaLinha, { color: paleta.textoSecundario, width: 52 }]}>
                {dicasLinhas[il]?.join(" ") ?? ""}
              </TextoApp>
              {linhaAtual.map((valorCelula, ic) => (
                <TouchableOpacity
                  key={`c-${il}-${ic}`}
                  style={[
                    styles.celula,
                    {
                      width: tamanhoCelula,
                      height: tamanhoCelula,
                      borderColor: paleta.bordaSuave,
                      backgroundColor: paleta.fundoCartao,
                    },
                    valorCelula === 1 && { backgroundColor: paleta.destaque },
                  ]}
                  onPress={() => alternarCelula(il, ic)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <TouchableOpacity
        style={[styles.botaoValidar, { backgroundColor: paleta.textoPrincipal }]}
        onPress={concluirPuzzle}
      >
        <TextoApp style={styles.textoValidar}>Concluir puzzle</TextoApp>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  timer: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  dicaTopo: { marginBottom: 12, fontSize: 11 },
  linha: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  dicaLinha: { fontSize: 10, marginRight: 4 },
  celula: { borderWidth: 1, margin: 0 },
  botaoValidar: { marginTop: 16, alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  textoValidar: { color: "#FFF", fontWeight: "700" },
});
