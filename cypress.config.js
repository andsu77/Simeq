const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'cypress/e2e/**/*.cy.js'
  }
});

// Executar:
// npx cypress open   → modo interativo
// npx cypress run    → modo headless (CI)