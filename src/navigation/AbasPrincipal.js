import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import FaixasDeCores from "../components/FaixasDeCores";
import TelaDashboard from "../screens/TelaDashboard";
import TelaMissoes from "../screens/TelaMissoes";
import TelaCriarMissao from "../screens/TelaCriarMissao";
import TelaMiniGames from "../screens/TelaMiniGames";
import TelaConquistas from "../screens/TelaConquistas";
import PilhaPerfil from "./PilhaPerfil";
import TelaJogoMemoria from "../screens/games/TelaJogoMemoria";
import TelaJogoSnake from "../screens/games/TelaJogoSnake";
import TelaJogoQuiz from "../screens/games/TelaJogoQuiz";
import TelaJogoTap from "../screens/games/TelaJogoTap";
import TelaJogoNonogram from "../screens/games/TelaJogoNonogram";
import TelaJogoDigitacao from "../screens/games/TelaJogoDigitacao";
import TelaJogoTermo from "../screens/games/TelaJogoTermo";
import TelaJogoSequencia from "../screens/games/TelaJogoSequencia";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
import { hexParaRgba } from "../utils/gerarPaletaTema";
import TabBarComCapa from "./TabBarComCapa";

const Tabs = createBottomTabNavigator();
const StackMissoes = createNativeStackNavigator();
const StackMiniGames = createNativeStackNavigator();

function PilhaMissoes() {
  return (
    <StackMissoes.Navigator screenOptions={{ contentStyle: { backgroundColor: "transparent" } }}>
      <StackMissoes.Screen name={rotas.missoes} component={TelaMissoes} options={{ title: "Missoes" }} />
      <StackMissoes.Screen name={rotas.criarMissao} component={TelaCriarMissao} options={{ title: "Criar Missao" }} />
    </StackMissoes.Navigator>
  );
}

function PilhaMiniGames() {
  return (
    <StackMiniGames.Navigator screenOptions={{ contentStyle: { backgroundColor: "transparent" } }}>
      <StackMiniGames.Screen name={rotas.miniGames}    component={TelaMiniGames}      options={{ title: "Mini Games" }} />
      <StackMiniGames.Screen name={rotas.jogoMemoria}  component={TelaJogoMemoria}    options={{ title: "Jogo da Memória" }} />
      <StackMiniGames.Screen name={rotas.jogoSnake}    component={TelaJogoSnake}      options={{ title: "Snake" }} />
      <StackMiniGames.Screen name={rotas.jogoQuiz}     component={TelaJogoQuiz}       options={{ title: "Quiz Rápido" }} />
      <StackMiniGames.Screen name={rotas.jogoTap}      component={TelaJogoTap}        options={{ title: "Tap Challenge" }} />
      <StackMiniGames.Screen name={rotas.jogoNonogram} component={TelaJogoNonogram}   options={{ title: "Nonogram" }} />
      <StackMiniGames.Screen name={rotas.jogoDigitacao} component={TelaJogoDigitacao} options={{ title: "Digitação Rápida" }} />
      <StackMiniGames.Screen name={rotas.jogoTermo}    component={TelaJogoTermo}      options={{ title: "Termo" }} />
      <StackMiniGames.Screen name={rotas.jogoSequencia} component={TelaJogoSequencia} options={{ title: "Sequência de Cores" }} />
    </StackMiniGames.Navigator>
  );
}

export default function AbasPrincipal() {
  const { paleta, insetsChrome, tokens, preferencias } = useTemaVisual();
  const rawT = preferencias.transparenciaBarraNavegacao;
  const transparencia =
    typeof rawT === "number" && Number.isFinite(rawT) ? Math.max(0, Math.min(1, rawT)) : 1;
  const opacidadeFundoBarra = 1 - transparencia;
  const tabFs = Math.max(
    10,
    Math.round(tokens.tipografia.tabBarLabel * tokens.escalaFonte)
  );
  const labelFont = tokens.fontFamilyTexto
    ? { fontFamily: tokens.fontFamilyTexto, fontSize: tabFs }
    : { fontSize: tabFs };

  return (
    <View style={[styles.raiz, { backgroundColor: paleta.fundoPrimario }]}>
      {tokens.usarFaixasEmVezDeGradiente ? (
        <View style={[styles.faixaHeader, { height: insetsChrome.alturaHeaderTotal }]}>
          <FaixasDeCores cores={paleta.headerGradient} style={StyleSheet.absoluteFillObject} />
        </View>
      ) : (
        <LinearGradient
          colors={paleta.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.faixaHeader, { height: insetsChrome.alturaHeaderTotal }]}
        />
      )}
      <Tabs.Navigator
        tabBar={(props) => <TabBarComCapa {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneContainerStyle: { backgroundColor: "transparent" },
          // BottomTabBar uses theme `colors.card` unless `tabBarBackground` is set; overlay alpha = 1 - transparencia.
          tabBarBackground: () => (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: hexParaRgba(paleta.fundoCartao, opacidadeFundoBarra) },
              ]}
            />
          ),
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: paleta.tabBarActiveTint,
          tabBarInactiveTintColor: paleta.tabBarInactiveTint,
          tabBarShowLabel: true,
          tabBarLabelStyle: labelFont,
          tabBarIcon: ({ color, size }) => {
            const mapaIcones = {
              Dashboard: "speedometer",
              MissoesStack: "checkmark-done",
              MiniGamesStack: "game-controller",
              Conquistas: "trophy",
              PerfilStack: "person-circle",
            };
            const nomeIcone = mapaIcones[route.name] || "ellipse";
            return <Ionicons name={nomeIcone} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name={rotas.dashboard} component={TelaDashboard} options={{ title: "Inicio" }} />
        <Tabs.Screen name="MissoesStack"   component={PilhaMissoes}   options={{ title: "Missoes" }} />
        <Tabs.Screen name="MiniGamesStack" component={PilhaMiniGames} options={{ title: "Games" }} />
        <Tabs.Screen name={rotas.conquistas} component={TelaConquistas} />
        <Tabs.Screen name="PerfilStack"    component={PilhaPerfil}    options={{ title: "Perfil" }} />
      </Tabs.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  faixaHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});