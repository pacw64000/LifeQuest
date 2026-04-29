import React, { Component, useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import { useAuth } from "../../context/AuthContext";
import coresTema from "../../constants/cores";

function TelaCadastro({ navigation }) {
  const { cadastrarComEmailSenha } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [senhaUsuario, setSenhaUsuario] = useState("");

  async function acaoCadastrar() {
    try {
      await cadastrarComEmailSenha(nomeUsuario.trim(), emailUsuario.trim(), senhaUsuario);
      Alert.alert("Conta criada", "Agora faca login para continuar.");
      navigation.goBack();
    } catch (erro) {
      Alert.alert("Falha no cadastro", erro.message);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.rect}
        imageStyle={styles.rect_imageStyle}
        source={require("../../assets/images/Gradient_JV33GZG.png")}
      ></ImageBackground>
      <ImageBackground
        style={styles.rect2}
        imageStyle={styles.rect2_imageStyle}
        source={require("../../assets/images/Gradient_H0Vzu6n.png")}
      ></ImageBackground>
      <Text style={styles.titulo}>Criar Conta</Text>
      <TextInput placeholder="Nome de usuario" value={nomeUsuario} onChangeText={setNomeUsuario} style={styles.input} />
      <TextInput
        placeholder="Email"
        value={emailUsuario}
        onChangeText={setEmailUsuario}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput placeholder="Senha" value={senhaUsuario} onChangeText={setSenhaUsuario} secureTextEntry style={styles.input} />
      <BotaoPrimario tituloBotao="Cadastrar" onPress={acaoCadastrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, padding: 20, justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "700", color: coresTema.textoPrincipal, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: coresTema.bordaSuave,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  rect: {
    width: 375,
    height: 119,
  },
  rect_imageStyle: {},
  rect2: {
    width: 375,
    height: 100,
    marginTop: 593,
  },
  rect2_imageStyle: {},
});

export default TelaCadastro;
