import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

/* ──────────────────────────────────────────
   Banco de palavras (5 letras, sem acento)
────────────────────────────────────────── */
const PALAVRAS = [
  "GATOS", "CASAS", "LIVRO", "PAPEL", "CAMPO", "BEIRA", "SORTE",
  "VERDE", "PEDRA", "NOITE", "PRAIA", "CLIMA", "MUNDO", "BRAVO",
  "SABOR", "FESTA", "BANCO", "FUNDO", "MARCA", "PONTO", "SONHO",
  "PLANO", "LARGO", "CARRO", "PORTA", "COISA", "AINDA", "OUTRO",
  "TEMPO", "FORMA", "PARTE", "LUGAR", "LINHA", "CORPO", "GRUPO",
  "FORÇA", "CONTA", "LETRA", "NORTE", "PRATO", "FRUTA", "SALTO",
  "TIGRE", "CIRCO", "BARCO", "VIDRO", "PALCO", "TUMOR", "COBRE",
  "NOBRE", "LADRA", "CALMA", "VENTO", "FOLHA", "MACIO", "DENTE",
];

const TECLADO = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

const MAX_TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;

/* ──────────────────────────────────────────
   Lógica de verificação (two-pass Wordle)
────────────────────────────────────────── */
function verificarTentativa(tentativa, secreta) {
  const resultado = Array(TAMANHO_PALAVRA).fill("cinza");
  const letrasLivres = secreta.split("");

  // Passo 1: acertos exatos → verde
  tentativa.split("").forEach((letra, i) => {
    if (letra === secreta[i]) {
      resultado[i] = "verde";
      letrasLivres[i] = null;
    }
  });

  // Passo 2: presentes em posição errada → amarelo
  tentativa.split("").forEach((letra, i) => {
    if (resultado[i] === "verde") return;
    const idx = letrasLivres.indexOf(letra);
    if (idx !== -1) {
      resultado[i] = "amarelo";
      letrasLivres[idx] = null;
    }
  });

  return resultado;
}

function corCelula(status, paleta) {
  if (status === "verde")  return "#2EBF6C";
  if (status === "amarelo") return "#C9A227";
  if (status === "cinza")  return paleta.fundoProfundo || "#0A1020";
  return paleta.fundoCartao;
}

function corTecla(letra, statusLetras, paleta) {
  const s = statusLetras[letra];
  if (s === "verde")  return "#2EBF6C";
  if (s === "amarelo") return "#C9A227";
  if (s === "cinza")  return paleta.fundoProfundo || "#0A1020";
  return paleta.fundoCartao;
}

function sortearPalavra() {
  return PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
}

