describe('Equipamentos', () => {
    beforeEach(() => {
        cy.login();
        cy.irParaAba('Equipamentos');
    });

    it('Deve adicionar um novo equipamento', () => {
        const nome = `Equipamento Cypress ${Date.now()}`;

        cy.contains('.header-actions button', 'Adicionar Ativo').click();
        cy.contains('.page-header h2', 'Novo Equipamento').should('be.visible');

        cy.get('#nome').type(nome);
        cy.get('#tipo').type('Motores');
        cy.get('#setor').type('Usinagem');
        cy.get('#criticidade').select('Alta');
        cy.get('#equipForm button[type="submit"]').click();

        cy.contains('.header-actions h2', 'Equipamentos').should('be.visible');
        cy.contains('table td', nome).should('exist');
    });

    it('Deve remover um equipamento existente', () => {
        const nome = `Equipamento Remover ${Date.now()}`;

        cy.contains('.header-actions button', 'Adicionar Ativo').click();
        cy.get('#nome').type(nome);
        cy.get('#equipForm button[type="submit"]').click();
        cy.contains('table td', nome).should('exist');

        cy.window().then((win) => cy.stub(win, 'confirm').returns(true));
        cy.contains('table tr', nome).find('.btn-icon.danger').click();

        cy.contains('table td', nome).should('not.exist');
    });
});
