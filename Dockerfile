FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile

# Definir variáveis de ambiente (serão injetadas em tempo de execução)
ENV VITE_API_URL=https://ia.back.foxgraos.com.br/api
ENV VITE_FOX_API_URL=https://api.foxdc.com.br


COPY . .

# Executar o build
RUN pnpm build

FROM nginx:alpine AS production

# Configuração do fuso horário
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo


# Remover configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar arquivos estáticos do build para a pasta do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

# Usar o script de inicialização em vez de iniciar o nginx diretamente
CMD ["nginx", "-g", "daemon off;"]