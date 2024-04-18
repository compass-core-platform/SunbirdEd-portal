import publishData from "../fixtures/course.json";

describe('Reviewer', () => {

    beforeEach(() => {
        cy.viewport(1550, 750)
        cy.visit('https://compass-dev.tarento.com/resources');
        cy.get("#username").type('santhosh.reviewer@yopmail.com').should('have.value','santhosh.reviewer@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');
        cy.get('#login').click();
    });

  
    xit('Should login as reviewer and review Course publish or reject', () => {
            
        cy.get('.spaces-icon').click();
        cy.get('h3').contains('Workspace').click();
        // cy.get('.my-text').eq(6).click();
        cy.get('a[mattooltip="Content awaiting your review"]').click();
        cy.get('.UpForReviewListHover').eq(3).click();
        cy.get('.sb-btn-secondary').should('contain', ' Publish ').click();
        cy.get('.sb-modal-content').should('be.visible').find('input[type="checkbox"]').check();
        // cy.intercept('POST', publishData.publishapi_url,(req) => {
        //     req.reply({
        //         statusCode:200,
        //         body:{
        //             ...publishData.publishapi_response
        //         }
        //     });
        // }).as('publish');
        cy.get('.sb-modal-actions').find('.sb-btn-primary').eq(0).click();
        // cy.wait('@publish').then((res) => {
        //     expect(res.response.body.result.responseCode).to.equal('OK')
        // });

       });
    

});