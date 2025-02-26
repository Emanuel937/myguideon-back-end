const host = process.env.NODE_ENV === 'production' 
    ? 'https://xs.codaby.fr' 
    : 'http://localhost:3000';

module.exports = host;