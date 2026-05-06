import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import * as Crypto from "expo-crypto";
import TextoApp from "../../components/TextoApp";
import rotas from "../../constants/rotas";
import { useAuth } from "../../context/AuthContext";
import { useTemaVisual } from "../../context/TemaVisualContext";
import { obterNonogramaPublicoPorCodigo } from "../../services/firebase/repositorioNonogramPublico";
import {
  inserirNonogramPuzzle,
  obterNonogramPuzzlePorIdFirestore,
} from "../../services/local/repositorioNonogram";

async function novoIdPuzzle() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function TelaNonogramEntrarCodigo({ navigation }) {
  const { usuarioAutenticado } = useAuth();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscarEAbrir() {
    const c = codigo.trim().toUpperCase();
    if (c.length < 4) {
      Alert.alert("Codigo", "Digite o codigo compartilhado.");
      return;
    }
    setCarregando(true);
    try {
      const remoto = await obterNonogramaPublicoPorCodigo(c);
      if (!remoto) {
        Alert.alert("Codigo", "Nenhum puzzle encontrado com este codigo.");
        return;
      }
      let local = await obterNonogramPuzzlePorIdFirestore(remoto.idDoc);
      let idPuzzle;
      if (!local) {
        idPuzzle = await novoIdPuzzle();
        await inserirNonogramPuzzle({
          id: idPuzzle,
          idUsuario: usuarioAutenticado?.idUsuario ?? null,
          titulo: remoto.titulo,
          categoria: remoto.categoria,
          visibilidade: "publico",
          codigoCompartilhamento: remoto.codigoCompartilhamento,
          grade: remoto.grade,
          largura: remoto.largura,
          altura: remoto.altura,
          pontuacaoBase: remoto.pontuacaoBase,
          idFirestore: remoto.idDoc,
          meta: { origemCatalogo: true, visualizacoes: 0, favoritos: 0, recompensaPontos: 0 },
        });
      } else {
        idPuzzle = local.id;
      }
      navigation.navigate(rotas.jogoNonogram, { idPuzzle, tituloPuzzle: remoto.titulo });
    } catch (e) {
      Alert.alert("Erro", e?.message || "Falha ao buscar puzzle.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: paleta.fundoPrimario,
          paddingTop: insetsChrome.paddingTopConteudo + 16,
          paddingBottom: insetsChrome.paddingBottomConteudo + 16,
          paddingHorizontal: tokens.espacamento.md,
        },
      ]}
    >
      <TextoApp style={[styles.label, { color: paleta.textoSecundario }]}>Codigo de 6 caracteres</TextoApp>
      <TextInput
        value={codigo}
        onChangeText={(t) => setCodigo(t.toUpperCase())}
        autoCapitalize="characters"
        maxLength={8}
        placeholder="ABC123"
        placeholderTextColor={paleta.textoSecundario}
        editable={!carregando}
        style={[
          styles.input,
          {
            borderColor: paleta.bordaSuave,
            backgroundColor: paleta.fundoCartao,
            color: paleta.textoPrincipal,
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.botao, { backgroundColor: paleta.destaque, opacity: carregando ? 0.6 : 1 }]}
        onPress={buscarEAbrir}
        disabled={carregando}
      >
        <TextoApp style={styles.botaoTxt}>Abrir puzzle</TextoApp>
      </TouchableOpacity>
    </View>
  );
}

function criarEstilos(tokens) {
  const { espacamento: e, raio: r, tipografia: tip } = tokens;
  return StyleSheet.create({
    container: { flex: 1 },
    label: { marginBottom: e.sm, fontSize: tip.legenda },
    input: {
      borderWidth: 1,
      borderRadius: r.botao,
      paddingHorizontal: e.md,
      paddingVertical: 14,
      fontSize: 18,
      letterSpacing: 2,
      fontWeight: "700",
      marginBottom: e.lg,
    },
    botao: {
      paddingVertical: 14,
      borderRadius: r.botao,
      alignItems: "center",
    },
    botaoTxt: { fontWeight: "700", color: "#0A1628" },
  });
}
