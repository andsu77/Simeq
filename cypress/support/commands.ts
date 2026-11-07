// Comandos customizados do Cypress para o SIMEQ

Cypress.Commands.add('login', (email = 'admin@simeq.com', senha = 'admin123') => {
    cy.session(
        [email, senha],
        () => {
            cy.visit('/');
            cy.get('#email').type(email);
            cy.get('#senha').type(senha);
            cy.get('#loginForm button[type="submit"]').click();
            cy.get('.main-layout').should('be.visible');
        },
        {
            validate() {
                cy.request('/api/auth/me').its('body.loggedIn').should('eq', true);
            }
        }
    );
    cy.visit('/');
    cy.get('.main-layout').should('be.visible');
});

Cypress.Commands.add('irParaAba', (nomeAba) => {
    cy.get('.sidebar nav a').contains(nomeAba).click();
});
