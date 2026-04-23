# Task List - LifeQuest MVP

## Status geral

- Total de tarefas principais: 8
- Concluidas: 8
- Pendentes: 0

## Tarefas concluidas

- [x] Criar estrutura base (pastas, navegacao e dependencias) para transformar o app de tela unica em arquitetura escalavel.
- [x] Configurar Firebase + arquivos `.env`/`.env.example` e camada de servicos para auth, firestore e preparacao de push.
- [x] Implementar autenticacao completa com email/senha e Google, incluindo contexto global e protecao de rotas.
- [x] Construir telas principais do MVP: Dashboard, Missoes, Criar Missao, Mini Games e Conquistas.
- [x] Implementar motor de XP, nivel, streak, badges e regras de desbloqueio/limite diario de mini games.
- [x] Desenvolver versoes MVP dos 5 mini games e integracao de recompensas com o progresso do usuario.
- [x] Adicionar lembretes locais por missao e deixar interface preparada para push remoto futuro.
- [x] Validar fluxos criticos e atualizar documentacao de setup e execucao do projeto.

## Tarefas pendentes (proxima fase recomendada)

- [ ] Configurar projeto Firebase real no ambiente (Auth, Firestore e regras de seguranca de producao).
- [ ] Configurar credenciais OAuth reais do Google para Android/iOS/Web.
- [ ] Persistir todos os eventos de gamificacao com estrategia de sincronizacao offline/online.
- [ ] Implementar bloqueio de mini games com regra clara de desbloqueio por progresso.
- [ ] Adicionar feedback visual avancado (animacoes, estados de loading, toasts e tratamento de erros amigavel).
- [ ] Criar testes automatizados (unitarios e de integracao) para auth, missoes e engine de progresso.
- [ ] Revisar acessibilidade (labels, contraste, tamanhos de toque e leitura em tela pequena).
- [ ] Implementar push notifications remotas (FCM) usando a base ja preparada.
- [ ] Criar pipeline de CI para lint, build e validacao automatica.
- [ ] Publicar primeira versao interna (APK/TestFlight) para teste com usuarios.

## Observacoes

- O MVP funcional foi entregue com foco em rapidez de entrega e base escalavel.
- Esta lista deve ser atualizada a cada sprint para refletir evolucao real do projeto.
