# LifeQuest

App mobile gamificado (React Native + Expo) que transforma tarefas diarias em missoes com sistema de XP, niveis, conquistas e mini games.

## Participantes

- Anderson Garrido Scaioni Junior - RA: 10442415440
- Cayo Henrique Dos Santos Dias - RA: 10442416670

## Funcionalidades MVP

- Cadastro e login com email/senha e Google.
- Dashboard com nivel, XP, barra de progresso e streak.
- Criacao, listagem, conclusao e exclusao de missoes.
- Sistema de conquistas.
- Hub de mini games:
  - Jogo da Memoria
  - Snake
  - Quiz Rapido
  - Tap Challenge
  - Nonogram
- Lembretes locais por notificacao para missoes.
- Limite diario de XP de mini games para balanceamento.

## Stack

- Expo + React Native
- React Navigation (stack + tabs)
- Firebase (Auth + Firestore)
- AsyncStorage
- Expo Notifications

## Configuracao de ambiente

1. Copie `.env.example` para `.env`.
2. Preencha as variaveis Firebase e Google OAuth.

Variaveis obrigatorias:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Variaveis opcionais:

- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_ENABLE_PUSH_PREP`
- `EXPO_PUBLIC_DAILY_MINIGAME_XP_LIMIT`

## Execucao local

```bash
npm install
npm run start
```

Para abrir no navegador:

```bash
npm run web
```

## Observacoes

- O projeto segue convencao de variaveis autoexplicativas (ex.: `idGame`, `nomeUsuario`, `expMaximo`).
- A estrutura de push remoto esta preparada por configuracao, mas o MVP usa notificacoes locais.
