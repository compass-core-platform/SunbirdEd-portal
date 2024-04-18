describe('Landing page', () => {

    beforeEach(() => {
        cy.visit('https://compass-dev.tarento.com/resources');
        cy.get("#username").type('tomtom@yopmail.com').should('have.value','tomtom@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');
        cy.get('#login').click();

    });

    it('should open home page slect the course and navigate to overiew page consume the course and return back once it is done', () => {
        cy.get('.course-card-container').find('.course-title').contains('ECML COURSe').click();
        cy.url().should('contain', 'learn/course');
        cy.wait(500);
        cy.get('.com-primary-btn').click();
        cy.wait(10000);
        cy.get('.com-primary-btn').contains('Back').click();
        cy.url().should('contain', 'learn/course');
    });

    it('Should search for course and navigate to search result page', () => {
        cy.get('#header-search').type('power');
        cy.get('.search-right-icon').click();
        cy.url().should('contain', 'search/Courses');
        cy.get('.course-card').eq(0).click();
        cy.url().should('contain', 'learn/course');
        cy.get('.com-primary-btn').click();
        cy.wait(16000);
        cy.get('.com-primary-btn').contains('Back').click();
        cy.url().should('contain', 'learn/course');
    });

});