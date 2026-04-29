import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import BotaoPrimario from "../components/BotaoPrimario";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { agendarLembreteMissao } from "../services/notificacoes/servicoNotificacoes";
import { espacamento } from "../constants/layout";

export default function TelaCriarMissao({ navigation }) {
  const { criarMissao } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
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

  const inputStyle = [
    styles.input,
    {
      borderColor: paleta.bordaSuave,
      backgroundColor: paleta.fundoCartao,
      color: paleta.textoPrincipal,
    },
  ];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg,
        paddingHorizontal: espacamento.md,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput style={inputStyle} placeholder="Titulo da missao" placeholderTextColor={paleta.textoSecundario} value={tituloMissao} onChangeText={setTituloMissao} />
      <TextInput
        style={[inputStyle, styles.inputMultiLinha]}
        placeholder="Descricao"
        placeholderTextColor={paleta.textoSecundario}
        value={descricaoMissao}
        onChangeText={setDescricaoMissao}
        multiline
      />
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>Dificuldade</Text>
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
        style={inputStyle}
        placeholder="Lembrete em segundos (0 desativa)"
        placeholderTextColor={paleta.textoSecundario}
        value={segundosLembreteTexto}
        onChangeText={setSegundosLembreteTexto}
        keyboardType="numeric"
      />
      <BotaoPrimario tituloBotao="Salvar missao" onPress={acaoSalvarMissao} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  input: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 10 },
  inputMultiLinha: { minHeight: 90, textAlignVertical: "top" },
  label: { marginBottom: 8 },
  linhaDificuldade: { marginBottom: 12 },
});
