import adminFix from '../fixtures/admin.json';
import contentSearch from '../fixtures/content-search.json'

describe('Admin login', () => {

    beforeEach(() => {
        cy.viewport(1550, 750)
        cy.visit('https://compass-dev.tarento.com/resources');
        cy.get("#username").type('santhoshk@yopmail.com').should('have.value','santhoshk@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');
        cy.get('#login').click();
    });

    it('should navigate to admin portal', () => {
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
        cy.url().should('contain','course-assessment');
        cy.wait(1000);
        cy.request({
            method: 'POST',
            url: 'https://compass-dev.tarento.com/api/content/v1/search',
            headers: contentSearch.headers,
            body: contentSearch.coursePayload
          }).then((res) => {
            expect(res.body.result.count).greaterThan(0);
          });
           
        cy.request('POST', '/learner/course/v1/batch/allparticipants/list',adminFix.batchlist).then((res) => {
            expect(res.body.result.batch.length).greaterThan(0);
        }); 
        cy.wait(1000);

        // course and assessment

        cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(0).click();
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('Course and Assessment').click();
        cy.get('app-course-assessment-progress').find('.course-assessment__label').eq(1).click();
        cy.request({
            method: 'POST',
            url: 'https://compass-dev.tarento.com/api/content/v1/search',
            headers: contentSearch.headers,
            body: contentSearch.assessmentPayload
          }).then((res) => {
            expect(res.body.result.count).greaterThan(0);
          });

        // user competency passbook

        cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(2).click();
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('User Competency Passbook').click();
        // cy.request({
        //     method: 'GET',
        //     url: 'https://compass.samagra.io/api/user',
        //     qs: {
        //       userId: 'c43e5500-0ec1-486e-a623-60c1d1436c82'
        //     },
        //     headers: {
        //       'Accept': 'application/json',
        //       'Content-Type': 'application/json'
        //     }
        //   });

        /*Notification flow*/

        cy.get('.mat-drawer-inner-container').find('a.mat-button').eq(3).click();
        cy.request('GET', '/learner/user/v1/notification/list/false').then((res) => {
            expect(res.body.result.response.notifications.length).gte(0);
        });
        cy.request('GET', '/learner/user/v1/notification/list/true').then((res) => {
            expect(res.body.result.response.notifications.length).gte(0);
        });
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('Notification');

        // create notification

        cy.get('.create-link').click();
        cy.request('GET', '/api/framework/v1/read/fracing_fw?categories=').then((res) => {
            expect(res.body.result.framework.code).equal('fracing_fw');
        });
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('create');
        cy.get('input[formcontrolname="notificationTitle"]').type('e2e demo');
        cy.get('textarea[formcontrolname="notificationText"]').type('e2e demo Text');
        cy.get('input[formcontrolname="contentType"]').type('Meeting link');
        cy.get('.mat-chip').eq(1).click();
        cy.get('.mat-checkbox-input').eq(1).check;
        cy.get('.content-footer').find('button.mat-stroked-button').click();
        cy.get('button[type="submit"]').click();
        // cy.request('POST', '')
        cy.get('.compass-breadcrumb').find('span').eq(1).click();

        // Taxonomy editor flow

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
        cy.get('.compass-breadcrumb').find('.breadcrumb-label').contains('Taxonomy Editor').click();
    });

});