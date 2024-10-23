describe('Self Assessment Flow', () => {
  it('completes a self-assessment and receives a price estimate', () => {
    cy.visit('/self-assessment');

    // Step 1: Upload Images
    cy.get('input[type="file"]').attachFile('test-image.jpg');
    cy.get('button').contains('Next').click();

    // Step 2: Vehicle Type
    cy.get('select').select('sedan');
    cy.get('button').contains('Next').click();

    // Step 3: Vehicle Condition
    cy.get('input[name="interiorCondition"]').invoke('val', 70).trigger('input');
    cy.get('input[name="exteriorCondition"]').invoke('val', 80).trigger('input');
    cy.get('button').contains('Submit').click();

    // Verify price estimate is displayed
    cy.get('h2').contains('Dynamic Pricing Estimate').should('be.visible');
    cy.get('p').contains('$').should('be.visible');

    // Verify user can modify services
    cy.get('button').contains('Modify').click();
    cy.get('input[type="checkbox"]').first().click();
    cy.get('button').contains('Update').click();

    // Verify updated price is displayed
    cy.get('p').contains('$').should('be.visible');

    // Approve estimate
    cy.get('button').contains('Approve Estimate').click();

    // Verify user is taken to the next step (e.g., booking page)
    cy.url().should('include', '/booking');
  });
});
