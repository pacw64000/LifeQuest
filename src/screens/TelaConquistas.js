import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import TextoApp from "../components/TextoApp";

export default function TelaConquistas() {
  const { catalogoConquistasPadrao, listaConquistasDesbloqueadas } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();

  return (
    <View style={[styles.container, { backgroundColor: paleta.fundoPrimario }]}>
      <FlatList
        contentContainerStyle={{
          paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
          paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg,
          paddingHorizontal: tokens.espacamento.md,
        }}
        data={catalogoConquistasPadrao}
        keyExtractor={(conquista) => conquista.idConquista}
        renderItem={({ item }) => {
          const desbloqueada = listaConquistasDesbloqueadas.includes(item.idConquista);
          return (
            <CartaoPadrao>
              <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>{item.tituloConquista}</TextoApp>
              <TextoApp style={[styles.descricao, { color: paleta.textoSecundario }]}>{item.descricaoConquista}</TextoApp>
              <TextoApp style={[styles.status, desbloqueada ? { color: paleta.sucesso } : { color: paleta.alerta }]}>
                {desbloqueada ? "Desbloqueada" : "Bloqueada"}
              </TextoApp>
            </CartaoPadrao>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titulo: { fontWeight: "700", fontSize: 16 },
  descricao: { marginTop: 4 },
  status: { marginTop: 8, fontWeight: "700" },
});
