# Utilisez une version spécifique de Node.js
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement le fichier package.json et package-lock.json (si présent)
COPY package*.json ./

# Installer les dépendances
RUN npm install 

# Copier tout le reste du code dans le conteneur
COPY . .

# Exposer le port utilisé par l'application (optionnel, mais recommandé)
EXPOSE 3000

# Commande par défaut pour démarrer l'application
CMD ["npm", "start"]
