import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import rotas from "../constants/rotas";
import { espacamento, raio, tipografia } from "../constants/layout";

// Tag de categoria
function TagCategoria({ categoria, paleta }) {
  const cores = paleta.categorias?.[categoria] || { bg: paleta.destaque, text: "#FFF" };
  return (
    <View style={[styles.tag, { backgroundColor: cores.bg }]}>
      <Text style={[styles.tagTexto, { color: cores.text }]}>{categoria}</Text>
    </View>
  );
}

// XP por dificuldade
const XP_MAP = { facil: 15, media: 30, dificil: 50 };

export default function TelaMissoes({ navigation }) {
  const { listaMissoes, concluirMissao, removerMissao } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();
  const [filtro, setFiltro] = useState("TODAS"); // TODAS | ABERTAS | FEITAS

  const missoesFiltradas = useMemo(() => {
    if (filtro === "ABERTAS") return listaMissoes.filter((m) => !m.concluida);
    if (filtro === "FEITAS")  return listaMissoes.filter((m) => m.concluida);
    return listaMissoes;
  }, [listaMissoes, filtro]);

  const abas = ["TODAS", "ABERTAS", "FEITAS"];

  return (
    <View style={[styles.fundo, { backgroundColor: paleta.fundoPrimario }]}>
      {/* Header azul */}
      <View style={[styles.header, { backgroundColor: paleta.destaque, paddingTop: insetsChrome.paddingTopConteudo }]}>
        <Text style={styles.headerTitulo}>MISSÕES</Text>
        <TouchableOpacity
          style={[styles.btnNova, { backgroundColor: paleta.fundoCartao, borderColor: "#FFF" }]}
          onPress={() => navigation.navigate(rotas.criarMissao)}
        >
          <Text style={[styles.btnNovaTexto, { color: paleta.textoPrincipal }]}>+ NOVA</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={[styles.filtrosRow, { backgroundColor: paleta.fundoCartao, borderBottomColor: paleta.bordaSuave }]}>
        {abas.map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[
              styles.abaBtn,
              filtro === aba
                ? { backgroundColor: paleta.destaque, borderColor: paleta.destaque }
                : { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave },
            ]}
            onPress={() => setFiltro(aba)}
          >
            <Text style={[styles.abaBtnTexto, { color: filtro === aba ? "#FFF" : paleta.textoSecundario }]}>
              {aba}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: espacamento.md,
          paddingTop: espacamento.sm,
          paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg,
          flexGrow: 1,
        }}
        data={missoesFiltradas}
        keyExtractor={(m) => m.idMissao}
        ListEmptyComponent={
          <View style={styles.vazioWrap}>
            <Text style={[styles.vazioTexto, { color: paleta.textoSecundario }]}>
              {filtro === "FEITAS" ? "Nenhuma missão concluída ainda." : "Nenhuma missão encontrada."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const xp = XP_MAP[item.dificuldadeMissao] || 20;
          return (
            <View style={[styles.questCard, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
              {/* Ícone categoria */}
              <View style={[styles.iconeBox, {
                backgroundColor: (paleta.categorias?.[item.categoriaMissao || "SAÚDE"]?.bg || paleta.destaque) + "22",
                borderColor: paleta.categorias?.[item.categoriaMissao || "SAÚDE"]?.bg || paleta.destaque,
              }]}>
                <Ionicons name="checkmark-done-outline" size={18}
                  color={paleta.categorias?.[item.categoriaMissao || "SAÚDE"]?.bg || paleta.destaque} />
              </View>

              {/* Conteúdo */}
              <View style={styles.questConteudo}>
                <Text
                  style={[
                    styles.questTitulo,
                    { color: paleta.textoPrincipal },
                    item.concluida && { textDecorationLine: "line-through", color: paleta.textoSecundario },
                  ]}
                  numberOfLines={2}
                >
                  {item.tituloMissao}
                </Text>
                <View style={styles.questMeta}>
                  <TagCategoria categoria={item.categoriaMissao || "SAÚDE"} paleta={paleta} />
                  {item.horaMissao ? (
                    <Text style={[styles.questHora, { color: paleta.textoSecundario }]}>{item.horaMissao}</Text>
                  ) : null}
                  <Text style={[styles.questXp, { color: paleta.sucesso }]}>+{xp} XP</Text>
                </View>
              </View>

              {/* Direita: checkbox + lixeira */}
              <View style={styles.questAcoes}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: paleta.bordaSuave },
                    item.concluida && { backgroundColor: paleta.sucesso, borderColor: paleta.sucesso },
                  ]}
                  onPress={() => !item.concluida && concluirMissao(item.idMissao)}
                >
                  {item.concluida && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removerMissao(item.idMissao)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={paleta.alerta} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: espacamento.md, paddingBottom: espacamento.md },
  headerTitulo: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  btnNova: { borderWidth: 2, borderRadius: raio.botao, paddingHorizontal: 10, paddingVertical: 5 },
  btnNovaTexto: { fontSize: tipografia.legenda, fontWeight: "900", letterSpacing: 0.3 },

  // Filtros
  filtrosRow: { flexDirection: "row", gap: espacamento.sm, paddingHorizontal: espacamento.md, paddingVertical: espacamento.sm, borderBottomWidth: 2 },
  abaBtn: { flex: 1, borderWidth: 2, borderRadius: raio.botao, paddingVertical: 6, alignItems: "center" },
  abaBtnTexto: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },

  // Quest card
  questCard: { flexDirection: "row", alignItems: "center", gap: espacamento.sm, borderRadius: raio.cartao, borderWidth: 2, padding: espacamento.sm, marginBottom: espacamento.sm },
  iconeBox: { width: 34, height: 34, borderRadius: raio.cartao, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  questConteudo: { flex: 1 },
  questTitulo: { fontSize: tipografia.corpo, fontWeight: "700", marginBottom: 4 },
  questMeta: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  questHora: { fontSize: 11, fontWeight: "600" },
  questXp: { fontSize: 11, fontWeight: "800" },
  questAcoes: { alignItems: "center", gap: 8 },
  checkbox: { width: 24, height: 24, borderRadius: raio.pill, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tag: { borderRadius: raio.pill, paddingHorizontal: 6, paddingVertical: 2 },
  tagTexto: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },

  // Vazio
  vazioWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  vazioTexto: { fontSize: tipografia.corpo, textAlign: "center" },
});
