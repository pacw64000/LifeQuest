import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { autenticacaoFirebase } from "../services/firebase/config";
import { obterOuCriarPerfilUsuario } from "../services/firebase/repositorioPerfil";

WebBrowser.maybeCompleteAuthSession();

const chaveStorageUsuario = "@lifequest/usuario_logado";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [carregandoAutenticacao, setCarregandoAutenticacao] = useState(true);

  const [requisicaoGoogle, respostaGoogle, acionarPromptGoogle] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    const desinscrever = onAuthStateChanged(autenticacaoFirebase, async (usuarioFirebase) => {
      if (!usuarioFirebase) {
        setUsuarioAutenticado(null);
        await AsyncStorage.removeItem(chaveStorageUsuario);
        setCarregandoAutenticacao(false);
        return;
      }

      await obterOuCriarPerfilUsuario(usuarioFirebase.uid, usuarioFirebase.displayName || "");
      const dadosUsuario = {
        idUsuario: usuarioFirebase.uid,
        emailUsuario: usuarioFirebase.email || "",
        nomeUsuario: usuarioFirebase.displayName || "Aventureiro",
      };
      setUsuarioAutenticado(dadosUsuario);
      await AsyncStorage.setItem(chaveStorageUsuario, JSON.stringify(dadosUsuario));
      setCarregandoAutenticacao(false);
    });

    return desinscrever;
  }, []);

  useEffect(() => {
    async function finalizarLoginGoogle() {
      if (respostaGoogle?.type !== "success") {
        return;
      }

      const tokenIdGoogle = respostaGoogle.authentication?.idToken;
      if (!tokenIdGoogle) {
        return;
      }
      const credencialGoogle = GoogleAuthProvider.credential(tokenIdGoogle);
      await signInWithCredential(autenticacaoFirebase, credencialGoogle);
    }

    finalizarLoginGoogle();
  }, [respostaGoogle]);

  async function loginComEmailSenha(emailUsuario, senhaUsuario) {
    await signInWithEmailAndPassword(autenticacaoFirebase, emailUsuario, senhaUsuario);
  }

  async function cadastrarComEmailSenha(nomeUsuario, emailUsuario, senhaUsuario) {
    const respostaCadastro = await createUserWithEmailAndPassword(autenticacaoFirebase, emailUsuario, senhaUsuario);
    await obterOuCriarPerfilUsuario(respostaCadastro.user.uid, nomeUsuario);
  }

  async function loginComGoogle() {
    if (!requisicaoGoogle) {
      return;
    }
    await acionarPromptGoogle();
  }

  async function logout() {
    await signOut(autenticacaoFirebase);
  }

  const valorContexto = useMemo(
    () => ({
      usuarioAutenticado,
      carregandoAutenticacao,
      loginComEmailSenha,
      cadastrarComEmailSenha,
      loginComGoogle,
      logout,
    }),
    [usuarioAutenticado, carregandoAutenticacao, requisicaoGoogle]
  );

  return <AuthContext.Provider value={valorContexto}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contextoAuth = useContext(AuthContext);
  if (!contextoAuth) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return contextoAuth;
}
