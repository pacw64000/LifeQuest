import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import rotas from "../constants/rotas";
import PilhaAutenticacao from "./PilhaAutenticacao";
import AbasPrincipal from "./AbasPrincipal";
import coresTema from "../constants/cores";

const Stack = createNativeStackNavigator();

export default function NavegacaoRaiz() {
  const { usuarioAutenticado, carregandoAutenticacao } = useAuth();

  if (carregandoAutenticacao) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: coresTema.fundoPrimario }}>
        <ActivityIndicator size="large" color={coresTema.destaque} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuarioAutenticado ? (
        <Stack.Screen name={rotas.abasPrincipal} component={AbasPrincipal} />
      ) : (
        <Stack.Screen name={rotas.login} component={PilhaAutenticacao} />
      )}
    </Stack.Navigator>
  );
}
