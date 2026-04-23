import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import coresTema from "../constants/cores";
import { useDadosApp } from "../context/DadosAppContext";
import CartaoPadrao from "../components/CartaoPadrao";

export default function TelaConquistas() {
  const { catalogoConquistasPadrao, listaConquistasDesbloqueadas } = useDadosApp();

  return (
    <View style={styles.container}>
      <FlatList
        data={catalogoConquistasPadrao}
        keyExtractor={(conquista) => conquista.idConquista}
        renderItem={({ item }) => {
          const desbloqueada = listaConquistasDesbloqueadas.includes(item.idConquista);
          return (
            <CartaoPadrao>
              <Text style={styles.titulo}>{item.tituloConquista}</Text>
              <Text style={styles.descricao}>{item.descricaoConquista}</Text>
              <Text style={[styles.status, desbloqueada ? styles.desbloqueada : styles.bloqueada]}>
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
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, padding: 16 },
  titulo: { color: coresTema.textoPrincipal, fontWeight: "700", fontSize: 16 },
  descricao: { color: coresTema.textoSecundario, marginTop: 4 },
  status: { marginTop: 8, fontWeight: "700" },
  desbloqueada: { color: coresTema.sucesso },
  bloqueada: { color: coresTema.alerta },
});
