import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "./AuthContext";
import { gerarPaletaTema, COR_PRIMARIA_PADRAO, normalizarHex } from "../utils/gerarPaletaTema";
import { atualizarPerfilUsuario, obterOuCriarPerfilUsuario } from "../services/firebase/repositorioPerfil";

const chaveTemaConvidado = "@lifequest/tema/guest";

function chaveTemaUsuario(idUsuario) {
  return `@lifequest/tema/${idUsuario}`;
}

const TemaVisualContext = createContext(null);

const preferenciasPadrao = {
  corPrimaria: COR_PRIMARIA_PADRAO,
  modoRodape: "gradiente",
  corRodapeFim: null,
  uriImagemRodape: null,
};

function mesclarPreferencias(base, parcial) {
  return {
    ...base,
    ...parcial,
    corPrimaria: parcial.corPrimaria != null ? normalizarHex(parcial.corPrimaria) : base.corPrimaria,
    modoRodape: parcial.modoRodape === "imagem" || parcial.modoRodape === "gradiente" ? parcial.modoRodape : base.modoRodape,
    corRodapeFim: parcial.corRodapeFim === undefined ? base.corRodapeFim : parcial.corRodapeFim || null,
    uriImagemRodape: parcial.uriImagemRodape === undefined ? base.uriImagemRodape : parcial.uriImagemRodape || null,
  };
}

/** Altura da faixa do header abaixo da status bar (px logicos). */
export const ALTURA_FAIXA_HEADER = 52;
/** Altura extra reservada para tab bar acima do home indicator. */
export const ALTURA_TAB_BAR_BASE = 52;

export function TemaVisualProvider({ children }) {
  const { usuarioAutenticado } = useAuth();
  const insets = useSafeAreaInsets();
  const [preferencias, setPreferencias] = useState(preferenciasPadrao);
  const [carregandoTema, setCarregandoTema] = useState(true);

  const idChave = usuarioAutenticado?.isGuest ? chaveTemaConvidado : usuarioAutenticado?.idUsuario ? chaveTemaUsuario(usuarioAutenticado.idUsuario) : null;

  const paleta = useMemo(
    () => gerarPaletaTema(preferencias.corPrimaria, { corRodapeFim: preferencias.corRodapeFim }),
    [preferencias.corPrimaria, preferencias.corRodapeFim]
  );

  const insetsChrome = useMemo(
    () => ({
      paddingTopConteudo: insets.top + ALTURA_FAIXA_HEADER,
      paddingBottomConteudo: insets.bottom + ALTURA_TAB_BAR_BASE + 8,
      alturaHeaderTotal: insets.top + ALTURA_FAIXA_HEADER,
      alturaTabBarArea: insets.bottom + ALTURA_TAB_BAR_BASE,
      safeTop: insets.top,
      safeBottom: insets.bottom,
    }),
    [insets.top, insets.bottom]
  );

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      if (!usuarioAutenticado) {
        setPreferencias(preferenciasPadrao);
        setCarregandoTema(false);
        return;
      }

      setCarregandoTema(true);
      try {
        let proximas = { ...preferenciasPadrao };

        if (idChave) {
          const jsonLocal = await AsyncStorage.getItem(idChave);
          if (jsonLocal) {
            try {
              proximas = mesclarPreferencias(proximas, JSON.parse(jsonLocal));
            } catch (e) {
              /* ignore */
            }
          }
        }

        if (usuarioAutenticado?.idUsuario && !usuarioAutenticado.isGuest) {
          try {
            const perfil = await obterOuCriarPerfilUsuario(usuarioAutenticado.idUsuario, usuarioAutenticado.nomeUsuario);
            const doFirestore = perfil?.preferenciasTema;
            if (doFirestore && typeof doFirestore === "object") {
              proximas = mesclarPreferencias(proximas, doFirestore);
            }
          } catch (e) {
            /* offline: keep local */
          }
        }

        if (!cancelado) setPreferencias(proximas);
      } finally {
        if (!cancelado) setCarregandoTema(false);
      }
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [usuarioAutenticado?.idUsuario, usuarioAutenticado?.isGuest, idChave]);

  const salvarPreferencias = useCallback(
    async (parcial) => {
      const mesclado = mesclarPreferencias(preferencias, parcial);
      setPreferencias(mesclado);

      if (idChave) {
        await AsyncStorage.setItem(idChave, JSON.stringify(mesclado));
      }

      if (usuarioAutenticado?.idUsuario && !usuarioAutenticado.isGuest) {
        try {
          await atualizarPerfilUsuario(usuarioAutenticado.idUsuario, { preferenciasTema: mesclado });
        } catch (e) {
          /* fila offline poderia ser adicionada depois */
        }
      }
    },
    [preferencias, idChave, usuarioAutenticado?.idUsuario, usuarioAutenticado?.isGuest]
  );

  const valor = useMemo(
    () => ({
      preferencias,
      paleta,
      salvarPreferencias,
      carregandoTema,
      insetsChrome,
    }),
    [preferencias, paleta, salvarPreferencias, carregandoTema, insetsChrome]
  );

  return <TemaVisualContext.Provider value={valor}>{children}</TemaVisualContext.Provider>;
}

export function useTemaVisual() {
  const ctx = useContext(TemaVisualContext);
  if (!ctx) {
    throw new Error("useTemaVisual deve ser usado dentro de TemaVisualProvider");
  }
  return ctx;
}
