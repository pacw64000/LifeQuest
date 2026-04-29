import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTemaVisual } from "../context/TemaVisualContext";
import BotaoPrimario from "../components/BotaoPrimario";
import { normalizarHex } from "../utils/gerarPaletaTema";
import { copiarImagemRodapeParaDocumentos } from "../services/aparencia/copiarImagemRodapeLocal";
import { espacamento, raio, tipografia } from "../constants/layout";

const PRESETS = ["#6C5CE7", "#0984E3", "#00B894", "#E17055", "#A29BFE", "#2D3436", "#D63031", "#FDCB6E"];

export default function TelaConfiguracoesAparencia({ navigation }) {
  const { preferencias, paleta, salvarPreferencias, insetsChrome } = useTemaVisual();
  const [hexTexto, setHexTexto] = useState(preferencias.corPrimaria);
  const [hexRodapeFim, setHexRodapeFim] = useState(preferencias.corRodapeFim || "");
  const [carregandoImagem, setCarregandoImagem] = useState(false);

  useEffect(() => {
    setHexTexto(preferencias.corPrimaria);
    setHexRodapeFim(preferencias.corRodapeFim || "");
  }, [preferencias.corPrimaria, preferencias.corRodapeFim]);

  async function escolherImagemRodape() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissao", "Precisamos acessar suas fotos para usar uma imagem no rodape.");
      return;
    }
    setCarregandoImagem(true);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 5],
        quality: 0.85,
      });
      if (resultado.canceled || !resultado.assets?.[0]?.uri) {
        return;
      }
      const uriPersistente = await copiarImagemRodapeParaDocumentos(resultado.assets[0].uri);
      await salvarPreferencias({ modoRodape: "imagem", uriImagemRodape: uriPersistente });
    } catch (e) {
      Alert.alert("Erro", "Nao foi possivel salvar a imagem do rodape.");
    } finally {
      setCarregandoImagem(false);
    }
  }

  async function aplicarCorPrimaria() {
    const cor = normalizarHex(hexTexto);
    if (cor.length !== 7) {
      Alert.alert("Cor invalida", "Use um hex como #6C5CE7.");
      return;
    }
    await salvarPreferencias({ corPrimaria: cor });
  }

  async function aplicarCorRodapeFim() {
    const t = hexRodapeFim.trim();
    if (!t) {
      await salvarPreferencias({ corRodapeFim: null });
      return;
    }
    try {
      await salvarPreferencias({ corRodapeFim: normalizarHex(t) });
    } catch (e) {
      Alert.alert("Cor invalida", "Use um hex valido ou deixe vazio.");
    }
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.xl,
        paddingHorizontal: espacamento.md,
      }}
    >
      <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={paleta.textoPrincipal} />
        <Text style={[styles.voltarTexto, { color: paleta.textoPrincipal }]}>Voltar</Text>
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: paleta.textoPrincipal }]}>Aparência</Text>
      <Text style={[styles.sub, { color: paleta.textoSecundario }]}>Pre-visualizacao do header e rodape</Text>

      <View style={styles.previewRow}>
        <View style={styles.previewBox}>
          <Text style={[styles.previewLabel, { color: paleta.textoSecundario }]}>Header</Text>
          <LinearGradient colors={paleta.headerGradient} style={styles.previewGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        </View>
        <View style={styles.previewBox}>
          <Text style={[styles.previewLabel, { color: paleta.textoSecundario }]}>Rodape</Text>
          {preferencias.modoRodape === "imagem" && preferencias.uriImagemRodape ? (
            <Image source={{ uri: preferencias.uriImagemRodape }} style={styles.previewImagem} resizeMode="cover" />
          ) : (
            <LinearGradient colors={paleta.footerGradient} style={styles.previewGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          )}
        </View>
      </View>

      <Text style={[styles.secao, { color: paleta.textoPrincipal }]}>Cor principal</Text>
      <View style={styles.presetRow}>
        {PRESETS.map((cor) => (
          <TouchableOpacity
            key={cor}
            style={[styles.swatch, { backgroundColor: cor }, preferencias.corPrimaria === cor && styles.swatchAtivo]}
            onPress={() => {
              setHexTexto(cor);
              salvarPreferencias({ corPrimaria: cor });
            }}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: paleta.textoSecundario }]}>Hex personalizado</Text>
      <View style={styles.linhaHex}>
        <TextInput
          style={[styles.inputHex, { borderColor: paleta.bordaSuave, color: paleta.textoPrincipal, backgroundColor: paleta.fundoCartao }]}
          value={hexTexto}
          onChangeText={setHexTexto}
          autoCapitalize="characters"
          placeholder="#6C5CE7"
          placeholderTextColor={paleta.textoSecundario}
        />
        <BotaoPrimario tituloBotao="Aplicar" onPress={aplicarCorPrimaria} />
      </View>

      <Text style={[styles.secao, { color: paleta.textoPrincipal }]}>Rodape</Text>
      <View style={styles.modoRow}>
        <TouchableOpacity
          style={[styles.modoBtn, preferencias.modoRodape === "gradiente" && styles.modoBtnAtivo]}
          onPress={() => salvarPreferencias({ modoRodape: "gradiente" })}
        >
          <Text style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Gradiente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modoBtn, preferencias.modoRodape === "imagem" && styles.modoBtnAtivo]}
          onPress={() => salvarPreferencias({ modoRodape: "imagem" })}
        >
          <Text style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Imagem</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: paleta.textoSecundario }]}>Segunda cor do gradiente do rodape (opcional)</Text>
      <View style={styles.linhaHex}>
        <TextInput
          style={[styles.inputHex, { borderColor: paleta.bordaSuave, color: paleta.textoPrincipal, backgroundColor: paleta.fundoCartao }]}
          value={hexRodapeFim}
          onChangeText={setHexRodapeFim}
          autoCapitalize="characters"
          placeholder="Vazio = automatico"
          placeholderTextColor={paleta.textoSecundario}
        />
        <BotaoPrimario tituloBotao="Aplicar" onPress={aplicarCorRodapeFim} />
      </View>

      {preferencias.modoRodape === "imagem" ? (
        <View style={{ marginTop: espacamento.md }}>
          {carregandoImagem ? (
            <ActivityIndicator color={paleta.destaque} />
          ) : (
            <BotaoPrimario tituloBotao="Escolher imagem do rodape" onPress={escolherImagemRodape} />
          )}
          {preferencias.uriImagemRodape ? (
            <BotaoPrimario
              tituloBotao="Remover imagem (voltar ao gradiente)"
              onPress={() => salvarPreferencias({ uriImagemRodape: null, modoRodape: "gradiente" })}
            />
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  voltar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: espacamento.md },
  voltarTexto: { fontSize: tipografia.corpo, fontWeight: "600" },
  titulo: { fontSize: tipografia.tituloHero, fontWeight: "800", marginBottom: 4 },
  sub: { marginBottom: espacamento.lg },
  previewRow: { flexDirection: "row", gap: espacamento.md, marginBottom: espacamento.lg },
  previewBox: { flex: 1 },
  previewLabel: { fontSize: tipografia.legenda, marginBottom: 6 },
  previewGradient: { height: 56, borderRadius: raio.cartao },
  previewImagem: { height: 56, borderRadius: raio.cartao, width: "100%" },
  secao: { fontSize: tipografia.tituloSecao, fontWeight: "700", marginTop: espacamento.md, marginBottom: espacamento.sm },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: espacamento.sm, marginBottom: espacamento.md },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "transparent" },
  swatchAtivo: { borderColor: "#000" },
  label: { marginBottom: 6, fontSize: tipografia.legenda },
  linhaHex: { gap: espacamento.sm, marginBottom: espacamento.md },
  inputHex: {
    borderWidth: 1,
    borderRadius: raio.botao,
    paddingHorizontal: espacamento.md,
    paddingVertical: 12,
    fontSize: tipografia.corpo,
    marginBottom: espacamento.sm,
  },
  modoRow: { flexDirection: "row", gap: espacamento.sm, marginBottom: espacamento.md },
  modoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: raio.botao,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modoBtnAtivo: { borderColor: "#6C5CE7", backgroundColor: "rgba(108,92,231,0.12)" },
  modoBtnTexto: { fontWeight: "700" },
});
