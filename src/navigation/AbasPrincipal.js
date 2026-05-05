import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import TelaDashboard from "../screens/main/TelaDashboard";
import TelaMissoes from "../screens/main/TelaMissoes";
import TelaCriarMissao from "../screens/main/TelaCriarMissao";
import TelaMiniGames from "../screens/main/TelaMiniGames";
import TelaConquistas from "../screens/main/TelaConquistas";
import PilhaPerfil from "./PilhaPerfil";
import TelaJogoMemoria from "../screens/games/TelaJogoMemoria";
import TelaJogoSnake from "../screens/games/TelaJogoSnake";
import TelaJogoQuiz from "../screens/games/TelaJogoQuiz";
import TelaJogoTap from "../screens/games/TelaJogoTap";
import TelaJogoNonogram from "../screens/games/TelaJogoNonogram";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
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
      <StackMiniGames.Screen name={rotas.miniGames} component={TelaMiniGames} options={{ title: "Mini Games" }} />
      <StackMiniGames.Screen name={rotas.jogoMemoria} component={TelaJogoMemoria} options={{ title: "Jogo da Memoria" }} />
      <StackMiniGames.Screen name={rotas.jogoSnake} component={TelaJogoSnake} options={{ title: "Snake" }} />
      <StackMiniGames.Screen name={rotas.jogoQuiz} component={TelaJogoQuiz} options={{ title: "Quiz Rapido" }} />
      <StackMiniGames.Screen name={rotas.jogoTap} component={TelaJogoTap} options={{ title: "Tap Challenge" }} />
      <StackMiniGames.Screen name={rotas.jogoNonogram} component={TelaJogoNonogram} options={{ title: "Nonogram" }} />
    </StackMiniGames.Navigator>
  );
}

export default function AbasPrincipal() {
  const { paleta, insetsChrome } = useTemaVisual();

  return (
    <View style={[styles.raiz, { backgroundColor: paleta.fundoPrimario }]}>
      <LinearGradient
        colors={paleta.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.faixaHeader, { height: insetsChrome.alturaHeaderTotal }]}
      />
      <Tabs.Navigator
        tabBar={(props) => <TabBarComCapa {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneContainerStyle: { backgroundColor: "transparent" },
          tabBarActiveTintColor: paleta.tabBarActiveTint,
          tabBarInactiveTintColor: paleta.tabBarInactiveTint,
          tabBarShowLabel: true,
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
        <Tabs.Screen name="MissoesStack" component={PilhaMissoes} options={{ title: "Missoes" }} />
        <Tabs.Screen name="MiniGamesStack" component={PilhaMiniGames} options={{ title: "Games" }} />
        <Tabs.Screen name={rotas.conquistas} component={TelaConquistas} />
        <Tabs.Screen name="PerfilStack" component={PilhaPerfil} options={{ title: "Perfil" }} />
      </Tabs.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  faixaHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
