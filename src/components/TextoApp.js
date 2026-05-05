import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function TextoApp({ style, ...rest }) {
  const { tokens } = useTemaVisual();
  const ff = tokens.fontFamilyTexto ? { fontFamily: tokens.fontFamilyTexto } : null;
  const flat = StyleSheet.flatten(style);
  const escala = tokens.escalaFonte;
  const fsAjuste =
    flat?.fontSize != null
      ? { fontSize: Math.max(10, Math.round(flat.fontSize * escala)) }
      : null;
  const lhAjuste =
    flat?.lineHeight != null
      ? { lineHeight: Math.max(14, Math.round(flat.lineHeight * escala)) }
      : null;
  return <Text style={[ff, style, fsAjuste, lhAjuste]} {...rest} />;
}
