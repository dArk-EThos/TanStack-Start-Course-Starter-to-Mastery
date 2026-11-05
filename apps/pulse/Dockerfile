# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Nitro bundles everything the server needs into .output
COPY --from=build /app/.output ./.output

# Pulse stores its data in ./.data (mount a volume here to keep it)
RUN mkdir -p /app/.data
VOLUME ["/app/.data"]

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
