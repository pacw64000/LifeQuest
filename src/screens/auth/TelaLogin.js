import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import { useAuth } from "../../context/AuthContext";
import coresTema from "../../constants/cores";
import rotas from "../../constants/rotas";

export default function TelaLogin({ navigation }) {
  const { loginComEmailSenha, loginComGoogle, loginComoConvidado } = useAuth();
  const [emailUsuario, setEmailUsuario] = useState("");
  const [senhaUsuario, setSenhaUsuario] = useState("");

  function traduzirErroLogin(mensagemErroOriginal) {
    if (mensagemErroOriginal?.includes("auth/invalid-credential")) {
      return "Email ou senha invalidos.";
    }
    if (mensagemErroOriginal?.includes("auth/invalid-email")) {
      return "Formato de email invalido.";
    }
    return mensagemErroOriginal || "Nao foi possivel entrar no momento.";
  }

  async function acaoEntrarComEmail() {
    const emailNormalizado = emailUsuario.trim().toLowerCase();
    if (!emailNormalizado || !senhaUsuario.trim()) {
      Alert.alert("Campos obrigatorios", "Preencha email e senha para continuar.");
      return;
    }
    try {
      await loginComEmailSenha(emailNormalizado, senhaUsuario.trim());
    } catch (erro) {
      Alert.alert("Falha no login", traduzirErroLogin(erro.message));
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
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={senhaUsuario}
        onChangeText={setSenhaUsuario}
        secureTextEntry
        textContentType="password"
        autoCorrect={false}
        style={styles.input}
      />

      <BotaoPrimario tituloBotao="Entrar" onPress={acaoEntrarComEmail} />
      <BotaoPrimario tituloBotao="Entrar com Google" onPress={acaoEntrarComGoogle} />
      <BotaoPrimario tituloBotao="Entrar como Convidado" onPress={loginComoConvidado} />
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
