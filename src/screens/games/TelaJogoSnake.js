import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../../context/DadosAppContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

const tamanhoGrade = 10;
const direcoes = {
  cima: { x: 0, y: -1 },
  baixo: { x: 0, y: 1 },
  esquerda: { x: -1, y: 0 },
  direita: { x: 1, y: 0 },
};

function coordenadaAleatoria() {
  return { x: Math.floor(Math.random() * tamanhoGrade), y: Math.floor(Math.random() * tamanhoGrade) };
}

export default function TelaJogoSnake() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const [cobraPosicoes, setCobraPosicoes] = useState([{ x: 4, y: 4 }]);
  const [direcaoAtual, setDirecaoAtual] = useState(direcoes.direita);
  const [comidaAtual, setComidaAtual] = useState(coordenadaAleatoria());
  const [pontuacaoSnake, setPontuacaoSnake] = useState(0);
  const [jogoAtivo, setJogoAtivo] = useState(true);

  useEffect(() => {
    if (!jogoAtivo) return undefined;
    const intervaloJogo = setInterval(() => {
      setCobraPosicoes((posicoesAtuais) => {
        const novaCabeca = {
          x: posicoesAtuais[0].x + direcaoAtual.x,
          y: posicoesAtuais[0].y + direcaoAtual.y,
        };

        const bateuParede = novaCabeca.x < 0 || novaCabeca.y < 0 || novaCabeca.x >= tamanhoGrade || novaCabeca.y >= tamanhoGrade;
        const bateuNaCobra = posicoesAtuais.some((posicao) => posicao.x === novaCabeca.x && posicao.y === novaCabeca.y);
        if (bateuParede || bateuNaCobra) {
          const xpRecebido = registrarResultadoMiniGame("snake", pontuacaoSnake * 5);
          Alert.alert("Game Over", `Pontuacao: ${pontuacaoSnake} | XP: ${xpRecebido}`);
          setJogoAtivo(false);
          return posicoesAtuais;
        }

        const comeuComida = novaCabeca.x === comidaAtual.x && novaCabeca.y === comidaAtual.y;
        const novaCobra = [novaCabeca, ...posicoesAtuais];
        if (!comeuComida) {
          novaCobra.pop();
        } else {
          setPontuacaoSnake((valorAnterior) => valorAnterior + 1);
          setComidaAtual(coordenadaAleatoria());
        }
        return novaCobra;
      });
    }, 300);

    return () => clearInterval(intervaloJogo);
  }, [direcaoAtual, comidaAtual, jogoAtivo, pontuacaoSnake, registrarResultadoMiniGame]);

  function reiniciarSnake() {
    setCobraPosicoes([{ x: 4, y: 4 }]);
    setDirecaoAtual(direcoes.direita);
    setComidaAtual(coordenadaAleatoria());
    setPontuacaoSnake(0);
    setJogoAtivo(true);
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
      <Text style={[styles.pontuacao, { color: paleta.textoPrincipal }]}>Pontuacao: {pontuacaoSnake}</Text>
      <View style={[styles.grade, { borderColor: paleta.bordaSuave }]}>
        {Array.from({ length: tamanhoGrade * tamanhoGrade }).map((_, indiceCelula) => {
          const x = indiceCelula % tamanhoGrade;
          const y = Math.floor(indiceCelula / tamanhoGrade);
          const celulaCobra = cobraPosicoes.some((posicao) => posicao.x === x && posicao.y === y);
          const celulaComida = comidaAtual.x === x && comidaAtual.y === y;
          return (
            <View
              key={indiceCelula}
              style={[
                styles.celula,
                celulaCobra && { backgroundColor: paleta.destaque },
                celulaComida && { backgroundColor: paleta.alerta },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.controles}>
        <TouchableOpacity
          style={[styles.botaoControle, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
          onPress={() => setDirecaoAtual(direcoes.cima)}
        >
          <Text>↑</Text>
        </TouchableOpacity>
        <View style={styles.linhaControles}>
          <TouchableOpacity
            style={[styles.botaoControle, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
            onPress={() => setDirecaoAtual(direcoes.esquerda)}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoControle, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
            onPress={() => setDirecaoAtual(direcoes.direita)}
          >
            <Text>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.botaoControle, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
          onPress={() => setDirecaoAtual(direcoes.baixo)}
        >
          <Text>↓</Text>
        </TouchableOpacity>
      </View>
      {!jogoAtivo && (
        <TouchableOpacity style={[styles.botaoReiniciar, { backgroundColor: paleta.textoPrincipal }]} onPress={reiniciarSnake}>
          <Text style={styles.textoReiniciar}>Jogar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  pontuacao: { fontWeight: "700", marginBottom: 10 },
  grade: { width: 280, height: 280, flexDirection: "row", flexWrap: "wrap", backgroundColor: "#FFF", borderWidth: 1 },
  celula: { width: "10%", height: "10%", borderWidth: 0.5, borderColor: "#F0F0F0" },
  controles: { marginTop: 16, alignItems: "center" },
  linhaControles: { flexDirection: "row", gap: 20 },
  botaoControle: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, marginVertical: 4 },
  botaoReiniciar: { marginTop: 12, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  textoReiniciar: { color: "#FFF", fontWeight: "700" },
});
