import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { nonogramConfig } from "../../config/nonogramConfig";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import { imagemUriParaGrade } from "../../utils/nonogram/imageParaGrade";
import { calcularPontuacaoBaseImagem } from "../../utils/nonogram/pontuacaoNonogram";
import { gerarCodigoCompartilhamentoUnico } from "../../utils/nonogram/codigoCompartilhamento";
import { inserirNonogramPuzzle } from "../../services/local/repositorioNonogram";
import { criarNonogramaPublicoNoFirebase } from "../../services/firebase/repositorioNonogramPublico";

async function novoIdPuzzle() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function TelaNonogramCriar({ navigation }) {
  const { usuarioAutenticado } = useAuth();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const [uriImagem, setUriImagem] = useState(null);
  const [grade, setGrade] = useState(null);
  const [largura, setLargura] = useState(0);
  const [altura, setAltura] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState(nonogramConfig.categorias[0]);
  const [publico, setPublico] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const podePublicar =
    usuarioAutenticado?.idUsuario && usuarioAutenticado?.isGuest === false;

  async function escolherImagem() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissao", "Precisamos acessar suas fotos.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (resultado.canceled || !resultado.assets?.[0]?.uri) return;
    const uri = resultado.assets[0].uri;
    setUriImagem(uri);
    setProcessando(true);
    setGrade(null);
    try {
      const r = await imagemUriParaGrade(uri);
      setGrade(r.grade);
      setLargura(r.largura);
      setAltura(r.altura);
    } catch (e) {
      Alert.alert("Imagem", e?.message || "Nao foi possivel gerar o puzzle.");
      setUriImagem(null);
    } finally {
      setProcessando(false);
    }
  }

  async function salvarPuzzle() {
    if (!grade?.length) {
      Alert.alert("Puzzle", "Escolha uma imagem primeiro.");
      return;
    }
    const t = titulo.trim() || "Sem titulo";
    if (publico && !podePublicar) {
      Alert.alert("Conta", "Faça login para publicar puzzles para outros jogadores.");
      return;
    }

    setSalvando(true);
    try {
      const id = await novoIdPuzzle();
      const pontuacaoBase = calcularPontuacaoBaseImagem(grade);
      let codigoCompartilhamento = null;
      let idFirestore = null;

      if (publico && podePublicar) {
        codigoCompartilhamento = await gerarCodigoCompartilhamentoUnico();
        const { idDoc } = await criarNonogramaPublicoNoFirebase({
          codigoCompartilhamento,
          titulo: t,
          categoria,
          idAutor: usuarioAutenticado.idUsuario,
          nomeAutor: usuarioAutenticado.nomeUsuario || "Jogador",
          largura,
          altura,
          grade,
          pontuacaoBase,
        });
        idFirestore = idDoc;
      }

      await inserirNonogramPuzzle({
        id,
        idUsuario: usuarioAutenticado?.idUsuario ?? null,
        titulo: t,
        categoria,
        visibilidade: publico ? "publico" : "privado",
        codigoCompartilhamento,
        grade,
        largura,
        altura,
        pontuacaoBase,
        idFirestore,
        uriOrigemLocal: uriImagem,
        meta: { visualizacoes: 0, favoritos: 0, recompensaPontos: 0 },
      });

      if (publico && codigoCompartilhamento) {
        Alert.alert("Publicado", `Codigo para compartilhar: ${codigoCompartilhamento}`, [
          { text: "OK", onPress: () => navigation.navigate(rotas.nonogramHub) },
        ]);
      } else {
        Alert.alert("Salvo", "Puzzle guardado neste aparelho (privado).", [
          { text: "OK", onPress: () => navigation.navigate(rotas.nonogramHub) },
        ]);
      }
    } catch (e) {
      Alert.alert("Erro", e?.message || "Nao foi possivel salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + 8,
        paddingBottom: insetsChrome.paddingBottomConteudo + 24,
        paddingHorizontal: tokens.espacamento.md,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TextoApp style={[styles.rotulo, { color: paleta.textoSecundario }]}>Foto</TextoApp>
      <TouchableOpacity
        style={[styles.botao, { backgroundColor: paleta.destaque }]}
        onPress={escolherImagem}
        disabled={processando}
      >
        {processando ? (
          <ActivityIndicator color="#0A1628" />
        ) : (
          <TextoApp style={styles.botaoTextoEscuro}>Escolher imagem da galeria</TextoApp>
        )}
      </TouchableOpacity>

      {grade && (
        <TextoApp style={[styles.prev, { color: paleta.textoSecundario }]}>
          Grade {largura}×{altura} · Base XP estimada: {calcularPontuacaoBaseImagem(grade)}
        </TextoApp>
      )}

      <TextoApp style={[styles.rotulo, { color: paleta.textoSecundario }]}>Titulo</TextoApp>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Nome do puzzle"
        placeholderTextColor={paleta.textoSecundario}
        style={[
          styles.input,
          {
            borderColor: paleta.bordaSuave,
            backgroundColor: paleta.fundoCartao,
            color: paleta.textoPrincipal,
          },
        ]}
      />

      <TextoApp style={[styles.rotulo, { color: paleta.textoSecundario }]}>Categoria</TextoApp>
      <View style={styles.linhaCategorias}>
        {nonogramConfig.categorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              {
                borderColor: paleta.bordaSuave,
                backgroundColor: cat === categoria ? paleta.destaque : paleta.fundoCartao,
              },
            ]}
            onPress={() => setCategoria(cat)}
          >
            <TextoApp
              style={[styles.chipTxt, { color: cat === categoria ? "#0A1628" : paleta.textoPrincipal }]}
            >
              {cat}
            </TextoApp>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.linhaSwitch}>
        <TextoApp style={{ color: paleta.textoPrincipal, flex: 1 }}>
          Disponivel para outros jogadores
        </TextoApp>
        <Switch
          value={publico}
          onValueChange={setPublico}
          disabled={!podePublicar}
          trackColor={{ false: paleta.bordaSuave, true: paleta.destaque }}
        />
      </View>
      {!podePublicar && (
        <TextoApp style={[styles.dica, { color: paleta.textoSecundario }]}>
          Publicar exige conta logada. Modo privado salva só no SQLite deste aparelho.
        </TextoApp>
      )}

      <TouchableOpacity
        style={[styles.botaoSalvar, { backgroundColor: paleta.textoPrincipal }]}
        onPress={salvarPuzzle}
        disabled={salvando || !grade}
      >
        {salvando ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <TextoApp style={styles.botaoSalvarTxt}>Salvar puzzle</TextoApp>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function criarEstilos(tokens) {
  const { espacamento: e, tipografia: tip, raio: r } = tokens;
  return StyleSheet.create({
    scroll: { flex: 1 },
    rotulo: { marginTop: e.md, marginBottom: e.sm, fontSize: tip.legenda },
    botao: {
      paddingVertical: 14,
      borderRadius: r.botao,
      alignItems: "center",
    },
    botaoTextoEscuro: { fontWeight: "700", color: "#0A1628" },
    prev: { marginTop: e.sm, fontSize: tip.legenda },
    input: {
      borderWidth: 1,
      borderRadius: r.botao,
      paddingHorizontal: e.md,
      paddingVertical: 12,
      fontSize: tip.corpo,
    },
    linhaCategorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    chipTxt: { fontSize: 13, fontWeight: "600" },
    linhaSwitch: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: e.lg,
      gap: e.sm,
    },
    dica: { marginTop: e.sm, fontSize: tip.legenda },
    botaoSalvar: {
      marginTop: e.lg,
      paddingVertical: 14,
      borderRadius: r.botao,
      alignItems: "center",
    },
    botaoSalvarTxt: { color: "#FFF", fontWeight: "700" },
  });
}
