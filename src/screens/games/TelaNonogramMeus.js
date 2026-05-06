import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import { listarNonogramPuzzlesDoUsuario } from "../../services/local/repositorioNonogram";

export default function TelaNonogramMeus({ navigation }) {
  const { usuarioAutenticado } = useAuth();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const [lista, setLista] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    const uid = usuarioAutenticado?.idUsuario;
    if (!uid) {
      setLista([]);
      return;
    }
    const todos = await listarNonogramPuzzlesDoUsuario(uid);
    const apenasAutorais = todos.filter((p) => !p.meta?.origemCatalogo);
    setLista(apenasAutorais);
    setRefreshing(false);
  }, [usuarioAutenticado?.idUsuario]);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  function abrir(p) {
    navigation.navigate(rotas.jogoNonogram, { idPuzzle: p.id, tituloPuzzle: p.titulo });
  }

  function placar(p) {
    navigation.navigate(rotas.nonogramLeaderboard, {
      idPuzzle: p.id,
      idFirestore: p.idFirestore,
      tituloPuzzle: p.titulo,
    });
  }

  if (!usuarioAutenticado?.idUsuario) {
    return (
      <View
        style={[
          styles.emptyWrap,
          {
            backgroundColor: paleta.fundoPrimario,
            paddingTop: insetsChrome.paddingTopConteudo + 24,
            paddingHorizontal: tokens.espacamento.md,
          },
        ]}
      >
        <TextoApp style={{ color: paleta.textoSecundario }}>
          Entre com uma conta para listar puzzles criados neste aparelho.
        </TextoApp>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + 8,
        paddingBottom: insetsChrome.paddingBottomConteudo + 24,
        paddingHorizontal: tokens.espacamento.md,
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />}
    >
      {lista.length === 0 ? (
        <TextoApp style={{ color: paleta.textoSecundario }}>Nenhum puzzle seu ainda. Crie um na opcao anterior.</TextoApp>
      ) : (
        lista.map((p) => (
          <View
            key={p.id}
            style={[styles.cartao, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
          >
            <TouchableOpacity onPress={() => abrir(p)}>
              <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>{p.titulo}</TextoApp>
              <TextoApp style={[styles.meta, { color: paleta.textoSecundario }]}>
                {p.categoria} · {p.largura}×{p.altura} · {p.visibilidade === "publico" ? `codigo ${p.codigoCompartilhamento || ""}` : "privado"}
              </TextoApp>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.linkPlacar, { borderColor: paleta.bordaSuave }]} onPress={() => placar(p)}>
              <TextoApp style={{ color: paleta.destaque, fontWeight: "600" }}>Ver placar</TextoApp>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function criarEstilos(tokens) {
  const { espacamento: e, raio: r } = tokens;
  return StyleSheet.create({
    scroll: { flex: 1 },
    emptyWrap: { flex: 1 },
    cartao: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
    },
    titulo: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
    meta: { fontSize: 13 },
    linkPlacar: {
      marginTop: e.sm,
      paddingVertical: 8,
      alignItems: "center",
      borderTopWidth: 1,
    },
  });
}
