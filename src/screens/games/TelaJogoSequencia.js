import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

/* ──────────────────────────────────────────
   Configuração das cores do jogo
────────────────────────────────────────── */
const CORES = [
  { id: "vermelho", hex: "#E85D4C", hexAtivo: "#FF8070" },
  { id: "verde",    hex: "#1A9E72", hexAtivo: "#2EE6A8" },
  { id: "azul",     hex: "#1A5FA5", hexAtivo: "#4FA8F5" },
  { id: "amarelo",  hex: "#B87A10", hexAtivo: "#F4C15A" },
];

const LAYOUT_GRADE = [
  [CORES[0], CORES[1]],
  [CORES[2], CORES[3]],
];

/* ──────────────────────────────────────────
   Helpers
────────────────────────────────────────── */
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calcularVelocidade(comprimento) {
  if (comprimento <= 3) return { ativo: 800, pausa: 250 };
  if (comprimento <= 6) return { ativo: 550, pausa: 180 };
  if (comprimento <= 9) return { ativo: 380, pausa: 130 };
  return { ativo: 260, pausa: 100 };
}

function sortearCor() {
  return CORES[Math.floor(Math.random() * CORES.length)].id;
}

/* ──────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function TelaJogoSequencia() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  // ── estado do jogo
  const [fase, setFase] = useState("idle"); // idle | exibir | entrada | fim
  const [corAtiva, setCorAtiva] = useState(null);
  const [rodadasVencidas, setRodadasVencidas] = useState(0);
  const [mensagem, setMensagem] = useState("Pressione iniciar para jogar");
  const [indiceInput, setIndiceInput] = useState(0);

  // ── refs (evitam stale closure em callbacks assíncronos)
  const sequenciaRef     = useRef([]);
  const indiceInputRef   = useRef(0);
  const faseRef          = useRef("idle");
  const rodadasRef       = useRef(0);
  const canceladoRef     = useRef(false); // flag de cleanup

  /* ── exibir a sequência animada ── */
  async function exibirSequencia(seq) {
    faseRef.current = "exibir";
    setFase("exibir");
    setMensagem("Observe a sequência...");
    setIndiceInput(0);
    indiceInputRef.current = 0;

    const vel = calcularVelocidade(seq.length);

    for (const cor of seq) {
      if (canceladoRef.current) return;
      setCorAtiva(cor);
      await esperar(vel.ativo);
      if (canceladoRef.current) return;
      setCorAtiva(null);
      await esperar(vel.pausa);
    }

    if (canceladoRef.current) return;
    faseRef.current = "entrada";
    setFase("entrada");
    setMensagem("Sua vez! Repita a sequência.");
  }

  /* ── iniciar / reiniciar jogo ── */
  async function iniciarJogo() {
    canceladoRef.current = false;
    rodadasRef.current = 0;
    setRodadasVencidas(0);
    setCorAtiva(null);

    const primeiraSeq = [sortearCor()];
    sequenciaRef.current = primeiraSeq;

    await exibirSequencia(primeiraSeq);
  }

  /* ── parar tudo (usado no reinício pelo Alert) ── */
  function pararJogo() {
    canceladoRef.current = true;
    faseRef.current = "idle";
    setFase("idle");
    setCorAtiva(null);
    setMensagem("Pressione iniciar para jogar");
  }

  /* ── toque do usuário em um botão de cor ── */
  const tocarCor = useCallback(
    async (idCor) => {
      if (faseRef.current !== "entrada") return;

      // Feedback visual rápido no botão tocado
      setCorAtiva(idCor);
      await esperar(180);
      if (canceladoRef.current) return;
      setCorAtiva(null);

      const sequencia = sequenciaRef.current;
      const idx       = indiceInputRef.current;

      // ── ERROU ──
      if (idCor !== sequencia[idx]) {
        faseRef.current = "fim";
        setFase("fim");
        setMensagem(`Errou! A cor era: ${sequencia[idx]}`);
        const xpRecebido = registrarResultadoMiniGame("sequencia", rodadasRef.current * 15);
        setTimeout(() => {
          Alert.alert(
            "Fim de jogo!",
            `Rodadas completas: ${rodadasRef.current}\nXP ganho: ${xpRecebido}`,
            [{ text: "Jogar novamente", onPress: pararJogo }]
          );
        }, 300);
        return;
      }

      const proximoIndice = idx + 1;

      // ── COMPLETOU A SEQUÊNCIA ──
      if (proximoIndice === sequencia.length) {
        rodadasRef.current += 1;
        setRodadasVencidas(rodadasRef.current);
        setMensagem("✓ Correto! Prepare-se...");
        faseRef.current = "exibir";

        await esperar(700);
        if (canceladoRef.current) return;

        const novaSeq = [...sequencia, sortearCor()];
        sequenciaRef.current = novaSeq;
        await exibirSequencia(novaSeq);
        return;
      }

      // ── ACERTO PARCIAL — aguardar próximo toque ──
      indiceInputRef.current = proximoIndice;
      setIndiceInput(proximoIndice);
    },
    [] // sem deps: lê tudo via refs
  );

  /* ── render ── */
  const sequenciaAtual = sequenciaRef.current;

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
      {/* ── Status ── */}
      <View style={styles.statusArea}>
        <Text style={[styles.mensagem, { color: paleta.textoPrincipal }]}>{mensagem}</Text>

        <View style={styles.infoRow}>
          <View style={[styles.pillInfo, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
            <Text style={[styles.pillLabel, { color: paleta.textoSecundario }]}>Rodadas</Text>
            <Text style={[styles.pillValor, { color: paleta.destaqueSecundario }]}>{rodadasVencidas}</Text>
          </View>
          <View style={[styles.pillInfo, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
            <Text style={[styles.pillLabel, { color: paleta.textoSecundario }]}>Sequência</Text>
            <Text style={[styles.pillValor, { color: paleta.destaque }]}>{sequenciaAtual.length}</Text>
          </View>
        </View>

        {/* Progresso da entrada atual */}
        {fase === "entrada" && sequenciaAtual.length > 0 && (
          <View style={styles.progressoRow}>
            {sequenciaAtual.map((_, i) => {
              const bg =
                i < indiceInput
                  ? paleta.sucesso
                  : i === indiceInput
                  ? paleta.destaque
                  : paleta.bordaSuave;
              return (
                <View key={i} style={[styles.bolinha, { backgroundColor: bg }]} />
              );
            })}
          </View>
        )}
      </View>

      {/* ── Grade 2×2 de botões ── */}
      <View style={[styles.grade, fase === "exibir" && styles.gradeExibindo]}>
        {LAYOUT_GRADE.map((linha, iLinha) => (
          <View key={iLinha} style={styles.linhaBotoes}>
            {linha.map((cor) => {
              const ativa    = corAtiva === cor.id;
              const hexFinal = ativa ? cor.hexAtivo : cor.hex;
              const desabilitado = fase !== "entrada";

              return (
                <TouchableOpacity
                  key={cor.id}
                  style={[
                    styles.botaoCor,
                    { backgroundColor: hexFinal, opacity: desabilitado && !ativa ? 0.38 : 1 },
                    ativa && styles.botaoAtivo,
                  ]}
                  onPress={() => tocarCor(cor.id)}
                  disabled={desabilitado}
                  activeOpacity={0.8}
                >
                  {/* reflexo no topo quando ativo */}
                  {ativa && <View style={styles.reflexo} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Botão iniciar / reiniciar ── */}
      {(fase === "idle" || fase === "fim") && (
        <TouchableOpacity
          style={[styles.botaoIniciar, { backgroundColor: paleta.destaque }]}
          onPress={iniciarJogo}
          activeOpacity={0.85}
        >
          <Text style={[styles.textoBotaoIniciar, { color: "#0A1628" }]}>
            {rodadasVencidas === 0 ? "Iniciar jogo" : "Jogar novamente"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Instrução durante exibição */}
      {fase === "exibir" && (
        <Text style={[styles.dicaInferior, { color: paleta.textoSecundario }]}>
          Memorize a ordem das cores...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 20 },
  statusArea: { width: "100%", alignItems: "center", marginBottom: 28 },
  mensagem: { fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 14 },
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  pillInfo: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 100,
  },
  pillLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  pillValor: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  progressoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 4,
  },
  bolinha: { width: 12, height: 12, borderRadius: 6 },
  grade: { gap: 14 },
  gradeExibindo: { opacity: 0.9 },
  linhaBotoes: { flexDirection: "row", gap: 14 },
  botaoCor: {
    width: 144,
    height: 144,
    borderRadius: 20,
    overflow: "hidden",
  },
  botaoAtivo: {
    transform: [{ scale: 1.06 }],
  },
  reflexo: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 10,
  },
  botaoIniciar: {
    marginTop: 32,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  textoBotaoIniciar: { fontSize: 17, fontWeight: "800" },
  dicaInferior: { marginTop: 28, fontSize: 14, fontStyle: "italic" },
});
