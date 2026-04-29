import React, { Component } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import coresTema from "../constants/cores";
import rotas from "../constants/rotas";

export default function TelaMissoes({ navigation }) {
  const { listaMissoes, concluirMissao, removerMissao } = useDadosApp();

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.rect}
        imageStyle={styles.rect_imageStyle}
        source={require("../assets/images/Gradient_JV33GZG.png")}
      ></ImageBackground>
      <ImageBackground
        style={styles.rect2}
        imageStyle={styles.rect2_imageStyle}
        source={require("../assets/images/Gradient_H0Vzu6n.png")}
      ></ImageBackground>
      <BotaoPrimario tituloBotao="Criar nova missao" onPress={() => navigation.navigate(rotas.criarMissao)} />
      <FlatList
        data={listaMissoes}
        keyExtractor={(missao) => missao.idMissao}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma missao criada ainda.</Text>}
        renderItem={({ item }) => (
          <CartaoPadrao>
            <Text style={styles.tituloMissao}>{item.tituloMissao}</Text>
            <Text style={styles.descricaoMissao}>{item.descricaoMissao}</Text>
            <Text style={styles.metaMissao}>Dificuldade: {item.dificuldadeMissao}</Text>
            <View style={styles.linhaAcoes}>
              <TouchableOpacity style={styles.botaoAcao} onPress={() => concluirMissao(item.idMissao)}>
                <Text style={styles.textoAcao}>{item.concluida ? "Concluida" : "Concluir"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoAcao, styles.botaoExcluir]} onPress={() => removerMissao(item.idMissao)}>
                <Text style={styles.textoAcao}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </CartaoPadrao>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, padding: 16 },
  vazio: { textAlign: "center", color: coresTema.textoSecundario, marginTop: 30 },
  tituloMissao: { fontSize: 16, fontWeight: "700", color: coresTema.textoPrincipal },
  descricaoMissao: { color: coresTema.textoSecundario, marginVertical: 6 },
  metaMissao: { color: coresTema.textoSecundario, fontSize: 12, marginBottom: 8 },
  linhaAcoes: { flexDirection: "row", gap: 8 },
  botaoAcao: { backgroundColor: coresTema.sucesso, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  botaoExcluir: { backgroundColor: coresTema.alerta },
  textoAcao: { color: "#FFF", fontWeight: "700" },
  rect: {
    width: 375,
    height: 119
  },
  rect_imageStyle: {},
  rect2: {
    width: 375,
    height: 100,
    marginTop: 593
  },
  rect2_imageStyle: {}
});
