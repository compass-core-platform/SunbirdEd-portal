describe('Landing page', () => {

    beforeEach(() => {
        cy.visit('https://compass-dev.tarento.com')
    });

    it('Should open landing page', () => {
       cy.contains('Driving Government Success and Employee Fulfilment.')
    });

    it('Should show error when user not entered username or password', () => {
        cy.get('a.com-secondary-btn').click();
        cy.url().should('include', 'auth/realms/sunbird/protocol/openid-connect/');

        cy.get("#username").should('have.value','');
        cy.get('#password').should('have.value','');
        
        cy.get('#login').click();
        cy.get('#error-summary').should("contain", "Invalid Email Address/Mobile number or password.");
    });

    it('Should navigate to login page', () => {
        cy.get('a.com-secondary-btn').click();
        cy.url().should('include', 'auth/realms/sunbird/protocol/openid-connect/');

        cy.get("#username").type('santhoshk@yopmail.com').should('have.value','santhoshk@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');

        cy.get('#login').click();
        cy.url().should('include', '/resources');
    });

   
  

  })
  