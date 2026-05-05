import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { espacamento, raio, tipografia } from "../constants/layout";

// Tag de categoria
function TagCategoria({ categoria, paleta }) {
  const cores = paleta.categorias?.[categoria] || { bg: paleta.destaque, text: "#FFF" };
  return (
    <View style={[estiloTag.pill, { backgroundColor: cores.bg }]}>
      <Text style={[estiloTag.texto, { color: cores.text }]}>{categoria}</Text>
    </View>
  );
}
const estiloTag = StyleSheet.create({
  pill: { borderRadius: raio.pill, paddingHorizontal: 6, paddingVertical: 2 },
  texto: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
});

// Card de stat (Dias / Moedas / Badges)
function StatBox({ icone, valor, label, paleta }) {
  return (
    <View style={[styles.statBox, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}>
      <Text style={styles.statIcone}>{icone}</Text>
      <Text style={[styles.statValor, { color: paleta.textoPrincipal }]}>{valor}</Text>
      <Text style={[styles.statLabel, { color: paleta.textoSecundario }]}>{label}</Text>
    </View>
  );
}

// Item de quest do dia
function QuestItem({ missao, onConcluir, paleta }) {
  const xpMap = { facil: 15, media: 30, dificil: 50 };
  const xp = xpMap[missao.dificuldadeMissao] || 20;
  return (
    <View style={[styles.questItem, { borderBottomColor: paleta.bordaSuave }]}>
      <View style={[styles.questIconeBox, { backgroundColor: paleta.destaque + "22", borderColor: paleta.destaque }]}>
        <Ionicons name="checkmark-circle-outline" size={18} color={paleta.destaque} />
      </View>
      <View style={styles.questInfo}>
        <Text
          style={[
            styles.questTitulo,
            { color: paleta.textoPrincipal },
            missao.concluida && { textDecorationLine: "line-through", color: paleta.textoSecundario },
          ]}
          numberOfLines={1}
        >
          {missao.tituloMissao}
        </Text>
        <View style={styles.questMeta}>
          <TagCategoria categoria={missao.categoriaMissao || "SAÚDE"} paleta={paleta} />
          {missao.horaMissao ? (
            <Text style={[styles.questHora, { color: paleta.textoSecundario }]}>{missao.horaMissao}</Text>
          ) : null}
          <Text style={[styles.questXp, { color: paleta.sucesso }]}>+{xp} XP</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: paleta.bordaSuave },
          missao.concluida && { backgroundColor: paleta.sucesso, borderColor: paleta.sucesso },
        ]}
        onPress={() => !missao.concluida && onConcluir(missao.idMissao)}
      >
        {missao.concluida && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </TouchableOpacity>
    </View>
  );
}

