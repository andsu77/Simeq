describe('Adicionar Itens', () => {
    it('Deve adicionar um novo item', () => {
        cy.visit('http://localhost:3000');
    });

    it('Deve adicionar um item', () => {
        cy.visit('http://localhost:3000');
        cy.get('input[name="nome"]').type('Novo Item');
        cy.get('input[name="descricao"]').type('Descrição do novo item');
        cy.get('button[type="submit"]').click();
        cy.contains('Novo Item').should('exist');
    });
});
