import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function solicitarPermissaoNotificacao() {
  const configuracaoAtual = await Notifications.getPermissionsAsync();
  if (configuracaoAtual.granted) {
    return true;
  }

  const respostaPermissao = await Notifications.requestPermissionsAsync();
  return respostaPermissao.granted;
}

export async function agendarLembreteMissao({ idMissao, tituloMissao, segundosParaLembrar }) {
  const permissaoConcedida = await solicitarPermissaoNotificacao();
  if (!permissaoConcedida) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "LifeQuest: Missao pendente",
      body: `Hora de concluir: ${tituloMissao}`,
      data: { idMissao },
    },
    trigger: { seconds: segundosParaLembrar, repeats: false },
  });
}

export async function cancelarLembrete(notificacaoId) {
  if (!notificacaoId) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificacaoId);
}
