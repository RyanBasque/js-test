FROM node:20-alpine
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# Install all workspace deps
RUN npm ci

# Copy frontend source
COPY packages/frontend ./packages/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=packages/frontend"]
