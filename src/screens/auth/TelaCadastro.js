import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import FundoGradienteDecorativo from "../../components/FundoGradienteDecorativo";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";

function TelaCadastro({ navigation }) {
  const { cadastrarComEmailSenha } = useAuth();
  const { paleta } = useTemaVisual();
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

  const estiloInput = [
    styles.input,
    {
      borderColor: paleta.bordaSuave,
      backgroundColor: paleta.fundoCartao,
      color: paleta.textoPrincipal,
    },
  ];

  return (
    <FundoGradienteDecorativo style={styles.container}>
      <Text style={[styles.titulo, { color: paleta.textoPrincipal }]}>Criar Conta</Text>
      <TextInput
        placeholder="Nome de usuario"
        placeholderTextColor={paleta.textoSecundario}
        value={nomeUsuario}
        onChangeText={setNomeUsuario}
        style={estiloInput}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor={paleta.textoSecundario}
        value={emailUsuario}
        onChangeText={setEmailUsuario}
        keyboardType="email-address"
        autoCapitalize="none"
        style={estiloInput}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor={paleta.textoSecundario}
        value={senhaUsuario}
        onChangeText={setSenhaUsuario}
        secureTextEntry
        style={estiloInput}
      />
      <BotaoPrimario tituloBotao="Cadastrar" onPress={acaoCadastrar} />
    </FundoGradienteDecorativo>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "800", marginBottom: 18, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
});

export default TelaCadastro;
