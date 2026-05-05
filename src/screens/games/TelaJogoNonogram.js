import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import TextoApp from "../../components/TextoApp";

const gabaritoNonogram = [
  [1, 0, 0, 0, 1],
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1],
];

const dicasLinha = ["1 1", "1 1", "1", "1 1", "1 1"];
const dicasColuna = ["1 1", "1 1", "1", "1 1", "1 1"];

export default function TelaJogoNonogram() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const gradeInicial = useMemo(() => Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0)), []);
  const [gradeJogador, setGradeJogador] = useState(gradeInicial);

  function alternarCelula(indiceLinha, indiceColuna) {
    setGradeJogador((estadoAnterior) =>
      estadoAnterior.map((linhaAtual, idxLinhaAtual) =>
        idxLinhaAtual !== indiceLinha
          ? linhaAtual
          : linhaAtual.map((valorCelula, idxColunaAtual) => (idxColunaAtual === indiceColuna ? (valorCelula ? 0 : 1) : valorCelula))
      )
    );
  }

  function validarSolucao() {
    const acertouTudo = gradeJogador.every((linhaAtual, indiceLinha) =>
      linhaAtual.every((valorCelula, indiceColuna) => valorCelula === gabaritoNonogram[indiceLinha][indiceColuna])
    );

    if (acertouTudo) {
      const xpRecebido = registrarResultadoMiniGame("nonogram", 60);
      Alert.alert("Parabens", `Voce resolveu o nonogram. XP: ${xpRecebido}`);
      return;
    }

    Alert.alert("Ainda nao", "Continue tentando.");
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
      <TextoApp style={[styles.dicaTopo, { color: paleta.textoSecundario }]}>Dicas colunas: {dicasColuna.join(" | ")}</TextoApp>
      {gradeJogador.map((linhaAtual, indiceLinha) => (
        <View key={`linha-${indiceLinha}`} style={styles.linha}>
          <TextoApp style={[styles.dicaLinha, { color: paleta.textoSecundario }]}>{dicasLinha[indiceLinha]}</TextoApp>
          {linhaAtual.map((valorCelula, indiceColuna) => (
            <TouchableOpacity
              key={`coluna-${indiceColuna}`}
              style={[
                styles.celula,
                { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
                valorCelula === 1 && { backgroundColor: paleta.destaque },
              ]}
              onPress={() => alternarCelula(indiceLinha, indiceColuna)}
            />
          ))}
        </View>
      ))}
      <TouchableOpacity style={[styles.botaoValidar, { backgroundColor: paleta.textoPrincipal }]} onPress={validarSolucao}>
        <TextoApp style={styles.textoValidar}>Validar puzzle</TextoApp>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  dicaTopo: { marginBottom: 12 },
  linha: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dicaLinha: { width: 36, fontSize: 12 },
  celula: { width: 34, height: 34, borderWidth: 1 },
  botaoValidar: { marginTop: 16, alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  textoValidar: { color: "#FFF", fontWeight: "700" },
});
