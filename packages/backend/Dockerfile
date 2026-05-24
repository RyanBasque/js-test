FROM node:20-alpine
WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# Install all workspace deps (includes devDependencies — needed for ts-node/nodemon)
RUN npm ci

# Copy backend source
COPY packages/backend ./packages/backend

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=packages/backend"]