export default function TelaDashboard({ navigation }) {
  const { usuarioAutenticado } = useAuth();
  const {
    expAtual, moedas, streakAtual, progressoNivel,
    listaMissoes, concluirMissao,
    listaConquistasDesbloqueadas, catalogoConquistasPadrao,
    partidasRestantesHoje,
  } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const nome = (usuarioAutenticado?.nomeUsuario || "Aventureiro").toUpperCase();
  const missoesHoje = listaMissoes.slice(0, 6);
  const concluidasHoje = missoesHoje.filter((m) => m.concluida).length;
  const totalBadges = catalogoConquistasPadrao.length;
  const badgesDesbloqueadas = listaConquistasDesbloqueadas.length;
  const tituloNivel = progressoNivel.nivelAtual < 5 ? "Novato" : progressoNivel.nivelAtual < 10 ? "Aprendiz" : "Cavaleiro";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.xl,
      }}
    >
      {/* ── Cabeçalho ── */}
      <View style={[styles.header, { backgroundColor: paleta.destaque }]}>
        <Text style={styles.headerSub}>BEM-VINDA(O), AVENTUREIR@</Text>
        <Text style={styles.headerNome}>{nome}</Text>
      </View>

      <View style={styles.corpo}>

        {/* ── Perfil / XP ── */}
        <View style={[styles.perfilCard, { backgroundColor: paleta.destaque }]}>
          {/* Avatar pixel */}
          <View style={[styles.avatarBox, { borderColor: "#FFF", backgroundColor: paleta.destaqueEscuro }]}>
            <Text style={styles.avatarEmoji}>🧙</Text>
            <View style={[styles.nivelBadge, { backgroundColor: paleta.fundoPrimario }]}>
              <Text style={[styles.nivelBadgeText, { color: paleta.textoPrincipal }]}>{progressoNivel.nivelAtual}</Text>
            </View>
          </View>

          {/* Info nível */}
          <View style={styles.perfilInfo}>
            <Text style={styles.perfilNivel}>
              NÍVEL {progressoNivel.nivelAtual} · {tituloNivel.toUpperCase()}
            </Text>
            {/* Barra XP */}
            <View style={[styles.barraFundo, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
              <View
                style={[
                  styles.barraValor,
                  { backgroundColor: "#FFF", width: `${Math.min(100, progressoNivel.progressoNivel)}%` },
                ]}
              />
            </View>
            <Text style={styles.perfilXpText}>
              {progressoNivel.expMaximo - expAtual} XP até subir de nível
            </Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatBox icone="🔥" valor={streakAtual} label="DIAS" paleta={paleta} />
          <StatBox icone="🪙" valor={moedas} label="MOEDAS" paleta={paleta} />
          <StatBox icone="🏅" valor={`${badgesDesbloqueadas}/${totalBadges}`} label="BADGES" paleta={paleta} />
        </View>

        {/* ── Quests de Hoje ── */}
        <View style={[styles.secaoCard, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
          <View style={styles.secaoHeader}>
            <Text style={[styles.secaoTitulo, { color: paleta.textoPrincipal }]}>QUESTS DE HOJE</Text>
            <Text style={[styles.secaoContador, { color: paleta.textoSecundario }]}>
              {concluidasHoje}/{missoesHoje.length}
            </Text>
          </View>

          {missoesHoje.length === 0 ? (
            <Text style={[styles.vazio, { color: paleta.textoSecundario }]}>
              Nenhuma missão criada. Crie uma na aba Missões!
            </Text>
          ) : (
            missoesHoje.map((m) => (
              <QuestItem key={m.idMissao} missao={m} onConcluir={concluirMissao} paleta={paleta} />
            ))
          )}
        </View>

        {/* ── Mini Games ── */}
        <TouchableOpacity
          style={[styles.miniGamesCard, { backgroundColor: paleta.destaqueSecundario, borderColor: paleta.bordaSuave }]}
          onPress={() => navigation.navigate && navigation.navigate("MiniGamesStack")}
          activeOpacity={0.85}
        >
          <View style={styles.miniGamesLeft}>
            <Text style={styles.miniGamesLabel}>MINI GAMES</Text>
            <View style={styles.miniGamesIconeRow}>
              <Text style={styles.miniGamesIcBox}>🎮</Text>
              <View>
                <Text style={styles.miniGamesTexto}>4 JOGOS DISPONÍVEIS</Text>
                <Text style={styles.miniGamesSub}>
                  {partidasRestantesHoje} partidas restantes · Ganhe XP extra!
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#1A0A04" />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingHorizontal: espacamento.md, paddingBottom: espacamento.md, paddingTop: espacamento.sm },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  headerNome: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: 1 },

  corpo: { paddingHorizontal: espacamento.md, paddingTop: espacamento.md },

  // Perfil
  perfilCard: {
    borderRadius: raio.cartao, padding: espacamento.md, flexDirection: "row",
    alignItems: "center", gap: espacamento.md, marginBottom: espacamento.sm,
  },
  avatarBox: {
    width: 64, height: 64, borderRadius: raio.cartao, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  avatarEmoji: { fontSize: 32 },
  nivelBadge: {
    position: "absolute", bottom: -8, right: -8,
    width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF",
  },
  nivelBadgeText: { fontSize: 11, fontWeight: "900" },
  perfilInfo: { flex: 1 },
  perfilNivel: { color: "#FFF", fontSize: 12, fontWeight: "800", letterSpacing: 0.3, marginBottom: 6 },
  barraFundo: { height: 10, borderRadius: 2, overflow: "hidden", marginBottom: 4 },
  barraValor: { height: "100%", borderRadius: 2 },
  perfilXpText: { color: "rgba(255,255,255,0.85)", fontSize: 11 },

  // Stats
  statsRow: { flexDirection: "row", gap: espacamento.sm, marginBottom: espacamento.md },
  statBox: {
    flex: 1, borderRadius: raio.cartao, borderWidth: 2, padding: espacamento.sm,
    alignItems: "center",
  },
  statIcone: { fontSize: 18, marginBottom: 2 },
  statValor: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, marginTop: 1 },

  // Seção card
  secaoCard: { borderRadius: raio.cartao, borderWidth: 2, marginBottom: espacamento.md, overflow: "hidden" },
  secaoHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: espacamento.md, paddingVertical: espacamento.sm,
    borderBottomWidth: 2, borderBottomColor: "#C8B89A",
  },
  secaoTitulo: { fontSize: tipografia.corpo, fontWeight: "900", letterSpacing: 0.5 },
  secaoContador: { fontSize: tipografia.legenda, fontWeight: "700" },
  vazio: { padding: espacamento.md, fontSize: tipografia.legenda, textAlign: "center" },

  // Quest item
  questItem: {
    flexDirection: "row", alignItems: "center", gap: espacamento.sm,
    paddingHorizontal: espacamento.md, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  questIconeBox: { width: 32, height: 32, borderRadius: raio.cartao, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  questInfo: { flex: 1 },
  questTitulo: { fontSize: tipografia.corpo, fontWeight: "700", marginBottom: 3 },
  questMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  questHora: { fontSize: 11, fontWeight: "600" },
  questXp: { fontSize: 11, fontWeight: "800" },
  checkbox: {
    width: 24, height: 24, borderRadius: raio.pill, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },

  // Mini Games
  miniGamesCard: {
    borderRadius: raio.cartao, borderWidth: 2, padding: espacamento.md,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: espacamento.md,
  },
  miniGamesLeft: { flex: 1 },
  miniGamesLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5, marginBottom: 6, color: "#1A0A04" },
  miniGamesIconeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  miniGamesIcBox: { fontSize: 28 },
  miniGamesTexto: { fontSize: tipografia.corpo, fontWeight: "900", color: "#1A0A04" },
  miniGamesSub: { fontSize: 11, color: "#3A2A10", marginTop: 2 },
});
