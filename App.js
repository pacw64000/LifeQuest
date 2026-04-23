import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { DadosAppProvider } from "./src/context/DadosAppContext";
import NavegacaoRaiz from "./src/navigation/NavegacaoRaiz";

export default function App() {
  return (
    <AuthProvider>
      <DadosAppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <NavegacaoRaiz />
        </NavigationContainer>
      </DadosAppProvider>
    </AuthProvider>
  );
}