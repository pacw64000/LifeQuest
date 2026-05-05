import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TelaPerfil from "../screens/TelaPerfil";
import TelaConfiguracoesAparencia from "../screens/TelaConfiguracoesAparencia";
import TelaDesenhoRodape from "../screens/TelaDesenhoRodape";
import rotas from "../constants/rotas";

const Stack = createNativeStackNavigator();

export default function PilhaPerfil() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name={rotas.perfil} component={TelaPerfil} />
      <Stack.Screen name={rotas.configuracoesAparencia} component={TelaConfiguracoesAparencia} options={{ title: "Aparência" }} />
      <Stack.Screen name={rotas.desenhoRodape} component={TelaDesenhoRodape} options={{ title: "Desenhar rodapé" }} />
    </Stack.Navigator>
  );
}
