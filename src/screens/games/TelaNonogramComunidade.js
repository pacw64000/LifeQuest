import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Crypto from "expo-crypto";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { nonogramConfig } from "../../config/nonogramConfig";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import {
  incrementarVisualizacaoNonogramaPublico,
  listarNonogramasPublicos,
} from "../../services/firebase/repositorioNonogramPublico";
import {
  inserirNonogramPuzzle,
  obterNonogramPuzzlePorIdFirestore,
} from "../../services/local/repositorioNonogram";

async function novoIdPuzzle() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function TelaNonogramComunidade({ navigation }) {
  const { usuarioAutenticado } = useAuth();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const [filtro, setFiltro] = useState("recentes");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chips = useMemo(() => {
    const f = nonogramConfig.filtrosComunidade;
    return [
      { id: "recentes", rotulo: f.recentes.rotulo },
      { id: "visualizacoes", rotulo: f.visualizacoes.rotulo, emBreve: f.visualizacoes.emBreve },
      { id: "favoritos", rotulo: f.favoritos.rotulo, emBreve: f.favoritos.emBreve },
      { id: "recompensas", rotulo: f.recompensas.rotulo, emBreve: f.recompensas.emBreve },
    ];
  }, []);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarNonogramasPublicos(filtro === "recentes" ? "recentes" : filtro, 50);
      setLista(dados);
    } catch (e) {
      Alert.alert("Nuvem", e?.message || "Nao foi possivel carregar a lista.");
      setLista([]);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [filtro]);

  React.useEffect(() => {
    setCarregando(true);
    carregar();
  }, [carregar]);

  async function abrirItem(item) {
    try {
      let local = await obterNonogramPuzzlePorIdFirestore(item.idDoc);
      let idPuzzle;
      if (!local) {
        idPuzzle = await novoIdPuzzle();
        await inserirNonogramPuzzle({
          id: idPuzzle,
          idUsuario: usuarioAutenticado?.idUsuario ?? null,
          titulo: item.titulo,
          categoria: item.categoria,
          visibilidade: "publico",
          codigoCompartilhamento: item.codigoCompartilhamento,
          grade: item.grade,
          largura: item.largura,
          altura: item.altura,
          pontuacaoBase: item.pontuacaoBase,
          idFirestore: item.idDoc,
          meta: { origemCatalogo: true, visualizacoes: 0, favoritos: 0, recompensaPontos: 0 },
        });
      } else {
        idPuzzle = local.id;
      }
      incrementarVisualizacaoNonogramaPublico(item.idDoc).catch(() => {});
      navigation.navigate(rotas.jogoNonogram, {
        idPuzzle,
        tituloPuzzle: item.titulo,
      });
    } catch (e) {
      Alert.alert("Erro", e?.message || "Nao foi possivel abrir o puzzle.");
    }
  }

  function aoEscolherChip(id) {
    const chip = chips.find((c) => c.id === id);
    if (chip?.emBreve) {
      Alert.alert("Em breve", "Este filtro sera habilitado em uma versao futura.");
      return;
    }
    setFiltro(id);
  }

  return (
    <View style={[styles.raiz, { backgroundColor: paleta.fundoPrimario }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={{
          paddingHorizontal: tokens.espacamento.md,
          paddingTop: insetsChrome.paddingTopConteudo + 8,
          gap: 8,
        }}
      >
        {chips.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.chip,
              {
                borderColor: paleta.bordaSuave,
                backgroundColor: filtro === c.id ? paleta.destaque : paleta.fundoCartao,
              },
            ]}
            onPress={() => aoEscolherChip(c.id)}
          >
            <TextoApp
              style={{
                color: filtro === c.id ? "#0A1628" : paleta.textoPrincipal,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {c.rotulo}
              {c.emBreve ? " · " : ""}
            </TextoApp>
            {c.emBreve ? (
              <TextoApp style={{ color: paleta.textoSecundario, fontSize: 11 }}>(breve)</TextoApp>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={paleta.destaque} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: tokens.espacamento.md,
            paddingBottom: insetsChrome.paddingBottomConteudo + 24,
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />}
        >
          {lista.length === 0 ? (
            <TextoApp style={{ color: paleta.textoSecundario, marginTop: 16 }}>
              Nenhum puzzle publico encontrado.
            </TextoApp>
          ) : (
            lista.map((item) => (
              <TouchableOpacity
                key={item.idDoc}
                style={[styles.cartao, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
                onPress={() => abrirItem(item)}
              >
                <TextoApp style={[styles.tituloCartao, { color: paleta.textoPrincipal }]}>{item.titulo}</TextoApp>
                <TextoApp style={[styles.metaCartao, { color: paleta.textoSecundario }]}>
                  {item.categoria} · {item.largura}×{item.altura} · codigo {item.codigoCompartilhamento}
                </TextoApp>
                <TextoApp style={[styles.autorCartao, { color: paleta.textoSecundario }]}>
                  Por {item.nomeAutor || "Anonimo"}
                </TextoApp>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function criarEstilos(tokens) {
  const { espacamento: e, raio: r } = tokens;
  return StyleSheet.create({
    raiz: { flex: 1 },
    chipsScroll: { maxHeight: 52 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
    },
    cartao: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
    },
    tituloCartao: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
    metaCartao: { fontSize: 13 },
    autorCartao: { fontSize: 12, marginTop: 6 },
  });
}
