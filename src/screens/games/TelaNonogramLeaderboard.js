import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import TextoApp from "../../components/TextoApp";
import { nonogramConfig } from "../../config/nonogramConfig";
import { useTemaVisual } from "../../context/TemaVisualContext";
import { listarPlacarPublicoOrdenado } from "../../services/firebase/repositorioNonogramPublico";
import { listarPlacarLocalOrdenado } from "../../services/local/repositorioNonogram";
import {
  primeiroResultadoMelhorQueSegundo,
} from "../../utils/nonogram/pontuacaoNonogram";

function mesclarMelhores(locais, nuvem) {
  const mapa = new Map();
  for (const e of locais) {
    mapa.set(e.idUsuario, { ...e, fonte: "local" });
  }
  for (const e of nuvem) {
    const antes = mapa.get(e.idUsuario);
    if (!antes) {
      mapa.set(e.idUsuario, { ...e, fonte: "nuvem" });
      continue;
    }
    const candidato = { erros: e.erros, tempoMs: e.tempoMs, pontuacao: e.pontuacao };
    const atual = { erros: antes.erros, tempoMs: antes.tempoMs, pontuacao: antes.pontuacao };
    if (primeiroResultadoMelhorQueSegundo(candidato, atual)) {
      mapa.set(e.idUsuario, { ...e, fonte: "nuvem" });
    }
  }
  const lista = Array.from(mapa.values());
  lista.sort((a, b) => {
    if (primeiroResultadoMelhorQueSegundo(a, b)) return -1;
    if (primeiroResultadoMelhorQueSegundo(b, a)) return 1;
    return 0;
  });
  return lista.slice(0, nonogramConfig.ui.limitePlacarExibicao);
}

export default function TelaNonogramLeaderboard({ route }) {
  const { idPuzzle, idFirestore, tituloPuzzle } = route.params || {};
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const [linhas, setLinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!idPuzzle) {
      setLinhas([]);
      setCarregando(false);
      return;
    }
    try {
      const locais = await listarPlacarLocalOrdenado(idPuzzle);
      if (idFirestore) {
        try {
          const nuvem = await listarPlacarPublicoOrdenado(idFirestore);
          setLinhas(mesclarMelhores(locais, nuvem));
        } catch {
          setLinhas(locais);
        }
      } else {
        setLinhas(locais);
      }
    } finally {
      setCarregando(false);
    }
  }, [idPuzzle, idFirestore]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function formatarTempo(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + 8,
        paddingBottom: insetsChrome.paddingBottomConteudo + 24,
        paddingHorizontal: tokens.espacamento.md,
      }}
    >
      {tituloPuzzle ? (
        <TextoApp style={[styles.titulo, { color: paleta.textoPrincipal }]}>{tituloPuzzle}</TextoApp>
      ) : null}
      <TextoApp style={[styles.sub, { color: paleta.textoSecundario }]}>
        Ordem: menos erros, depois menos tempo (config em nonogramConfig).
      </TextoApp>

      {carregando ? (
        <ActivityIndicator color={paleta.destaque} style={{ marginTop: 24 }} />
      ) : linhas.length === 0 ? (
        <TextoApp style={{ color: paleta.textoSecundario, marginTop: 16 }}>Ainda ninguem completou este puzzle.</TextoApp>
      ) : (
        linhas.map((linha, idx) => (
          <View
            key={`${linha.idUsuario}-${idx}`}
            style={[styles.linha, { borderColor: paleta.bordaSuave, backgroundColor: paleta.fundoCartao }]}
          >
            <TextoApp style={[styles.rank, { color: paleta.destaque }]}>{idx + 1}</TextoApp>
            <View style={styles.linhaTxt}>
              <TextoApp style={{ color: paleta.textoPrincipal, fontWeight: "600" }}>
                {linha.nomeExibicao || "Jogador"}
              </TextoApp>
              <TextoApp style={{ color: paleta.textoSecundario, fontSize: 13 }}>
                {formatarTempo(linha.tempoMs)} · {linha.erros} erro(s) · {Math.round(linha.pontuacao)} pts
              </TextoApp>
            </View>
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
    titulo: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
    sub: { marginBottom: e.md, fontSize: 13 },
    linha: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: r.cartao,
      borderWidth: 1,
      marginBottom: 8,
    },
    rank: { width: 28, fontWeight: "800", fontSize: 16 },
    linhaTxt: { flex: 1 },
  });
}
