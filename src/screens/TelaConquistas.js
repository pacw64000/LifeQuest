import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import { espacamento } from "../constants/layout";

export default function TelaConquistas() {
  const { catalogoConquistasPadrao, listaConquistasDesbloqueadas } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  return (
    <View style={[styles.container, { backgroundColor: paleta.fundoPrimario }]}>
      <FlatList
        contentContainerStyle={{
          paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
          paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg,
          paddingHorizontal: espacamento.md,
        }}
        data={catalogoConquistasPadrao}
        keyExtractor={(conquista) => conquista.idConquista}
        renderItem={({ item }) => {
          const desbloqueada = listaConquistasDesbloqueadas.includes(item.idConquista);
          return (
            <CartaoPadrao>
              <Text style={[styles.titulo, { color: paleta.textoPrincipal }]}>{item.tituloConquista}</Text>
              <Text style={[styles.descricao, { color: paleta.textoSecundario }]}>{item.descricaoConquista}</Text>
              <Text style={[styles.status, desbloqueada ? { color: paleta.sucesso } : { color: paleta.alerta }]}>
                {desbloqueada ? "Desbloqueada" : "Bloqueada"}
              </Text>
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
