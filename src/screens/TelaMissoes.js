import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import rotas from "../constants/rotas";
import { espacamento } from "../constants/layout";

export default function TelaMissoes({ navigation }) {
  const { listaMissoes, concluirMissao, removerMissao } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  return (
    <View style={[styles.fundo, { backgroundColor: paleta.fundoPrimario }]}>
      <View
        style={[
          styles.conteudo,
          {
            paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
            paddingBottom: insetsChrome.paddingBottomConteudo,
            paddingHorizontal: espacamento.md,
          },
        ]}
      >
        <BotaoPrimario tituloBotao="Criar nova missao" onPress={() => navigation.navigate(rotas.criarMissao)} />
        <FlatList
          style={styles.lista}
          data={listaMissoes}
          keyExtractor={(missao) => missao.idMissao}
          ListEmptyComponent={
            <Text style={[styles.vazio, { color: paleta.textoSecundario }]}>Nenhuma missao criada ainda.</Text>
          }
          renderItem={({ item }) => (
            <CartaoPadrao>
              <Text style={[styles.tituloMissao, { color: paleta.textoPrincipal }]}>{item.tituloMissao}</Text>
              <Text style={[styles.descricaoMissao, { color: paleta.textoSecundario }]}>{item.descricaoMissao}</Text>
              <Text style={[styles.metaMissao, { color: paleta.textoSecundario }]}>Dificuldade: {item.dificuldadeMissao}</Text>
              <View style={styles.linhaAcoes}>
                <TouchableOpacity
                  style={[styles.botaoAcao, { backgroundColor: paleta.sucesso }]}
                  onPress={() => concluirMissao(item.idMissao)}
                >
                  <Text style={styles.textoAcao}>{item.concluida ? "Concluida" : "Concluir"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoAcao, { backgroundColor: paleta.alerta }]}
                  onPress={() => removerMissao(item.idMissao)}
                >
                  <Text style={styles.textoAcao}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </CartaoPadrao>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  conteudo: { flex: 1 },
  lista: { flex: 1 },
  vazio: { textAlign: "center", marginTop: 30 },
  tituloMissao: { fontSize: 16, fontWeight: "700" },
  descricaoMissao: { marginVertical: 6 },
  metaMissao: { fontSize: 12, marginBottom: 8 },
  linhaAcoes: { flexDirection: "row", gap: 8 },
  botaoAcao: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  textoAcao: { color: "#FFF", fontWeight: "700" },
});
