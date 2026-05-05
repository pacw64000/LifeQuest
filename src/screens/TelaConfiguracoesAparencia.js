import React, { useEffect, useMemo, useState } from "react";
import {
  View,
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
import TextoApp from "../components/TextoApp";
import FaixasDeCores from "../components/FaixasDeCores";
import { normalizarHex } from "../utils/gerarPaletaTema";
import { copiarImagemRodapeParaDocumentos } from "../services/aparencia/copiarImagemRodapeLocal";
import {
  ESTETICA_COSMICO,
  ESTETICA_PIXEL,
  ESCALA_FONTE_MIN,
  ESCALA_FONTE_MAX,
  ESCALA_FONTE_PASSO,
  normalizarEscalaFonte,
  fonteEscalada,
} from "../theme";

const PRESETS = ["#26D0CE", "#F4C15A", "#6C5CE7", "#0984E3", "#00B894", "#E17055", "#A29BFE", "#D63031"];

function criarEstilos(tokens) {
  const { espacamento: e, tipografia: tip, raio: r } = tokens;
  return StyleSheet.create({
    scroll: { flex: 1 },
    voltar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: e.md },
    voltarTexto: { fontSize: tip.corpo, fontWeight: "600" },
    titulo: { fontSize: tip.tituloHero, fontWeight: "800", marginBottom: 4 },
    sub: { marginBottom: e.lg },
    previewRow: { flexDirection: "row", gap: e.md, marginBottom: e.lg },
    previewBox: { flex: 1 },
    previewLabel: { fontSize: tip.legenda, marginBottom: 6 },
    previewGradient: { height: 56, borderRadius: r.cartao },
    previewImagem: { height: 56, borderRadius: r.cartao, width: "100%" },
    secao: { fontSize: tip.tituloSecao, fontWeight: "700", marginTop: e.md, marginBottom: e.sm },
    presetRow: { flexDirection: "row", flexWrap: "wrap", gap: e.sm, marginBottom: e.md },
    swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "transparent" },
    label: { marginBottom: 6, fontSize: tip.legenda },
    linhaHex: { gap: e.sm, marginBottom: e.md },
    inputHex: {
      borderWidth: 1,
      borderRadius: r.botao,
      paddingHorizontal: e.md,
      paddingVertical: 12,
      marginBottom: e.sm,
    },
    linhaEscalaFonte: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: e.md,
      marginBottom: e.md,
    },
    botaoEscala: {
      width: 48,
      height: 48,
      borderRadius: r.botao,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    botaoEscalaDesabilitado: { opacity: 0.35 },
    valorEscala: { fontSize: 20, fontWeight: "800", minWidth: 56, textAlign: "center" },
    modoRow: { flexDirection: "row", gap: e.sm, marginBottom: e.md },
    modoBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: r.botao,
      borderWidth: 1,
      alignItems: "center",
    },
    modoBtnTexto: { fontWeight: "700" },
  });
}