/* ──────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function TelaJogoTermo() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const [palavraSecreta, setPalavraSecreta] = useState(() => sortearPalavra());
  const [tentativas, setTentativas]         = useState([]);   // string[]
  const [resultados, setResultados]         = useState([]);   // string[][]
  const [tentativaAtual, setTentativaAtual] = useState("");
  const [statusLetras, setStatusLetras]     = useState({});   // { L: "verde"|"amarelo"|"cinza" }
  const [concluido, setConcluido]           = useState(false);
  const [erro, setErro]                     = useState("");   // mensagem de erro inline

  /* ── reiniciar ── */
  function reiniciar() {
    setPalavraSecreta(sortearPalavra());
    setTentativas([]);
    setResultados([]);
    setTentativaAtual("");
    setStatusLetras({});
    setConcluido(false);
    setErro("");
  }

  /* ── tecla pressionada ── */
  const handleTecla = useCallback(
    (tecla) => {
      if (concluido) return;
      setErro("");

      if (tecla === "⌫") {
        setTentativaAtual((prev) => prev.slice(0, -1));
        return;
      }

      if (tecla === "ENTER") {
        if (tentativaAtual.length < TAMANHO_PALAVRA) {
          setErro(`Complete as ${TAMANHO_PALAVRA} letras primeiro.`);
          return;
        }

        const resultado   = verificarTentativa(tentativaAtual, palavraSecreta);
        const novasT      = [...tentativas, tentativaAtual];
        const novosR      = [...resultados, resultado];

        setTentativas(novasT);
        setResultados(novosR);
        setTentativaAtual("");

        // Atualizar mapa de status das letras (verde > amarelo > cinza)
        setStatusLetras((prev) => {
          const prox = { ...prev };
          tentativaAtual.split("").forEach((letra, i) => {
            const atual = prox[letra];
            const novo  = resultado[i];
            if (atual === "verde") return;
            if (atual === "amarelo" && novo === "cinza") return;
            prox[letra] = novo;
          });
          return prox;
        });

        const venceu = resultado.every((s) => s === "verde");

        if (venceu) {
          setConcluido(true);
          const xp = (MAX_TENTATIVAS - novasT.length + 1) * 20;
          setTimeout(() => {
            const xpRecebido = registrarResultadoMiniGame("termo", xp);
            Alert.alert(
              "Parabéns! 🎉",
              `Você acertou em ${novasT.length} tentativa(s)!\nXP ganho: ${xpRecebido}`,
              [{ text: "Jogar novamente", onPress: reiniciar }]
            );
          }, 350);
        } else if (novasT.length >= MAX_TENTATIVAS) {
          setConcluido(true);
          setTimeout(() => {
            const xpRecebido = registrarResultadoMiniGame("termo", 5);
            Alert.alert(
              "Fim de jogo",
              `A palavra era: ${palavraSecreta}\nXP ganho: ${xpRecebido}`,
              [{ text: "Jogar novamente", onPress: reiniciar }]
            );
          }, 350);
        }

        return;
      }

      // Letra comum
      if (tentativaAtual.length < TAMANHO_PALAVRA) {
        setTentativaAtual((prev) => prev + tecla);
      }
    },
    [concluido, tentativaAtual, tentativas, resultados, palavraSecreta]
  );

  /* ── render da grade ── */
  function renderGrade() {
    return Array.from({ length: MAX_TENTATIVAS }).map((_, iLinha) => {
      const tentativa = tentativas[iLinha] ?? "";
      const resultado = resultados[iLinha]  ?? [];
      const isAtual   = iLinha === tentativas.length && !concluido;
      const texto     = isAtual ? tentativaAtual : tentativa;

      return (
        <View key={iLinha} style={styles.linhaGrade}>
          {Array.from({ length: TAMANHO_PALAVRA }).map((_, iCol) => {
            const letra  = texto[iCol] ?? "";
            const status = resultado[iCol] ?? null;

            const bg     = status ? corCelula(status, paleta) : paleta.fundoCartao;
            const borda  =
              status        ? bg
              : isAtual && letra ? paleta.destaque
              : paleta.bordaSuave;
            const corLetra = status ? "#FFFFFF" : paleta.textoPrincipal;

            return (
              <View
                key={iCol}
                style={[styles.celula, { backgroundColor: bg, borderColor: borda }]}
              >
                <Text style={[styles.letraCelula, { color: corLetra }]}>{letra}</Text>
              </View>
            );
          })}
        </View>
      );
    });
  }

  /* ── render do teclado virtual ── */
  function renderTeclado() {
    return TECLADO.map((fila, iRow) => (
      <View key={iRow} style={styles.filaTeclado}>
        {fila.map((tecla) => {
          const bg        = corTecla(tecla, statusLetras, paleta);
          const corTexto  =
            statusLetras[tecla] ? "#FFFFFF" : paleta.textoPrincipal;
          const larga     = tecla.length > 1;

          return (
            <TouchableOpacity
              key={tecla}
              style={[
                styles.tecla,
                larga && styles.teclaLarga,
                { backgroundColor: bg, borderColor: paleta.bordaSuave },
              ]}
              onPress={() => handleTecla(tecla)}
              disabled={concluido}
              activeOpacity={0.7}
            >
              <Text style={[styles.textoTecla, { color: corTexto }]}>{tecla}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + 8,
        paddingBottom: insetsChrome.paddingBottomConteudo + 8,
        alignItems: "center",
        paddingHorizontal: 8,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Tentativas restantes */}
      <Text style={[styles.subtituloTentativas, { color: paleta.textoSecundario }]}>
        {tentativas.length}/{MAX_TENTATIVAS} tentativas
      </Text>

      {/* Mensagem de erro */}
      {erro ? (
        <Text style={[styles.mensagemErro, { color: paleta.alerta }]}>{erro}</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      {/* Grade */}
      <View style={styles.grade}>{renderGrade()}</View>

      {/* Legenda */}
      <View style={styles.legendaRow}>
        {[
          { cor: "#2EBF6C",  label: "Posição certa" },
          { cor: "#C9A227",  label: "Letra presente" },
          { cor: paleta.fundoProfundo || "#0A1020", label: "Ausente" },
        ].map(({ cor, label }) => (
          <View key={label} style={styles.legendaItem}>
            <View style={[styles.legendaQuadrado, { backgroundColor: cor }]} />
            <Text style={[styles.legendaTexto, { color: paleta.textoSecundario }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Teclado */}
      <View style={styles.teclado}>{renderTeclado()}</View>

      {/* Botão reiniciar (sempre disponível) */}
      <TouchableOpacity
        style={[styles.botaoReiniciar, { borderColor: paleta.bordaSuave }]}
        onPress={reiniciar}
        activeOpacity={0.75}
      >
        <Text style={[styles.textoReiniciar, { color: paleta.textoSecundario }]}>
          Nova palavra
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  subtituloTentativas: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  mensagemErro: { fontSize: 13, fontWeight: "600", height: 20 },
  grade: { marginBottom: 14 },
  linhaGrade: { flexDirection: "row", marginBottom: 6 },
  celula: {
    width: 52,
    height: 52,
    margin: 3,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  letraCelula: { fontSize: 22, fontWeight: "800" },
  legendaRow: { flexDirection: "row", gap: 14, marginBottom: 18 },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendaQuadrado: { width: 14, height: 14, borderRadius: 3 },
  legendaTexto: { fontSize: 11 },
  teclado: { width: "100%", paddingHorizontal: 2, marginBottom: 14 },
  filaTeclado: { flexDirection: "row", justifyContent: "center", marginBottom: 7 },
  tecla: {
    minWidth: 30,
    height: 46,
    marginHorizontal: 3,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  teclaLarga: { minWidth: 52 },
  textoTecla: { fontSize: 13, fontWeight: "700" },
  botaoReiniciar: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  textoReiniciar: { fontSize: 14, fontWeight: "600" },
});
