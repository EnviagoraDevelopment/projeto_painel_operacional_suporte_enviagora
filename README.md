# 🚀 Painel de Controle Operacional - Enviagora

Um painel de monitoramento de alta performance e baixa latência projetado para TVs, focado no suporte operacional da Enviagora. Este dashboard consolida dados em tempo real do **ClickUp** e do **Google Sheets** para fornecer visibilidade total sobre a saúde da operação logística.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![ClickUp](https://img.shields.io/badge/ClickUp-7B68EE?style=for-the-badge&logo=clickup&logoColor=white)

---

## 📋 Funcionalidades Principais

### 1. Monitoramento de Tickets (ClickUp)
- **Integração Nativa**: Conexão direta com a API do ClickUp para monitorar a fila de suporte.
- **Identificação de Clientes**: Lógica inteligente que extrai o nome do cliente a partir de tags entre colchetes (ex: `[NUTURE]`) ou campos personalizados.
- **Fila Crítica**: Destaque automático de tickets urgentes, de alta prioridade ou com atraso superior a 24 horas.

### 2. Recebimento Inbound (Google Sheets + Webhook)
- **Notas Pendentes**: Lista de notas fiscais não cadastradas no WMS.
- **Status Crítico**: Alerta visual para notas paradas há mais de 3 horas.
- **Confirmação em Tempo Real**: Botão de confirmação que dispara um webhook (N8n) e atualiza a interface instantaneamente via `revalidatePath`.

### 3. Controle de Qualidade (Erros de Etiqueta)
- **Análise de Dados**: Gráficos dinâmicos que mostram os erros de etiqueta por cliente no dia atual.
- **Alertas de Limite**: Identificação visual de clientes que excederam o padrão operacional de erros.

### 4. Cronograma de Insumos
- **Planejamento Logístico**: Calendário interativo para acompanhar contagens de insumo semanais e quinzenais.
- **Mapeamento de Base**: Resumo da próxima contagem programada por cliente.

---

## 🎨 Design System

O projeto utiliza uma estética **Dark Mode Premium** (Glassmorphism), otimizada para visualização em telas de TV (Dashboard de Operação):

- **Cores**: Base em `zinc-900`, com acentos em `emerald` (sucesso), `red` (crítico/erro), `blue` (insumos) e `purple` (sistema).
- **Tipografia**: Uso extensivo de pesos `black` e fontes `mono` para leitura rápida de números e horários.
- **Animações**: Micro-interações de hover, estados de loading pulsantes e alertas animados para situações críticas.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes de UI**: Lucide React (Ícones)
- **Gráficos**: Recharts
- **Integrações**: Google Cloud (Sheets API) & ClickUp API v2

---

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# ClickUp
CLICKUP_API_TOKEN=seu_token_aqui

# Google Sheets (Recebimento Inbound)
SHEET_NFS_NAO_CADASTRADAS_ID=id_da_planilha
SHEET_NFS_NAO_CADASTRADAS_API_KEY=sua_api_key
SHEET_NFS_CLIENT_EMAIL=email-conta-servico@gserviceaccount.com
SHEET_NFS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Webhooks
N8n_SHEET_WEBHOOK=url_do_webhook_n8n
```

---

## 🚀 Como Rodar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse em `http://localhost:3000`

---

## 📂 Estrutura de Pastas

```text
/app
  /actions       # Server Actions (lógica de API e Sheets)
  /components    # Componentes de UI (VisualAnalytics, ErroEtiquetas, etc)
  /lib           # Utilitários e configurações base
  page.tsx       # Estrutura principal do Dashboard
  layout.tsx     # Configuração de fontes e metadados
```

---

*Desenvolvido pela Equipe de Tecnologia Enviagora.*
