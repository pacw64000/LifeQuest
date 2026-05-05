import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";
import FaixasDeCores from "./FaixasDeCores";

/** Pontos fixos para evitar “piscar” entre renders. */
const ESTRELAS = [
  { t: "4%", l: "7%", o: 0.45, s: 2 },
  { t: "9%", l: "82%", o: 0.35, s: 1.5 },
  { t: "14%", l: "44%", o: 0.5, s: 2 },
  { t: "22%", l: "18%", o: 0.3, s: 1 },
  { t: "28%", l: "91%", o: 0.4, s: 2 },
  { t: "35%", l: "33%", o: 0.25, s: 1 },
  { t: "41%", l: "67%", o: 0.45, s: 2 },
  { t: "48%", l: "12%", o: 0.35, s: 1.5 },
  { t: "55%", l: "55%", o: 0.3, s: 1 },
  { t: "62%", l: "78%", o: 0.5, s: 2 },
  { t: "68%", l: "25%", o: 0.28, s: 1 },
  { t: "74%", l: "48%", o: 0.4, s: 1.5 },
  { t: "81%", l: "88%", o: 0.32, s: 1 },
  { t: "88%", l: "15%", o: 0.45, s: 2 },
  { t: "93%", l: "62%", o: 0.38, s: 1.5 },
];

const PONTOS_GRADE = [
  { t: "8%", l: "12%" },
  { t: "8%", l: "38%" },
  { t: "8%", l: "64%" },
  { t: "8%", l: "88%" },
  { t: "22%", l: "25%" },
  { t: "22%", l: "55%" },
  { t: "22%", l: "78%" },
  { t: "38%", l: "15%" },
  { t: "38%", l: "42%" },
  { t: "38%", l: "70%" },
  { t: "52%", l: "8%" },
  { t: "52%", l: "48%" },
  { t: "52%", l: "92%" },
  { t: "68%", l: "22%" },
  { t: "68%", l: "58%" },
  { t: "68%", l: "82%" },
  { t: "85%", l: "18%" },
  { t: "85%", l: "45%" },
  { t: "85%", l: "72%" },
];

/**
 * Fundo espacial (gradiente + nebulosa suave + estrelas), alinhado ao visual do design LifeQuest.
 * Modo pixel: faixas solidas + pontos em grade.
 * pointerEvents="none" nas camadas decorativas para nao bloquear toques.
 */
export default function FundoGradienteDecorativo({ children, style }) {
  const { paleta, tokens } = useTemaVisual();

  const coresFundo = useMemo(
    () => [paleta.fundoProfundo || "#050814", paleta.fundoPrimario, paleta.fundoProfundo || "#050814"],
    [paleta.fundoPrimario, paleta.fundoProfundo]
  );

  if (tokens.usarFaixasEmVezDeGradiente) {
    return (
      <View style={[styles.raiz, style]}>
        <FaixasDeCores cores={coresFundo} style={StyleSheet.absoluteFillObject} />
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {PONTOS_GRADE.map((p, i) => (
            <View
              key={i}
              style={[
                styles.pontoGrade,
                {
                  top: p.t,
                  left: p.l,
                  backgroundColor: paleta.destaque,
                  opacity: 0.35,
                },
              ]}
            />
          ))}
        </View>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.raiz, style]}>
      <LinearGradient colors={coresFundo} style={StyleSheet.absoluteFillObject} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={[`${paleta.destaque}22`, "transparent"]}
          style={[styles.nebula, { top: "-8%", right: "-20%", width: "85%", height: "45%" }]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["rgba(167, 139, 250, 0.12)", "transparent"]}
          style={[styles.nebula, { bottom: "5%", left: "-25%", width: "90%", height: "40%" }]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {ESTRELAS.map((st, i) => (
          <View
            key={i}
            style={[
              styles.estrela,
              {
                top: st.t,
                left: st.l,
                opacity: st.o,
                width: st.s,
                height: st.s,
                borderRadius: st.s,
                backgroundColor: paleta.estrela || "#FFFFFF",
              },
            ]}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  nebula: {
    position: "absolute",
    borderRadius: 999,
  },
  estrela: {
    position: "absolute",
  },
  pontoGrade: {
    position: "absolute",
    width: 3,
    height: 3,
  },
});
