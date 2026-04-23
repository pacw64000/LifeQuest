# Documentacao de Implementacao - LifeQuest MVP

## Visao geral

Este documento resume o que foi implementado no projeto LifeQuest durante a construcao do MVP.

## Estrutura e arquitetura

- Reestruturacao do app para arquitetura em `src/` com separacao por responsabilidades:
  - `src/components`
  - `src/constants`
  - `src/context`
  - `src/navigation`
  - `src/screens`
  - `src/services`
  - `src/utils`
- Substituicao do `App.js` antigo por composicao com:
  - `AuthProvider`
  - `DadosAppProvider`
  - `NavigationContainer`
  - `NavegacaoRaiz`

## Navegacao

- Implementacao de navegacao com React Navigation:
  - Stack de autenticacao (`PilhaAutenticacao`)
  - Tabs principais (`AbasPrincipal`)
  - Stack de missoes e stack de mini games
- Rotas centralizadas em `src/constants/rotas.js`.

## Autenticacao

- Implementado fluxo de login/cadastro:
  - Email e senha (Firebase Auth)
  - Login com Google (Expo Auth Session + credencial Firebase)
- Estado de sessao controlado em `src/context/AuthContext.js`.
- Persistencia basica de usuario autenticado em AsyncStorage.

## Firebase

- Configuracao do Firebase em `src/services/firebase/config.js`.
- Repositorios criados:
  - `repositorioPerfil.js`
  - `repositorioMissoes.js`
- Perfil de usuario inicial com campos de progresso gamificado.

## Funcionalidades principais

- Dashboard com:
  - Nivel atual
  - XP atual e progresso
  - Streak
  - XP de mini games no dia
- Missoes:
  - Criacao
  - Listagem
  - Conclusao
  - Exclusao
- Conquistas:
  - Catalogo inicial
  - Desbloqueio por regras (missao, XP, streak)

## Mini games implementados (MVP)

- Jogo da Memoria
- Snake
- Quiz Rapido
- Tap Challenge
- Nonogram

Todos com integracao de recompensa de XP via `registrarResultadoMiniGame`.

## Sistema de gamificacao

- Motor de progresso implementado com:
  - Calculo de nivel por XP
  - XP por dificuldade de missao
  - Regras de streak
  - Regras de conquistas
  - Limite diario de XP por mini game
- Utilitarios em `src/utils/calculoProgresso.js`.

## Notificacoes

- Implementado servico de notificacoes locais em `src/services/notificacoes/servicoNotificacoes.js`.
- Agendamento de lembretes por missao com permissao em runtime.
- Estrutura preparada para evolucao de push remoto.

## Configuracao de ambiente

- Criados:
  - `.env`
  - `.env.example`
- Incluidas variaveis para Firebase, Google OAuth, limite diario de XP e flag de preparacao para push.

## Documentacao e projeto

- `README.md` criado com:
  - Funcionalidades
  - Setup
  - Variaveis de ambiente
  - Execucao local
- `app.json` atualizado para nome/slug do LifeQuest e plugin de notificacoes.
- `package.json` atualizado para nome do app e dependencias necessarias.

## Convencao de nomenclatura aplicada

Foi seguida a diretriz de nomes autoexplicativos, com exemplos no codigo como:

- `idGame`
- `nomeUsuario`
- `expMaximo`
- `limiteXpMiniGameDiario`
- `listaConquistasDesbloqueadas`
