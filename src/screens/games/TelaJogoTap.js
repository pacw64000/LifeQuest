import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

export default function TelaJogoTap() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const [segundosRestantes, setSegundosRestantes] = useState(10);
  const [pontuacaoTap, setPontuacaoTap] = useState(0);
  const [jogoIniciado, setJogoIniciado] = useState(false);

  useEffect(() => {
    if (!jogoIniciado || segundosRestantes <= 0) return undefined;
    const intervaloTempo = setInterval(() => setSegundosRestantes((valorAnterior) => valorAnterior - 1), 1000);
    return () => clearInterval(intervaloTempo);
  }, [jogoIniciado, segundosRestantes]);

  useEffect(() => {
    if (jogoIniciado && segundosRestantes === 0) {
      const xpRecebido = registrarResultadoMiniGame("tap", pontuacaoTap);
      Alert.alert("Tempo encerrado", `Pontos: ${pontuacaoTap} | XP ganho: ${xpRecebido}`);
      setJogoIniciado(false);
    }
  }, [jogoIniciado, segundosRestantes, pontuacaoTap, registrarResultadoMiniGame]);

  function iniciarRodada() {
    setPontuacaoTap(0);
    setSegundosRestantes(10);
    setJogoIniciado(true);
  }

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
      <Text style={[styles.info, { color: paleta.textoPrincipal }]}>Tempo: {segundosRestantes}s</Text>
      <Text style={[styles.info, { color: paleta.textoPrincipal }]}>Toques: {pontuacaoTap}</Text>
      <TouchableOpacity
        style={[styles.areaTap, { backgroundColor: paleta.destaque }]}
        disabled={!jogoIniciado}
        onPress={() => setPontuacaoTap((valorAnterior) => valorAnterior + 1)}
      >
        <Text style={styles.textoTap}>TAP</Text>
      </TouchableOpacity>
      <BotaoPrimario tituloBotao={jogoIniciado ? "Jogando..." : "Iniciar rodada"} onPress={iniciarRodada} desabilitado={jogoIniciado} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  info: { fontSize: 18, marginBottom: 8 },
  areaTap: { width: 200, height: 200, borderRadius: 100, justifyContent: "center", alignItems: "center", marginVertical: 20 },
  textoTap: { color: "#FFF", fontWeight: "800", fontSize: 32 },
});
