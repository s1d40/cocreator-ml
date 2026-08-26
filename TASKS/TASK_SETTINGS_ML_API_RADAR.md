# TASK: Painel de Configurações do ML Intelligence (Mercado Libre API & Radar Parameters)

## 📌 Contexto & Objetivo
Implementar a página de configurações dedicada do `cocreator-ml` (`/settings` ou `/configuracoes`), permitindo ao vendedor configurar suas credenciais de API do Mercado Livre, parâmetros do radar de concorrência, intervalos de monitoramento do Buy Box e regras do assistente de pré-vendas.

---

## 🛠️ Especificação Técnica & Abas

### Rota: `/settings`

1. **Aba 1: Credenciais Mercado Livre API (`/settings/api`)**
   - Inserção e teste de `APP_USR-...` Access Token do Mercado Livre.
   - Status da Conexão em tempo real (Conectado / Expirado / Modo Simulação Demo).
   - Indicador de Modo Leitura Segura (Zero permissões de alteração de preços acidental, 100% focado em inteligência e analytics).

2. **Aba 2: Parâmetros do Radar de Concorrência & Buy Box (`/settings/radar`)**
   - Intervalo de varredura automática de anúncios concorrentes (A cada 15m, 1h, 6h).
   - Margem de sensibilidade de alerta de perda de Buy Box (Notificação no painel quando concorrente alterar preço).
   - Lista de Sellers e MLBs monitorados como concorrentes diretos.

3. **Aba 3: Configurações do Estimador de Vendas (`/settings/estimator`)**
   - Ajuste fino dos multiplicadores estocásticos por categoria (Eletrônicos, Moda, Alimentos, Casa).
   - Margem de confiança estatística (80%, 95%).

4. **Aba 4: Assistente Pré-Vendas com IA (`/settings/pre-sales`)**
   - Tom de voz padrão das respostas automáticas sugeridas (Formal, Entusiasmado, Técnico, Comercial).
   - Regra de Envio: "Aprovação Manual Obrigatória" vs "Sugestão com 1-Click".
