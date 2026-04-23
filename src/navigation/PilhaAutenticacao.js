import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TelaLogin from "../screens/auth/TelaLogin";
import TelaCadastro from "../screens/auth/TelaCadastro";
import rotas from "../constants/rotas";

const Stack = createNativeStackNavigator();

export default function PilhaAutenticacao() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={rotas.login} component={TelaLogin} options={{ headerShown: false }} />
      <Stack.Screen name={rotas.cadastro} component={TelaCadastro} options={{ title: "Criar Conta" }} />
    </Stack.Navigator>
  );
}
