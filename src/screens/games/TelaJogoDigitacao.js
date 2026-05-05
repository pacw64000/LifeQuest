import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

const BANCO_PALAVRAS = {
  1: ["gato", "casa", "livro", "mesa", "chuva", "bolo", "sino", "mapa", "flor", "fogo", "lago", "vela", "pato", "bico", "loja"],
  2: ["abacaxi", "janela", "teclado", "girafa", "planeta", "caderno", "mercado", "estrela", "palmeira", "foguete", "borracha"],
  3: ["helicoptero", "programacao", "biblioteca", "fotografia", "computador", "elefante", "crocodilo", "ambulancia"],
};

function sortearPalavra(nivel) {
  const lista = BANCO_PALAVRAS[nivel] || BANCO_PALAVRAS[1];
  return lista[Math.floor(Math.random() * lista.length)];
}

function calcularTempoPorNivel(nivel) {
  if (nivel === 1) return 5;
  if (nivel === 2) return 4;
  return 3;
}

const VIDAS_INICIAIS = 3;

export default function TelaJogoDigitacao() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const [fase, setFase] = useState("idle"); // idle | jogando | feedback | fim
  const [palavraAtual, setPalavraAtual] = useState("");
  const [inputUsuario, setInputUsuario] = useState("");
  const [segundosRestantes, setSegundosRestantes] = useState(5);
  const [combo, setCombo] = useState(0);
  const [vidasRestantes, setVidasRestantes] = useState(VIDAS_INICIAIS);
  const [pontuacao, setPontuacao] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [acertosSeguidosRef] = useState({ atual: 0 });
  const [feedbackAcerto, setFeedbackAcerto] = useState(null); // true | false | null

  const inputRef = useRef(null);
  const intervaloRef = useRef(null);
  // Refs para valores acessíveis dentro de callbacks sem dependências
  const vidasRef = useRef(VIDAS_INICIAIS);
  const pontuacaoRef = useRef(0);
  const comboRef = useRef(0);
  const nivelRef = useRef(1);
  const faseRef = useRef("idle");

  function limparIntervalo() {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }

  function iniciarRodada(nivelAtual) {
    limparIntervalo();
    const palavra = sortearPalavra(nivelAtual);
    const tempo = calcularTempoPorNivel(nivelAtual);
    setPalavraAtual(palavra);
    setInputUsuario("");
    setFeedbackAcerto(null);
    setSegundosRestantes(tempo);
    faseRef.current = "jogando";
    setFase("jogando");
    setTimeout(() => inputRef.current?.focus(), 120);
  }

  function iniciarJogo() {
    vidasRef.current = VIDAS_INICIAIS;
    pontuacaoRef.current = 0;
    comboRef.current = 0;
    nivelRef.current = 1;
    acertosSeguidosRef.atual = 0;
    setVidasRestantes(VIDAS_INICIAIS);
    setPontuacao(0);
    setCombo(0);
    setNivel(1);
    iniciarRodada(1);
  }

  // Cronômetro
  useEffect(() => {
    if (fase !== "jogando") return;

    intervaloRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervaloRef.current);
          intervaloRef.current = null;
          processarResposta(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return limparIntervalo;
  }, [fase, palavraAtual]);

  const processarResposta = useCallback(
    (acertou) => {
      if (faseRef.current !== "jogando") return;
      faseRef.current = "feedback";
      limparIntervalo();
      setFeedbackAcerto(acertou);

      if (acertou) {
        comboRef.current += 1;
        acertosSeguidosRef.atual += 1;
        const multiplicador = 1 + comboRef.current / 5;
        const xpGanho = Math.floor(10 * multiplicador * nivelRef.current);
        pontuacaoRef.current += xpGanho;
        setPontuacao(pontuacaoRef.current);
        setCombo(comboRef.current);

        // Subir de nível a cada 3 acertos seguidos
        if (acertosSeguidosRef.atual % 3 === 0) {
          nivelRef.current = Math.min(3, nivelRef.current + 1);
          setNivel(nivelRef.current);
        }

        setTimeout(() => iniciarRodada(nivelRef.current), 750);
      } else {
        comboRef.current = 0;
        acertosSeguidosRef.atual = 0;
        setCombo(0);
        vidasRef.current -= 1;
        setVidasRestantes(vidasRef.current);

        if (vidasRef.current <= 0) {
          faseRef.current = "fim";
          setFase("fim");
          setTimeout(() => encerrarJogo(), 750);
        } else {
          setTimeout(() => iniciarRodada(nivelRef.current), 750);
        }
      }
    },
    []
  );

  function encerrarJogo() {
    const xpRecebido = registrarResultadoMiniGame("digitacao", pontuacaoRef.current);
    Alert.alert(
      "Fim de jogo!",
      `Pontuação: ${pontuacaoRef.current}\nXP ganho: ${xpRecebido}`,
      [{ text: "OK", onPress: () => { faseRef.current = "idle"; setFase("idle"); } }]
    );
  }

  function confirmarResposta() {
    if (fase !== "jogando") return;
    const acertou = inputUsuario.toLowerCase().trim() === palavraAtual.toLowerCase();
    processarResposta(acertou);
  }

  // Cor dinâmica do anel do cronômetro
  const corFeedback =
    feedbackAcerto === true
      ? paleta.sucesso
      : feedbackAcerto === false
      ? paleta.alerta
      : segundosRestantes <= 2
      ? paleta.alerta
      : paleta.destaque;

  const corBordaPalavra =
    feedbackAcerto === true
      ? paleta.sucesso
      : feedbackAcerto === false
      ? paleta.alerta
      : paleta.bordaSuave;

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
      {fase === "idle" ? (
        /* ── Tela inicial ── */
        <View style={styles.centro}>
          <Text style={[styles.tituloPrincipal, { color: paleta.textoPrincipal }]}>
            Digitação Rápida
          </Text>
          <Text style={[styles.instrucao, { color: paleta.textoSecundario }]}>
            Uma palavra aparece na tela. Digite-a corretamente antes do tempo acabar.
          </Text>
          <Text style={[styles.instrucao, { color: paleta.textoSecundario }]}>
            Combo multiplica o XP • 3 erros encerram o jogo
          </Text>
          <View style={styles.regrasRow}>
            {["Nível 1 → 5s", "Nível 2 → 4s", "Nível 3 → 3s"].map((r) => (
              <View key={r} style={[styles.pillRegra, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
                <Text style={[styles.pillTexto, { color: paleta.textoSecundario }]}>{r}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.botaoIniciar, { backgroundColor: paleta.destaque }]}
            onPress={iniciarJogo}
          >
            <Text style={[styles.textoBotao, { color: "#0A1628" }]}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Jogo ativo ── */
        <View style={styles.jogo}>
          {/* HUD */}
          <View style={styles.hud}>
            <View style={styles.hudItem}>
              <Text style={[styles.hudLabel, { color: paleta.textoSecundario }]}>Vidas</Text>
              <Text style={[styles.hudValor, { color: paleta.alerta }]}>
                {"♥ ".repeat(vidasRestantes).trim() || "—"}
              </Text>
            </View>
            <View style={styles.hudItem}>
              <Text style={[styles.hudLabel, { color: paleta.textoSecundario }]}>Combo</Text>
              <Text style={[styles.hudValor, { color: paleta.destaqueSecundario }]}>×{combo}</Text>
            </View>
            <View style={styles.hudItem}>
              <Text style={[styles.hudLabel, { color: paleta.textoSecundario }]}>Pontos</Text>
              <Text style={[styles.hudValor, { color: paleta.textoPrincipal }]}>{pontuacao}</Text>
            </View>
            <View style={styles.hudItem}>
              <Text style={[styles.hudLabel, { color: paleta.textoSecundario }]}>Nível</Text>
              <Text style={[styles.hudValor, { color: paleta.destaque }]}>{nivel}</Text>
            </View>
          </View>

          {/* Cronômetro circular */}
          <View style={[styles.cronometroAro, { borderColor: corFeedback }]}>
            <Text style={[styles.cronometroNum, { color: corFeedback }]}>{segundosRestantes}</Text>
          </View>

          {/* Carta da palavra */}
          <View style={[styles.cartaPalavra, { backgroundColor: paleta.fundoCartao, borderColor: corBordaPalavra }]}>
            <Text style={[styles.palavra, { color: paleta.textoPrincipal }]}>{palavraAtual}</Text>
          </View>

          {/* Feedback textual */}
          <View style={styles.areaFeedback}>
            {feedbackAcerto === true && (
              <Text style={[styles.feedbackTexto, { color: paleta.sucesso }]}>✓ Correto!</Text>
            )}
            {feedbackAcerto === false && (
              <Text style={[styles.feedbackTexto, { color: paleta.alerta }]}>✗ Errou!</Text>
            )}
          </View>

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                borderColor: paleta.bordaSuave,
                backgroundColor: paleta.fundoCartao,
                color: paleta.textoPrincipal,
              },
            ]}
            value={inputUsuario}
            onChangeText={setInputUsuario}
            onSubmitEditing={confirmarResposta}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Digite aqui..."
            placeholderTextColor={paleta.textoSecundario}
            editable={fase === "jogando"}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[
              styles.botaoConfirmar,
              { backgroundColor: paleta.destaque, opacity: fase === "jogando" ? 1 : 0.4 },
            ]}
            onPress={confirmarResposta}
            disabled={fase !== "jogando"}
          >
            <Text style={[styles.textoBotao, { color: "#0A1628" }]}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  jogo: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 8 },
  tituloPrincipal: { fontSize: 30, fontWeight: "900", marginBottom: 16, textAlign: "center" },
  instrucao: { fontSize: 14, textAlign: "center", marginBottom: 8, lineHeight: 20 },
  regrasRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 12, marginBottom: 24 },
  pillRegra: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  pillTexto: { fontSize: 12, fontWeight: "600" },
  botaoIniciar: { borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14 },
  textoBotao: { fontWeight: "800", fontSize: 16 },
  hud: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 22 },
  hudItem: { alignItems: "center", minWidth: 60 },
  hudLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  hudValor: { fontSize: 18, fontWeight: "800", marginTop: 3 },
  cronometroAro: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cronometroNum: { fontSize: 30, fontWeight: "900" },
  cartaPalavra: {
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 32,
    paddingVertical: 22,
    marginBottom: 10,
    alignItems: "center",
  },
  palavra: { fontSize: 34, fontWeight: "800", letterSpacing: 5 },
  areaFeedback: { height: 28, justifyContent: "center", marginBottom: 10 },
  feedbackTexto: { fontSize: 17, fontWeight: "700" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  botaoConfirmar: { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12 },
});
