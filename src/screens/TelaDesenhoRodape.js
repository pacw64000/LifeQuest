import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import Svg, { Polyline } from "react-native-svg";
import * as FileSystem from "expo-file-system/legacy";
import { useTemaVisual } from "../context/TemaVisualContext";
import TextoApp from "../components/TextoApp";
import BotaoPrimario from "../components/BotaoPrimario";
import { copiarImagemRodapeParaDocumentos } from "../services/aparencia/copiarImagemRodapeLocal";

const CORES_TRACO = ["#26D0CE", "#F4C15A", "#E8EDF5", "#E85D4C", "#6C5CE7", "#FFFFFF", "#1A1A2E"];

function polilinhaParaPontos(pontos) {
  return pontos.map((p) => `${p.x},${p.y}`).join(" ");
}

export default function TelaDesenhoRodape({ navigation }) {
  const { paleta, tokens, salvarPreferencias, insetsChrome } = useTemaVisual();
  const largura = Math.min(Dimensions.get("window").width - 32, 400);
  const altura = Math.max(72, Math.round((largura * 5) / 16));

  const canvasRef = useRef(null);
  const [tracos, setTracos] = useState([]);
  const [tracoAtual, setTracoAtual] = useState([]);
  const [corTraco, setCorTraco] = useState(paleta.destaque);
  const [salvando, setSalvando] = useState(false);

  function finalizarTraco() {
    setTracoAtual((atual) => {
      if (atual.length >= 2) {
        setTracos((lista) => [...lista, { cor: corTraco, pontos: atual }]);
      }
      return [];
    });
  }

  function limpar() {
    setTracos([]);
    setTracoAtual([]);
  }

  async function salvarDesenho() {
    let listaFinal = tracos;
    if (tracoAtual.length >= 2) {
      listaFinal = [...tracos, { cor: corTraco, pontos: tracoAtual }];
      setTracos(listaFinal);
      setTracoAtual([]);
    }

    if (listaFinal.length === 0) {
      Alert.alert("Desenho vazio", "Faca pelo menos um traço antes de salvar.");
      return;
    }

    if (!FileSystem.documentDirectory) {
      Alert.alert("Indisponivel", "Salvar imagem local nao funciona nesta plataforma.");
      return;
    }

    setSalvando(true);
    try {
      await new Promise((r) => setTimeout(r, 150));
      const tmpUri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      const uriPersistente = await copiarImagemRodapeParaDocumentos(tmpUri);
      await salvarPreferencias({ modoRodape: "imagem", uriImagemRodape: uriPersistente });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erro", "Nao foi possivel salvar o desenho no rodape.");
    } finally {
      setSalvando(false);
    }
  }

  const padTop = insetsChrome.paddingTopConteudo;
  const padBottom = insetsChrome.paddingBottomConteudo + tokens.espacamento.lg;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: padTop,
        paddingBottom: padBottom,
        paddingHorizontal: tokens.espacamento.md,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>Desenhar rodape</TextoApp>
      <TextoApp style={[styles.sub, { color: paleta.textoSecundario }]}>
        O mesmo arquivo funciona nos estilos Cosmico e Pixel. Você pode trocar depois pela galeria ou redesenhar.
      </TextoApp>

      <View
        ref={canvasRef}
        collapsable={false}
        style={[
          styles.canvasWrap,
          {
            width: largura,
            height: altura,
            backgroundColor: paleta.fundoProfundo,
            borderColor: paleta.bordaSuave,
            borderRadius: tokens.raio.cartao,
          },
        ]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          setTracoAtual([{ x: locationX, y: locationY }]);
        }}
        onResponderMove={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          setTracoAtual((prev) => [...prev, { x: locationX, y: locationY }]);
        }}
        onResponderRelease={finalizarTraco}
        onResponderTerminate={finalizarTraco}
      >
        <Svg width={largura} height={altura}>
          {tracos.map((t, i) => (
            <Polyline
              key={i}
              points={polilinhaParaPontos(t.pontos)}
              fill="none"
              stroke={t.cor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {tracoAtual.length > 1 ? (
            <Polyline
              points={polilinhaParaPontos(tracoAtual)}
              fill="none"
              stroke={corTraco}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>

      <TextoApp style={[styles.labelCor, { color: paleta.textoSecundario }]}>Cor do traço</TextoApp>
      <View style={styles.linhaCores}>
        {CORES_TRACO.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.swatch,
              { backgroundColor: c },
              corTraco === c && { borderWidth: 3, borderColor: paleta.destaqueSecundario },
            ]}
            onPress={() => setCorTraco(c)}
          />
        ))}
      </View>

      <View style={styles.linhaBotoes}>
        <TouchableOpacity
          style={[styles.btnSec, { borderColor: paleta.bordaSuave }]}
          onPress={() => navigation.goBack()}
          disabled={salvando}
        >
          <TextoApp style={{ color: paleta.textoPrincipal }}>Cancelar</TextoApp>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSec, { borderColor: paleta.bordaSuave }]}
          onPress={limpar}
          disabled={salvando}
        >
          <TextoApp style={{ color: paleta.textoPrincipal }}>Limpar</TextoApp>
        </TouchableOpacity>
      </View>

      {salvando ? (
        <ActivityIndicator style={{ marginTop: 12 }} color={paleta.destaque} />
      ) : (
        <BotaoPrimario tituloBotao="Usar desenho no rodape" onPress={salvarDesenho} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  titulo: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sub: { marginBottom: 16, lineHeight: 22 },
  canvasWrap: {
    alignSelf: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  labelCor: { marginTop: 16, marginBottom: 8, fontSize: 13 },
  linhaCores: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "transparent" },
  linhaBotoes: { flexDirection: "row", gap: 12, marginBottom: 12 },
  btnSec: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
});
