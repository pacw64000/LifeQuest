import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDadosApp, CATEGORIAS_MISSAO } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { agendarLembreteMissao } from "../services/servicoNotificacoes";
import { espacamento, raio, tipografia } from "../constants/layout";
import { fetchMissionsFromGemini } from "../services/gemini.js";

export default function TelaCriarMissao({ navigation }) {
  const { criarMissao } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const [tituloMissao, setTituloMissao]             = useState("");
  const [descricaoMissao, setDescricaoMissao]       = useState("");
  const [dificuldadeMissao, setDificuldadeMissao]   = useState("facil");
  const [categoriaMissao, setCategoriaMissao]       = useState("SAÚDE");
  const [horaMissao, setHoraMissao]                 = useState("");
  const [segundosTexto, setSegundosTexto]           = useState("0");
  const [temaAleatorio, setTemaAleatorio]           = useState("aleatório");
  const [carregando, setCarregando]                 = useState(false);

  async function salvar(aleatorio = false) {
    if (aleatorio) {
      setCarregando(true);
      try {
        const dados = await fetchMissionsFromGemini(temaAleatorio, dificuldadeMissao);
        criarMissao({
          tituloMissao: dados.tituloMissao,
          descricaoMissao: dados.descricaoMissao,
          dificuldadeMissao: dados.dificuldadeMissao || dificuldadeMissao,
          categoriaMissao,
          horaMissao,
          segundosLembrete: dados.segundosLembrete || 0,
        });
        navigation.goBack();
      } catch (e) {
        Alert.alert("Erro", "Não foi possível gerar missão. Tente novamente.");
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (!tituloMissao.trim()) { Alert.alert("Missão inválida", "Informe um título."); return; }
    const segundosLembrete = Number(segundosTexto || "0");
    const novaMissao = criarMissao({ tituloMissao: tituloMissao.trim(), descricaoMissao: descricaoMissao.trim(), dificuldadeMissao, categoriaMissao, horaMissao, segundosLembrete });
    if (segundosLembrete > 0) await agendarLembreteMissao({ idMissao: novaMissao.idMissao, tituloMissao: novaMissao.tituloMissao, segundosParaLembrar: segundosLembrete });
    navigation.goBack();
  }

  const inputStyle = [styles.input, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao, color: paleta.textoPrincipal }];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{ paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm, paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg, paddingHorizontal: espacamento.md }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.titulo, { color: paleta.textoPrincipal }]}>NOVA MISSÃO</Text>

      {/* Título */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>TÍTULO</Text>
      <TextInput style={inputStyle} placeholder="Ex: Beber 2L de água" placeholderTextColor={paleta.textoSecundario} value={tituloMissao} onChangeText={setTituloMissao} />

      {/* Descrição */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>DESCRIÇÃO</Text>
      <TextInput style={[inputStyle, styles.inputMulti]} placeholder="Detalhes da missão..." placeholderTextColor={paleta.textoSecundario} value={descricaoMissao} onChangeText={setDescricaoMissao} multiline />

      {/* Hora */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>HORÁRIO (opcional)</Text>
      <TextInput style={inputStyle} placeholder="Ex: 08:00" placeholderTextColor={paleta.textoSecundario} value={horaMissao} onChangeText={setHoraMissao} />

      {/* Categoria */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>CATEGORIA</Text>
      <View style={styles.selectorRow}>
        {CATEGORIAS_MISSAO.map((cat) => {
          const corCat = paleta.categorias?.[cat] || { bg: paleta.destaque, text: "#FFF" };
          const ativo = categoriaMissao === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, { borderColor: ativo ? corCat.bg : paleta.bordaSuave, backgroundColor: ativo ? corCat.bg : paleta.fundoCartao }]}
              onPress={() => setCategoriaMissao(cat)}
            >
              <Text style={[styles.catBtnTexto, { color: ativo ? corCat.text : paleta.textoSecundario }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dificuldade */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>DIFICULDADE</Text>
      <View style={styles.selectorRow}>
        {[{ v: "facil", l: "FÁCIL (+15 XP)" }, { v: "media", l: "MÉDIA (+30 XP)" }, { v: "dificil", l: "DIFÍCIL (+50 XP)" }].map(({ v, l }) => (
          <TouchableOpacity
            key={v}
            style={[styles.difBtn, { borderColor: dificuldadeMissao === v ? paleta.destaque : paleta.bordaSuave, backgroundColor: dificuldadeMissao === v ? paleta.destaque : paleta.fundoCartao }]}
            onPress={() => setDificuldadeMissao(v)}
          >
            <Text style={[styles.difBtnTexto, { color: dificuldadeMissao === v ? "#FFF" : paleta.textoSecundario }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lembrete */}
      <Text style={[styles.label, { color: paleta.textoSecundario }]}>LEMBRETE EM SEGUNDOS (0 = desativado)</Text>
      <TextInput style={inputStyle} placeholder="0" placeholderTextColor={paleta.textoSecundario} value={segundosTexto} onChangeText={setSegundosTexto} keyboardType="numeric" />

      {/* Botões */}
      <TouchableOpacity style={[styles.btn, { backgroundColor: paleta.destaque }]} onPress={() => salvar(false)}>
        <Text style={styles.btnTexto}>SALVAR MISSÃO</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: paleta.textoSecundario, marginTop: espacamento.md }]}>TEMA PARA MISSÃO ALEATÓRIA</Text>
      <TextInput style={inputStyle} placeholder="Ex: saúde, estudos, fitness..." placeholderTextColor={paleta.textoSecundario} value={temaAleatorio} onChangeText={setTemaAleatorio} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: paleta.destaqueSecundario }]} onPress={() => salvar(true)} disabled={carregando}>
        <Text style={[styles.btnTexto, { color: "#1A0A04" }]}>{carregando ? "GERANDO..." : "✨ MISSÃO ALEATÓRIA"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  titulo: { fontSize: 20, fontWeight: "900", letterSpacing: 1, marginBottom: espacamento.md },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4, marginTop: espacamento.sm },
  input: { borderWidth: 2, borderRadius: raio.botao, padding: 12, marginBottom: 4, fontSize: tipografia.corpo },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  selectorRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  catBtn: { borderWidth: 2, borderRadius: raio.pill, paddingHorizontal: 10, paddingVertical: 5 },
  catBtnTexto: { fontSize: 11, fontWeight: "800" },
  difBtn: { flex: 1, borderWidth: 2, borderRadius: raio.botao, paddingVertical: 8, alignItems: "center" },
  difBtnTexto: { fontSize: 11, fontWeight: "800" },
  btn: { borderRadius: raio.botao, padding: 14, alignItems: "center", marginTop: espacamento.sm },
  btnTexto: { color: "#FFF", fontWeight: "900", fontSize: tipografia.corpo, letterSpacing: 0.5 },
});
