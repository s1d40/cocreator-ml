# Task: Modularização & Refatoração do Módulo ML (Mercado Livre)

## Objetivo
Refatorar os componentes e rotas do módulo de Mercado Livre / Concorrência (`src/app/mercado-livre` e `src/app/concorrencia`), dividindo arquivos com mais de 300 linhas em subcomponentes, custom hooks e tipos TypeScript bem estruturados.

## Escopo de Arquivos para Modularizar:
1. `src/app/mercado-livre/page.tsx` -> Dividir em subcomponentes (RadarTable, PriceHistoryChart, ReviewAnalyzer).
2. `src/app/concorrencia/page.tsx` -> Extrair hooks de busca e cards de concorrência.
3. `src/app/api/ml-spy/` -> Modularizar helpers e chamadas à API do Mercado Livre.

## Critérios de Aceite:
- Nenhum componente acima de 250 linhas.
- Types e Interfaces centralizados em `src/types/`.
- Custom hooks em `src/hooks/`.
- Subcomponentes isolados em `src/components/ml/`.
- Enviar Pull Request no GitHub ao concluir.
