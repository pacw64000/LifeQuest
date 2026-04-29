import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import FundoGradienteDecorativo from "../components/FundoGradienteDecorativo";
import coresTema from "../constants/cores";
import rotas from "../constants/rotas";

export default function TelaMissoes({ navigation }) {
  const { listaMissoes, concluirMissao, removerMissao } = useDadosApp();

  return (
    <FundoGradienteDecorativo style={styles.fundo}>
      <View style={styles.conteudo}>
        <BotaoPrimario tituloBotao="Criar nova missao" onPress={() => navigation.navigate(rotas.criarMissao)} />
        <FlatList
          style={styles.lista}
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
    </FundoGradienteDecorativo>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: coresTema.fundoPrimario },
  conteudo: { flex: 1, padding: 16 },
  lista: { flex: 1 },
  vazio: { textAlign: "center", color: coresTema.textoSecundario, marginTop: 30 },
  tituloMissao: { fontSize: 16, fontWeight: "700", color: coresTema.textoPrincipal },
  descricaoMissao: { color: coresTema.textoSecundario, marginVertical: 6 },
  metaMissao: { color: coresTema.textoSecundario, fontSize: 12, marginBottom: 8 },
  linhaAcoes: { flexDirection: "row", gap: 8 },
  botaoAcao: { backgroundColor: coresTema.sucesso, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  botaoExcluir: { backgroundColor: coresTema.alerta },
  textoAcao: { color: "#FFF", fontWeight: "700" },
});
