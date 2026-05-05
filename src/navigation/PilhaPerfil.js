import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TelaPerfil from "../screens/main/TelaPerfil";
import TelaConfiguracoesAparencia from "../screens/settings/TelaConfiguracoesAparencia";
import rotas from "../constants/rotas";

const Stack = createNativeStackNavigator();

export default function PilhaPerfil() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name={rotas.perfil} component={TelaPerfil} />
      <Stack.Screen name={rotas.configuracoesAparencia} component={TelaConfiguracoesAparencia} options={{ title: "Aparência" }} />
    </Stack.Navigator>
  );
}
