import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import BotaoPrimario from "../components/BotaoPrimario";
import TextoApp from "../components/TextoApp";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { agendarLembreteMissao } from "../services/notificacoes/servicoNotificacoes";
import { fonteEscalada } from "../theme";
import { fetchMissionsFromGemini } from "../services/gemini.js"

export default function TelaCriarMissao({ navigation }) {
  const { criarMissao } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const fsInput = fonteEscalada(16, tokens.escalaFonte);
  const fontCampo = tokens.fontFamilyTexto ? { fontFamily: tokens.fontFamilyTexto } : null;
  const [tituloMissao, setTituloMissao] = useState("");
  const [descricaoMissao, setDescricaoMissao] = useState("");
  const [dificuldadeMissao, setDificuldadeMissao] = useState("facil");
  const [segundosLembreteTexto, setSegundosLembreteTexto] = useState("0");
  const [tema, set_tema] = useState("aleatorio");

  async function acaoSalvarMissao(aleatorio) {
    if (aleatorio) {
      const missao = await fetchMissionsFromGemini(tema, dificuldadeMissao);
      const novaMissao = criarMissao(missao);
      
    } else {
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
    }

    navigation.goBack();
  }

  const inputStyle = [
    styles.input,
    {
      borderColor: paleta.bordaSuave,
      backgroundColor: paleta.fundoCartao,
      color: paleta.textoPrincipal,
      fontSize: fsInput,
    },
    fontCampo,
  ];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg,
        paddingHorizontal: tokens.espacamento.md,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput style={inputStyle} placeholder="Titulo da missao" placeholderTextColor={paleta.textoSecundario} value={tituloMissao} onChangeText={setTituloMissao} />
      <TextInput
        style={inputStyle}
        placeholder="Tema da missao"
        placeholderTextColor={paleta.textoSecundario}
        value={tema}
        onChangeText={set_tema}
      />
      <TextInput
        style={[inputStyle, styles.inputMultiLinha]}
        placeholder="Descricao"
        placeholderTextColor={paleta.textoSecundario}
        value={descricaoMissao}
        onChangeText={setDescricaoMissao}
        multiline
      />
      <TextoApp style={[styles.label, { color: paleta.textoSecundario }]}>Dificuldade</TextoApp>
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

      <BotaoPrimario tituloBotao="Criar missão aleatoria" onPress={()=>acaoSalvarMissao(true)} />
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
