# TASK 03: Pre-Sales Buyer Questions Inbox & AI Assistant

## 🎯 Goal
Refine the Pre-Sales Buyer Questions Inbox in `src/components/QuestionsInbox.tsx` with instant 1-click AI response generation based on listing metadata, technical specifications, and seller guidelines.

---

## 📂 Deliverables

### 1. Enhanced Questions Inbox (`src/components/QuestionsInbox.tsx`)
*   List pending and answered buyer questions.
*   Filter by: "Não Respondidas (Urgentes)", "Respondidas", "Por Anúncio".
*   Display response time timer (e.g. `Perguntado há 8 minutos - Impacto na reputação`).

### 2. AI Reply Copilot Button
*   "Gerar Resposta com IA": Analyzes item attributes (tamanho, voltagem, compatibilidade, garantia, frete Full) and drafts a polite, sales-oriented answer in Portuguese.
*   Editable text area before sending.
*   Quick template chips: "Tem pronta entrega?", "Compatibilidade", "Emissão de NF", "Garantia".
