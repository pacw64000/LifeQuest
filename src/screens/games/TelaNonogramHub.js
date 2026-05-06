import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { useTemaVisual } from "../../context/TemaVisualContext";

const itens = [
  { rota: rotas.nonogramCriar, titulo: "Criar a partir da imagem", descricao: "Envie uma foto e gere o puzzle" },
  { rota: rotas.nonogramComunidade, titulo: "Comunidade", descricao: "Puzzles publicados por outros jogadores" },
  { rota: rotas.nonogramMeus, titulo: "Meus puzzles", descricao: "Puzzles que voce criou neste aparelho" },
  { rota: rotas.nonogramEntrarCodigo, titulo: "Entrar com codigo", descricao: "Digite o codigo compartilhado" },
];

export default function TelaNonogramHub({ navigation }) {
  const { paleta, insetsChrome, tokens } = useTemaVisual();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg,
        paddingHorizontal: tokens.espacamento.md,
      }}
    >
      <TextoApp style={[styles.intro, { color: paleta.textoSecundario }]}>
        Monte nonogramas a partir de fotos, publique com um codigo ou jogue em privado — tudo salvo no aparelho.
      </TextoApp>
      {itens.map((item) => (
        <TouchableOpacity
          key={item.rota}
          style={[styles.cartao, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}
          onPress={() => navigation.navigate(item.rota)}
          activeOpacity={0.78}
        >
          <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>{item.titulo}</TextoApp>
          <TextoApp style={[styles.desc, { color: paleta.textoSecundario }]}>{item.descricao}</TextoApp>
        </TouchableOpacity>
      ))}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  intro: { marginBottom: 16, fontSize: 14, lineHeight: 20 },
  cartao: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  titulo: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  desc: { fontSize: 13 },
});
