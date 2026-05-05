import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import TextoApp from "../components/TextoApp";
import rotas from "../constants/rotas";

export default function TelaMissoes({ navigation }) {
  const { listaMissoes, concluirMissao, removerMissao } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();

  return (
    <View style={[styles.fundo, { backgroundColor: paleta.fundoPrimario }]}>
      <View
        style={[
          styles.conteudo,
          {
            paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
            paddingBottom: insetsChrome.paddingBottomConteudo,
            paddingHorizontal: tokens.espacamento.md,
          },
        ]}
      >
        <BotaoPrimario tituloBotao="Criar nova missao" onPress={() => navigation.navigate(rotas.criarMissao)} />
        <FlatList
          style={styles.lista}
          data={listaMissoes}
          keyExtractor={(missao) => missao.idMissao}
          ListEmptyComponent={
            <TextoApp style={[styles.vazio, { color: paleta.textoSecundario }]}>Nenhuma missao criada ainda.</TextoApp>
          }
          renderItem={({ item }) => (
            <CartaoPadrao>
              <TextoApp style={[styles.tituloMissao, { color: paleta.textoPrincipal }]}>{item.tituloMissao}</TextoApp>
              <TextoApp style={[styles.descricaoMissao, { color: paleta.textoSecundario }]}>{item.descricaoMissao}</TextoApp>
              <TextoApp style={[styles.metaMissao, { color: paleta.textoSecundario }]}>Dificuldade: {item.dificuldadeMissao}</TextoApp>
              <View style={styles.linhaAcoes}>
                <TouchableOpacity
                  style={[styles.botaoAcao, { backgroundColor: paleta.sucesso }]}
                  onPress={() => concluirMissao(item.idMissao)}
                >
                  <TextoApp style={styles.textoAcao}>{item.concluida ? "Concluida" : "Concluir"}</TextoApp>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoAcao, { backgroundColor: paleta.alerta }]}
                  onPress={() => removerMissao(item.idMissao)}
                >
                  <TextoApp style={styles.textoAcao}>Excluir</TextoApp>
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
