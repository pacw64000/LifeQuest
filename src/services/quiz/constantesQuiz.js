/** Increment when bundled CSV or schema mapping changes; triggers re-seed. */
export const QUIZ_SEED_VERSION = 1;

export const CHAVE_SEED_BUNDLE = "seed_bundle_version";

export const ID_FONTE_MULTI = "multi-theme";
export const ID_FONTE_WIKI = "wiki-based";

/** Kahoot-style: max window per question (ms); UI countdown aligns with this. */
export const TEMPO_MAX_PERGUNTA_MS = 25000;

/** Base points for a correct answer at t=0 (scaled down by response time). */
export const PONTOS_BASE_CORRETO = 1000;

export const PONTOS_MIN_CORRETO = 400;

/** Questions drawn per round when category has enough rows. */
export const PERGUNTAS_POR_RODADA = 10;

/** SQLite batch insert size. */
export const TAMANHO_LOTE_INSERCAO = 320;
