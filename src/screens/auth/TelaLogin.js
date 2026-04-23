import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import { useAuth } from "../../context/AuthContext";
import coresTema from "../../constants/cores";
import rotas from "../../constants/rotas";

export default function TelaLogin({ navigation }) {
  const { loginComEmailSenha, loginComGoogle } = useAuth();
  const [emailUsuario, setEmailUsuario] = useState("");
  const [senhaUsuario, setSenhaUsuario] = useState("");

  async function acaoEntrarComEmail() {
    try {
      await loginComEmailSenha(emailUsuario.trim(), senhaUsuario);
    } catch (erro) {
      Alert.alert("Falha no login", erro.message);
    }
  }

  async function acaoEntrarComGoogle() {
    try {
      await loginComGoogle();
    } catch (erro) {
      Alert.alert("Falha no Google Login", erro.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>LifeQuest</Text>
      <Text style={styles.subtitulo}>Transforme tarefas em aventuras</Text>

      <TextInput
        placeholder="Email"
        value={emailUsuario}
        onChangeText={setEmailUsuario}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={senhaUsuario}
        onChangeText={setSenhaUsuario}
        secureTextEntry
        style={styles.input}
      />

      <BotaoPrimario tituloBotao="Entrar" onPress={acaoEntrarComEmail} />
      <BotaoPrimario tituloBotao="Entrar com Google" onPress={acaoEntrarComGoogle} />
      <BotaoPrimario tituloBotao="Criar conta" onPress={() => navigation.navigate(rotas.cadastro)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: coresTema.fundoPrimario,
    padding: 20,
    justifyContent: "center",
  },
  titulo: { fontSize: 34, fontWeight: "800", color: coresTema.destaque, marginBottom: 6 },
  subtitulo: { color: coresTema.textoSecundario, marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: coresTema.bordaSuave,
    borderRadius: 10,
    backgroundColor: "#FFF",
    padding: 12,
    marginBottom: 10,
  },
});
