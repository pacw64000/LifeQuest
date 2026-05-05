import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";
import { AuthProvider } from "./src/context/AuthContext";
import { TemaVisualProvider } from "./src/context/TemaVisualContext";
import { DadosAppProvider } from "./src/context/DadosAppContext";
import NavegacaoRaiz from "./src/navigation/NavegacaoRaiz";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ VT323_400Regular });
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  const fontesPixelOk = Boolean(fontsLoaded && !fontError);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <SafeAreaProvider>
          <TemaVisualProvider fontesPixelCarregadas={fontesPixelOk}>
            <DadosAppProvider>
              <NavigationContainer>
                <StatusBar style="light" />
                <NavegacaoRaiz />
              </NavigationContainer>
            </DadosAppProvider>
          </TemaVisualProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </View>
  );
}
