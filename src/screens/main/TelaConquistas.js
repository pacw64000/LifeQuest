import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { espacamento, raio, tipografia } from "../constants/layout";

function BadgeCard({ conquista, desbloqueada, paleta }) {
  const corFundo = desbloqueada ? conquista.cor : paleta.bordaSuave;
  const corTexto = desbloqueada ? "#FFFFFF" : paleta.textoSecundario;
  return (
    <View style={[styles.badgeCard, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
      {/* Ícone */}
      <View style={[styles.badgeIconeBox, { backgroundColor: corFundo }]}>
        {desbloqueada ? (
          <Text style={styles.badgeIcone}>{conquista.icone}</Text>
        ) : (
          <Text style={styles.cadeadoIcone}>🔒</Text>
        )}
      </View>
      {/* Título */}
      <Text style={[styles.badgeTitulo, { color: desbloqueada ? paleta.textoPrincipal : paleta.textoSecundario }]}
        numberOfLines={2}>
        {conquista.tituloConquista}
      </Text>
      {/* Descrição */}
      <Text style={[styles.badgeDesc, { color: paleta.textoSecundario }]} numberOfLines={2}>
        {conquista.descricaoConquista}
      </Text>
    </View>
  );
}

export default function TelaConquistas() {
  const { catalogoConquistasPadrao, listaConquistasDesbloqueadas } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const total = catalogoConquistasPadrao.length;
  const desbloqueadas = listaConquistasDesbloqueadas.length;
  const progresso = total > 0 ? desbloqueadas / total : 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{ paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.xl }}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: paleta.destaque, paddingTop: insetsChrome.paddingTopConteudo }]}>
        <Text style={styles.headerTitulo}>CONQUISTAS</Text>
        <Text style={styles.headerSub}>{desbloqueadas} de {total} desbloqueadas</Text>
      </View>

      <View style={styles.corpo}>
        {/* Barra de progresso */}
        <View style={[styles.progressoFundo, { backgroundColor: paleta.bordaSuave }]}>
          <View style={[styles.progressoValor, { width: `${progresso * 100}%`, backgroundColor: paleta.destaqueSecundario }]} />
        </View>

        {/* Grade de badges */}
        <View style={styles.grade}>
          {catalogoConquistasPadrao.map((conquista) => {
            const desbloqueada = listaConquistasDesbloqueadas.includes(conquista.idConquista);
            return (
              <BadgeCard
                key={conquista.idConquista}
                conquista={conquista}
                desbloqueada={desbloqueada}
                paleta={paleta}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  header: { paddingHorizontal: espacamento.md, paddingBottom: espacamento.md },
  headerTitulo: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  corpo: { paddingHorizontal: espacamento.md, paddingTop: espacamento.md },

  progressoFundo: { height: 14, borderRadius: 2, overflow: "hidden", marginBottom: espacamento.md, borderWidth: 2, borderColor: "#C8B89A" },
  progressoValor: { height: "100%", borderRadius: 1 },

  grade: { flexDirection: "row", flexWrap: "wrap", gap: espacamento.sm },

  badgeCard: {
    width: "31%",
    borderRadius: raio.cartao,
    borderWidth: 2,
    padding: espacamento.sm,
    alignItems: "center",
    marginBottom: 2,
  },
  badgeIconeBox: {
    width: 44, height: 44, borderRadius: raio.cartao,
    alignItems: "center", justifyContent: "center",
    marginBottom: espacamento.xs,
  },
  badgeIcone: { fontSize: 24 },
  cadeadoIcone: { fontSize: 20, opacity: 0.6 },
  badgeTitulo: { fontSize: 10, fontWeight: "900", textAlign: "center", letterSpacing: 0.3, marginBottom: 2 },
  badgeDesc: { fontSize: 9, textAlign: "center", lineHeight: 12 },
});
