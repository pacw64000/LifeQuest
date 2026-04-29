import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

function embaralharArray(listaOriginal) {
  return [...listaOriginal].sort(() => Math.random() - 0.5);
}

const simbolosMemoria = ["A", "B", "C", "D"];

export default function TelaJogoMemoria() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const baralhoInicial = useMemo(
    () =>
      embaralharArray(
        [...simbolosMemoria, ...simbolosMemoria].map((simboloCarta, indiceCarta) => ({
          idCarta: `${indiceCarta}-${simboloCarta}`,
          simboloCarta,
        }))
      ),
    []
  );
  const [baralhoAtual, setBaralhoAtual] = useState(baralhoInicial);
  const [idsRevelados, setIdsRevelados] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState([]);

  function reiniciar() {
    setBaralhoAtual(embaralharArray(baralhoInicial));
    setIdsRevelados([]);
    setParesEncontrados([]);
  }

  function virarCarta(cartaSelecionada) {
    if (idsRevelados.includes(cartaSelecionada.idCarta) || paresEncontrados.includes(cartaSelecionada.simboloCarta)) return;
    if (idsRevelados.length >= 2) return;

    const novosRevelados = [...idsRevelados, cartaSelecionada.idCarta];
    setIdsRevelados(novosRevelados);

    if (novosRevelados.length === 2) {
      const cartas = baralhoAtual.filter((cartaAtual) => novosRevelados.includes(cartaAtual.idCarta));
      const encontrouPar = cartas[0]?.simboloCarta === cartas[1]?.simboloCarta;
      if (encontrouPar) {
        const novosPares = [...paresEncontrados, cartas[0].simboloCarta];
        setParesEncontrados(novosPares);
        setIdsRevelados([]);
        if (novosPares.length === simbolosMemoria.length) {
          const xpRecebido = registrarResultadoMiniGame("memoria", 40);
          Alert.alert("Vitoria", `Todos os pares encontrados! XP: ${xpRecebido}`);
        }
      } else {
        setTimeout(() => setIdsRevelados([]), 700);
      }
    }
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
      <View style={styles.grade}>
        {baralhoAtual.map((cartaAtual) => {
          const cartaRevelada = idsRevelados.includes(cartaAtual.idCarta) || paresEncontrados.includes(cartaAtual.simboloCarta);
          return (
            <TouchableOpacity
              key={cartaAtual.idCarta}
              style={[styles.carta, { backgroundColor: paleta.destaque }]}
              onPress={() => virarCarta(cartaAtual)}
            >
              <Text style={styles.simbolo}>{cartaRevelada ? cartaAtual.simboloCarta : "?"}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={[styles.botaoReiniciar, { backgroundColor: paleta.textoPrincipal }]} onPress={reiniciar}>
        <Text style={styles.textoReiniciar}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  grade: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  carta: { width: "23%", aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  simbolo: { color: "#FFF", fontSize: 24, fontWeight: "700" },
  botaoReiniciar: { marginTop: 20, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  textoReiniciar: { color: "#FFF", fontWeight: "700" },
});
