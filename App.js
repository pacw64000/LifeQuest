import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { TemaVisualProvider } from "./src/context/TemaVisualContext";
import { DadosAppProvider } from "./src/context/DadosAppContext";
import NavegacaoRaiz from "./src/navigation/NavegacaoRaiz";

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <TemaVisualProvider>
          <DadosAppProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <NavegacaoRaiz />
            </NavigationContainer>
          </DadosAppProvider>
        </TemaVisualProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
