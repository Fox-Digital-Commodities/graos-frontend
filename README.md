# Grãos Frontend

Frontend React para o sistema de processamento de cards de preços de grãos.

## Funcionalidades

- ✅ Upload de arquivos com drag & drop
- ✅ Visualização e gerenciamento de cards processados
- ✅ Geração de planilhas personalizadas
- ✅ Interface responsiva e moderna
- ✅ Componentes reutilizáveis com shadcn/ui

## Tecnologias

- **React 19** - Framework frontend
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide Icons** - Ícones
- **React Dropzone** - Upload de arquivos
- **React Hook Form** - Formulários
- **Axios** - Cliente HTTP
- **Date-fns** - Manipulação de datas

## Instalação

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

## Estrutura

```
src/
├── components/
│   ├── ui/           # Componentes base do shadcn/ui
│   ├── Layout.jsx    # Layout principal da aplicação
│   ├── FileUpload.jsx # Componente de upload de arquivos
│   ├── CardsList.jsx # Lista e detalhes dos cards
│   └── SpreadsheetGenerator.jsx # Gerador de planilhas
├── assets/           # Arquivos estáticos
├── App.jsx          # Componente principal
└── main.jsx         # Ponto de entrada
```

## Uso

1. **Upload**: Faça upload de imagens, PDFs ou arquivos de texto com cards de preços
2. **Cards**: Visualize e gerencie os cards processados
3. **Planilhas**: Gere planilhas personalizadas a partir dos dados processados

## Integração com Backend

O frontend se comunica com a API NestJS através dos endpoints:

- `POST /api/upload` - Upload de arquivos
- `GET /api/cards` - Listar cards processados
- `POST /api/spreadsheet/generate` - Gerar planilhas

## Desenvolvimento

O projeto usa:
- **Hot Module Replacement (HMR)** para desenvolvimento rápido
- **ESLint** para qualidade de código
- **Prettier** para formatação
- **TypeScript** (JSX) para tipagem

