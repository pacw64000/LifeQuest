import React, { Component, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View, ImageBackground } from "react-native";
import BotaoPrimario from "../components/BotaoPrimario";
import coresTema from "../constants/cores";
import { useDadosApp } from "../context/DadosAppContext";
import { agendarLembreteMissao } from "../services/notificacoes/servicoNotificacoes";

function Untitled(props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.rect}
        imageStyle={styles.rect_imageStyle}
        source={require("../assets/images/Gradient_JV33GZG.png")}
      ></ImageBackground>
      <ImageBackground
        style={styles.rect2}
        imageStyle={styles.rect2_imageStyle}
        source={require("../assets/images/Gradient_H0Vzu6n.png")}
      ></ImageBackground>
    </View>
  );
}

export default function TelaCriarMissao({ navigation }) {
  const { criarMissao } = useDadosApp();
  const [tituloMissao, setTituloMissao] = useState("");
  const [descricaoMissao, setDescricaoMissao] = useState("");
  const [dificuldadeMissao, setDificuldadeMissao] = useState("facil");
  const [segundosLembreteTexto, setSegundosLembreteTexto] = useState("0");

  async function acaoSalvarMissao() {
    if (!tituloMissao.trim()) {
      Alert.alert("Missao invalida", "Informe um titulo.");
      return;
    }

    const segundosLembrete = Number(segundosLembreteTexto || "0");
    const novaMissao = criarMissao({
      tituloMissao: tituloMissao.trim(),
      descricaoMissao: descricaoMissao.trim(),
      dificuldadeMissao,
      segundosLembrete,
    });

    if (segundosLembrete > 0) {
      await agendarLembreteMissao({
        idMissao: novaMissao.idMissao,
        tituloMissao: novaMissao.tituloMissao,
        segundosParaLembrar: segundosLembrete,
      });
    }

    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Titulo da missao" value={tituloMissao} onChangeText={setTituloMissao} />
      <TextInput
        style={[styles.input, styles.inputMultiLinha]}
        placeholder="Descricao"
        value={descricaoMissao}
        onChangeText={setDescricaoMissao}
        multiline
      />
      <Text style={styles.label}>Dificuldade</Text>
      <View style={styles.linhaDificuldade}>
        {["facil", "media", "dificil"].map((opcaoDificuldade) => (
          <BotaoPrimario
            key={opcaoDificuldade}
            tituloBotao={opcaoDificuldade}
            onPress={() => setDificuldadeMissao(opcaoDificuldade)}
            desabilitado={dificuldadeMissao === opcaoDificuldade}
          />
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Lembrete em segundos (0 desativa)"
        value={segundosLembreteTexto}
        onChangeText={setSegundosLembreteTexto}
        keyboardType="numeric"
      />
      <BotaoPrimario tituloBotao="Salvar missao" onPress={acaoSalvarMissao} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, padding: 16 },
  input: { backgroundColor: "#FFF", borderRadius: 10, borderWidth: 1, borderColor: coresTema.bordaSuave, padding: 12, marginBottom: 10 },
  inputMultiLinha: { minHeight: 90, textAlignVertical: "top" },
  label: { color: coresTema.textoSecundario, marginBottom: 8 },
  linhaDificuldade: { marginBottom: 12 },
  rect: {
    width: 375,
    height: 119
  },
  rect_imageStyle: {},
  rect2: {
    width: 375,
    height: 100,
    marginTop: 593
  },
  rect2_imageStyle: {}
});
