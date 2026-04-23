import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import TelaDashboard from "../screens/TelaDashboard";
import TelaMissoes from "../screens/TelaMissoes";
import TelaCriarMissao from "../screens/TelaCriarMissao";
import TelaMiniGames from "../screens/TelaMiniGames";
import TelaConquistas from "../screens/TelaConquistas";
import TelaJogoMemoria from "../screens/games/TelaJogoMemoria";
import TelaJogoSnake from "../screens/games/TelaJogoSnake";
import TelaJogoQuiz from "../screens/games/TelaJogoQuiz";
import TelaJogoTap from "../screens/games/TelaJogoTap";
import TelaJogoNonogram from "../screens/games/TelaJogoNonogram";
import rotas from "../constants/rotas";
import coresTema from "../constants/cores";

const Tabs = createBottomTabNavigator();
const StackMissoes = createNativeStackNavigator();
const StackMiniGames = createNativeStackNavigator();

function PilhaMissoes() {
  return (
    <StackMissoes.Navigator>
      <StackMissoes.Screen name={rotas.missoes} component={TelaMissoes} options={{ title: "Missoes" }} />
      <StackMissoes.Screen name={rotas.criarMissao} component={TelaCriarMissao} options={{ title: "Criar Missao" }} />
    </StackMissoes.Navigator>
  );
}

function PilhaMiniGames() {
  return (
    <StackMiniGames.Navigator>
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
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: coresTema.destaque,
        tabBarInactiveTintColor: coresTema.textoSecundario,
        tabBarIcon: ({ color, size }) => {
          const mapaIcones = {
            Dashboard: "speedometer",
            MissoesStack: "checkmark-done",
            MiniGamesStack: "game-controller",
            Conquistas: "trophy",
          };
          const nomeIcone = mapaIcones[route.name] || "ellipse";
          return <Ionicons name={nomeIcone} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name={rotas.dashboard} component={TelaDashboard} />
      <Tabs.Screen name="MissoesStack" component={PilhaMissoes} options={{ title: "Missoes" }} />
      <Tabs.Screen name="MiniGamesStack" component={PilhaMiniGames} options={{ title: "Games" }} />
      <Tabs.Screen name={rotas.conquistas} component={TelaConquistas} />
    </Tabs.Navigator>
  );
}
