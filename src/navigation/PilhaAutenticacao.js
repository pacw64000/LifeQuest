import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TelaLogin from "../screens/auth/TelaLogin";
import TelaCadastro from "../screens/auth/TelaCadastro";
import rotas from "../constants/rotas";

const Stack = createNativeStackNavigator();

const opcoesHeaderEscuro = {
  headerStyle: { backgroundColor: "#0C1228" },
  headerTintColor: "#E8EDF5",
  headerTitleStyle: { fontWeight: "700" },
  contentStyle: { backgroundColor: "transparent" },
};

export default function PilhaAutenticacao() {
  return (
    <Stack.Navigator screenOptions={opcoesHeaderEscuro}>
      <Stack.Screen name={rotas.login} component={TelaLogin} options={{ headerShown: false }} />
      <Stack.Screen name={rotas.cadastro} component={TelaCadastro} options={{ title: "Criar Conta" }} />
    </Stack.Navigator>
  );
}
