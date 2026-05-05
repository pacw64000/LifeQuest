import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import TextoApp from "../../components/TextoApp";

const perguntasQuiz = [
  {
    idPergunta: "q1",
    textoPergunta: "Qual habito ajuda mais a manter produtividade?",
    opcoesResposta: ["Adiar tudo", "Planejar o dia", "Dormir tarde"],
    indiceCorreto: 1,
  },
  {
    idPergunta: "q2",
    textoPergunta: "Completar tarefas diariamente melhora o que?",
    opcoesResposta: ["Streak", "Conexao wifi", "Bateria"],
    indiceCorreto: 0,
  },
  {
    idPergunta: "q3",
    textoPergunta: "A tecnica Pomodoro usa blocos de:",
    opcoesResposta: ["25 min", "2 horas", "90 min"],
    indiceCorreto: 0,
  },
];

export default function TelaJogoQuiz() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const [indicePerguntaAtual, setIndicePerguntaAtual] = useState(0);
  const [quantidadeAcertos, setQuantidadeAcertos] = useState(0);

  const perguntaAtual = useMemo(() => perguntasQuiz[indicePerguntaAtual], [indicePerguntaAtual]);

  function responder(indiceOpcao) {
    const acertouResposta = indiceOpcao === perguntaAtual.indiceCorreto;
    const novoTotalAcertos = acertouResposta ? quantidadeAcertos + 1 : quantidadeAcertos;
    setQuantidadeAcertos(novoTotalAcertos);

    if (indicePerguntaAtual >= perguntasQuiz.length - 1) {
      const xpRecebido = registrarResultadoMiniGame("quiz", novoTotalAcertos * 15);
      Alert.alert("Quiz concluido", `Acertos: ${novoTotalAcertos} | XP: ${xpRecebido}`);
      setIndicePerguntaAtual(0);
      setQuantidadeAcertos(0);
      return;
    }

    setIndicePerguntaAtual((valorAnterior) => valorAnterior + 1);
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
      <TextoApp style={[styles.pergunta, { color: paleta.textoPrincipal }]}>{perguntaAtual.textoPergunta}</TextoApp>
      {perguntaAtual.opcoesResposta.map((respostaAtual, indiceResposta) => (
        <TouchableOpacity
          key={respostaAtual}
          style={[styles.botaoResposta, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
          onPress={() => responder(indiceResposta)}
        >
          <TextoApp style={[styles.textoResposta, { color: paleta.textoPrincipal }]}>{respostaAtual}</TextoApp>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  pergunta: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  botaoResposta: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10 },
  textoResposta: { fontWeight: "600" },
});