export default function TelaConfiguracoesAparencia({ navigation }) {
  const { preferencias, paleta, salvarPreferencias, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);
  const fontCampo = tokens.fontFamilyTexto ? { fontFamily: tokens.fontFamilyTexto } : null;
  const escalaFonteAtual = normalizarEscalaFonte(preferencias.escalaFonte);
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
      Alert.alert("Cor invalida", "Use um hex como #26D0CE.");
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
        paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.xl,
        paddingHorizontal: tokens.espacamento.md,
      }}
    >
      <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={paleta.textoPrincipal} />
        <TextoApp style={[styles.voltarTexto, { color: paleta.textoPrincipal }]}>Voltar</TextoApp>
      </TouchableOpacity>

      <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>Aparência</TextoApp>
      <TextoApp style={[styles.sub, { color: paleta.textoSecundario }]}>Pre-visualizacao do header e rodape</TextoApp>

      <View style={styles.previewRow}>
        <View style={styles.previewBox}>
          <TextoApp style={[styles.previewLabel, { color: paleta.textoSecundario }]}>Header</TextoApp>
          {preferencias.estetica === ESTETICA_PIXEL ? (
            <View style={[styles.previewGradient, { overflow: "hidden" }]}>
              <FaixasDeCores cores={paleta.headerGradient} style={StyleSheet.absoluteFillObject} />
            </View>
          ) : (
            <LinearGradient colors={paleta.headerGradient} style={styles.previewGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          )}
        </View>
        <View style={styles.previewBox}>
          <TextoApp style={[styles.previewLabel, { color: paleta.textoSecundario }]}>Rodape</TextoApp>
          {preferencias.modoRodape === "imagem" && preferencias.uriImagemRodape ? (
            <Image source={{ uri: preferencias.uriImagemRodape }} style={styles.previewImagem} resizeMode="cover" />
          ) : preferencias.estetica === ESTETICA_PIXEL ? (
            <View style={[styles.previewGradient, { overflow: "hidden" }]}>
              <FaixasDeCores cores={paleta.footerGradient} style={StyleSheet.absoluteFillObject} />
            </View>
          ) : (
            <LinearGradient colors={paleta.footerGradient} style={styles.previewGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          )}
        </View>
      </View>

      <TextoApp style={[styles.secao, { color: paleta.textoPrincipal }]}>Estetica</TextoApp>
      <View style={styles.modoRow}>
        <TouchableOpacity
          style={[
            styles.modoBtn,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            preferencias.estetica === ESTETICA_COSMICO && {
              borderColor: paleta.destaque,
              backgroundColor: `${paleta.destaque}22`,
            },
          ]}
          onPress={() => salvarPreferencias({ estetica: ESTETICA_COSMICO })}
        >
          <TextoApp style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Cosmico</TextoApp>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modoBtn,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            preferencias.estetica === ESTETICA_PIXEL && {
              borderColor: paleta.destaque,
              backgroundColor: `${paleta.destaque}22`,
            },
          ]}
          onPress={() => salvarPreferencias({ estetica: ESTETICA_PIXEL })}
        >
          <TextoApp style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Pixel</TextoApp>
        </TouchableOpacity>
      </View>

      <TextoApp style={[styles.secao, { color: paleta.textoPrincipal }]}>Tamanho do texto</TextoApp>
      <TextoApp style={[styles.label, { color: paleta.textoSecundario }]}>
        Ajuste para leitura (afeta textos e campos)
      </TextoApp>
      <View style={styles.linhaEscalaFonte}>
        <TouchableOpacity
          style={[
            styles.botaoEscala,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            escalaFonteAtual <= ESCALA_FONTE_MIN && styles.botaoEscalaDesabilitado,
          ]}
          onPress={() =>
            salvarPreferencias({
              escalaFonte: normalizarEscalaFonte(escalaFonteAtual - ESCALA_FONTE_PASSO),
            })
          }
          disabled={escalaFonteAtual <= ESCALA_FONTE_MIN}
        >
          <Ionicons name="remove" size={22} color={paleta.textoPrincipal} />
        </TouchableOpacity>
        <TextoApp style={[styles.valorEscala, { color: paleta.textoPrincipal }]}>
          {Math.round(escalaFonteAtual * 100)}%
        </TextoApp>
        <TouchableOpacity
          style={[
            styles.botaoEscala,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            escalaFonteAtual >= ESCALA_FONTE_MAX && styles.botaoEscalaDesabilitado,
          ]}
          onPress={() =>
            salvarPreferencias({
              escalaFonte: normalizarEscalaFonte(escalaFonteAtual + ESCALA_FONTE_PASSO),
            })
          }
          disabled={escalaFonteAtual >= ESCALA_FONTE_MAX}
        >
          <Ionicons name="add" size={22} color={paleta.textoPrincipal} />
        </TouchableOpacity>
      </View>

      <TextoApp style={[styles.secao, { color: paleta.textoPrincipal }]}>Cor principal</TextoApp>
      <View style={styles.presetRow}>
        {PRESETS.map((cor) => (
          <TouchableOpacity
            key={cor}
            style={[
              styles.swatch,
              { backgroundColor: cor },
              preferencias.corPrimaria === cor && { borderColor: paleta.destaqueSecundario, borderWidth: 3 },
            ]}
            onPress={() => {
              setHexTexto(cor);
              salvarPreferencias({ corPrimaria: cor });
            }}
          />
        ))}
      </View>

      <TextoApp style={[styles.label, { color: paleta.textoSecundario }]}>Hex personalizado</TextoApp>
      <View style={styles.linhaHex}>
        <TextInput
          style={[
            styles.inputHex,
            {
              borderColor: paleta.bordaSuave,
              color: paleta.textoPrincipal,
              backgroundColor: paleta.fundoCartao,
              fontSize: fonteEscalada(tokens.tipografia.corpo, tokens.escalaFonte),
            },
            fontCampo,
          ]}
          value={hexTexto}
          onChangeText={setHexTexto}
          autoCapitalize="characters"
          placeholder="#26D0CE"
          placeholderTextColor={paleta.textoSecundario}
        />
        <BotaoPrimario tituloBotao="Aplicar" onPress={aplicarCorPrimaria} />
      </View>

      <TextoApp style={[styles.secao, { color: paleta.textoPrincipal }]}>Rodape</TextoApp>
      <View style={styles.modoRow}>
        <TouchableOpacity
          style={[
            styles.modoBtn,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            preferencias.modoRodape === "gradiente" && {
              borderColor: paleta.destaque,
              backgroundColor: `${paleta.destaque}22`,
            },
          ]}
          onPress={() => salvarPreferencias({ modoRodape: "gradiente" })}
        >
          <TextoApp style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Gradiente</TextoApp>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modoBtn,
            { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao },
            preferencias.modoRodape === "imagem" && {
              borderColor: paleta.destaque,
              backgroundColor: `${paleta.destaque}22`,
            },
          ]}
          onPress={() => salvarPreferencias({ modoRodape: "imagem" })}
        >
          <TextoApp style={[styles.modoBtnTexto, { color: paleta.textoPrincipal }]}>Imagem</TextoApp>
        </TouchableOpacity>
      </View>

      <TextoApp style={[styles.label, { color: paleta.textoSecundario }]}>Segunda cor do gradiente do rodape (opcional)</TextoApp>
      <View style={styles.linhaHex}>
        <TextInput
          style={[
            styles.inputHex,
            {
              borderColor: paleta.bordaSuave,
              color: paleta.textoPrincipal,
              backgroundColor: paleta.fundoCartao,
              fontSize: fonteEscalada(tokens.tipografia.corpo, tokens.escalaFonte),
            },
            fontCampo,
          ]}
          value={hexRodapeFim}
          onChangeText={setHexRodapeFim}
          autoCapitalize="characters"
          placeholder="Vazio = automatico"
          placeholderTextColor={paleta.textoSecundario}
        />
        <BotaoPrimario tituloBotao="Aplicar" onPress={aplicarCorRodapeFim} />
      </View>

      {preferencias.modoRodape === "imagem" ? (
        <View style={{ marginTop: tokens.espacamento.md }}>
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
