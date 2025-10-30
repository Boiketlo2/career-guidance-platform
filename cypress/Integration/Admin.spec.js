describe('Admin UI', () => {
  it('Admin can login and see dashboard', () => {
    cy.visit('/admin/login');
    cy.get('input[name=email]').type('admin@example.com');
    cy.get('input[name=password]').type('Secret123!');
    cy.get('button[type=submit]').click();

    cy.url().should('include', '/admin/dashboard');
    cy.contains('Institutions').should('exist');
  });

  it('Admin can create an institution', () => {
    cy.get('button').contains('Add Institution').click();
    cy.get('input[name=name]').type('Cypress University');
    cy.get('input[name=contactEmail]').type('cypress@uni.com');
    cy.get('button[type=submit]').click();
    cy.contains('Institution created').should('exist');
    cy.get('table').contains('Cypress University');
  });
});
