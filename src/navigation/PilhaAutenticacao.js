import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TelaLogin from "../screens/auth/TelaLogin";
import TelaCadastro from "../screens/auth/TelaCadastro";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";

const Stack = createNativeStackNavigator();

export default function PilhaAutenticacao() {
  const { paleta, tokens } = useTemaVisual();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: paleta.fundoPrimario,
          borderBottomWidth: tokens.tabBarBorderTop,
          borderBottomColor: paleta.bordaSuave,
        },
        headerTintColor: paleta.textoPrincipal,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: Math.round(17 * tokens.escalaFonte),
          ...(tokens.fontFamilyTexto ? { fontFamily: tokens.fontFamilyTexto } : {}),
        },
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name={rotas.login} component={TelaLogin} options={{ headerShown: false }} />
      <Stack.Screen name={rotas.cadastro} component={TelaCadastro} options={{ title: "Criar Conta" }} />
    </Stack.Navigator>
  );
}
