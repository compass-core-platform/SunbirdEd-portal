import adminFix from '../fixtures/admin.json';

describe('Admin login', () => {

    beforeEach(() => {
        cy.viewport(1550, 750)
        cy.visit('https://compass-dev.tarento.com/resources');
        cy.get("#username").type('santhoshk@yopmail.com').should('have.value','santhoshk@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');
        cy.get('#login').click();
    });

    it('should navigation to admin portal', () => {
        const filePath = '../../../fixtures/images/ex-1.jpg';
        // cy.intercept('/learner/notification/v1/feed/read/c43e5500-0ec1-486e-a623-60c1d1436c82').as('notifications');
        // cy.wait('@notifications');  // wait for page to load
        // cy.get('.loggedInUser').should('be.visible');
        cy.once("fail", (err) =>
            {
                return false;
        });
        cy.get('.spaces-icon').click();
        cy.get('h3').contains('Admin Portal').click();
        cy.url().should('contain','admin-portal');
         cy.wait(1000);
        cy.request('POST', '/learner/course/v1/batch/allparticipants/list',adminFix.batchlist).then((res) => {
            expect(res.body.result.batch.length).greaterThan(0);
        }); 
        cy.wait(1000);
        // cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(2).click();
        // cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(3).click();

        cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(4).click();
        cy.request('GET', '/api/framework/v1/read/fracing_fw?categories=').then((res) => {
            expect(res.body.result.framework.code).equal('fracing_fw');
        });
        
        cy.get('#taxonomyCategory1Card3').click();
        cy.get('#box2').find('lib-term-card').should('have.length.greaterThan', 2);
        cy.get('#taxonomyCategory2Card2').click();
        cy.get('#box3Container').find('.addCardButton').click();
        cy.get("input[formcontrolname='name']").focus();
        cy.get('.mat-option').eq(1).click();
        cy.get('button[type="submit"]').click();
        cy.get('.mat-error').should('contain', 'Already Exist');
        cy.get('button[type="reset"]').click();
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('Course and Assessment').click();

        /*Notification flow*/

        cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(3).click();
        cy.request('GET', '/learner/user/v1/notification/list/false').then((res) => {
            expect(res.body.result.response.notifications.length).greaterThan(0);
        });
        cy.get('.create-link').click();
        cy.get('input[formcontrolname="notificationTitle"]').type('e2e demo');
        cy.get('textarea[formcontrolname="notificationText"]').type('e2e demo Text');
        cy.get('input[formcontrolname="contentType"]').type('Meeting link');
        cy.get('.mat-chip').eq(1).click();
        cy.get('.mat-checkbox-input').eq(1).check;
        cy.get('.content-footer').find('button.mat-stroked-button').click();
        cy.get('button[type="submit"]').click();
        // cy.request('POST', '')

       

    });

});