import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import FundoGradienteDecorativo from "../../components/FundoGradienteDecorativo";
import TextoApp from "../../components/TextoApp";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import rotas from "../../constants/rotas";
import { fonteEscalada } from "../../theme";

function TelaLogin({ navigation }) {
  const { loginComEmailSenha, loginComGoogle, loginComoConvidado } = useAuth();
  const { paleta, tokens } = useTemaVisual();
  const fontCampo = tokens.fontFamilyTexto ? { fontFamily: tokens.fontFamilyTexto } : null;
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

  const estiloInput = [
    styles.input,
    {
      borderColor: paleta.bordaSuave,
      backgroundColor: paleta.fundoCartao,
      color: paleta.textoPrincipal,
      fontSize: fonteEscalada(16, tokens.escalaFonte),
    },
    fontCampo,
  ];

  return (
    <FundoGradienteDecorativo style={styles.container}>
      <TextoApp style={[styles.marca, { color: paleta.destaqueSecundario }]}>LifeQuest</TextoApp>
      <TextoApp style={[styles.tagline, { color: paleta.textoPrincipal }]}>Sua jornada comeca aqui</TextoApp>
      <TextoApp style={[styles.subtitulo, { color: paleta.textoSecundario }]}>Transforme tarefas em aventuras</TextoApp>

      <TextInput
        placeholder="Email"
        placeholderTextColor={paleta.textoSecundario}
        value={emailUsuario}
        onChangeText={setEmailUsuario}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        style={estiloInput}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor={paleta.textoSecundario}
        value={senhaUsuario}
        onChangeText={setSenhaUsuario}
        secureTextEntry
        textContentType="password"
        autoCorrect={false}
        style={estiloInput}
      />

      <BotaoPrimario tituloBotao="Entrar" onPress={acaoEntrarComEmail} />
      <BotaoPrimario tituloBotao="Entrar com Google" onPress={acaoEntrarComGoogle} variante="secundario" />
      <BotaoPrimario tituloBotao="Entrar como Convidado" onPress={loginComoConvidado} variante="secundario" />
      <BotaoPrimario tituloBotao="Criar conta" onPress={() => navigation.navigate(rotas.cadastro)} variante="secundario" />
    </FundoGradienteDecorativo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  marca: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: "center",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitulo: {
    textAlign: "center",
    marginBottom: 28,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
});

export default TelaLogin;
