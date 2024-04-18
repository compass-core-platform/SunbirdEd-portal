describe('Creator', () => {

    beforeEach(() => {
        cy.viewport(1550, 750)
        cy.visit('https://compass-dev.tarento.com/resources');
        cy.get("#username").type('dilu@yopmail.com').should('have.value','dilu@yopmail.com');
        cy.get('#password').type('Admin@123').should('have.value', 'Admin@123');
        cy.get('#login').click();
    });

    it('Should create resources', () => {
        cy.get('.spaces-icon').click();
        cy.get('h3').contains('Workspace').click();
        cy.get('.my-text').contains('Resource').click();
        cy.get('input[placeholder="Name"]').clear().type('Generative AI work?');
        cy.get('#taxonomyCategory4').click();
        cy.get('sui-select-option').eq(2).click();
        cy.get('#taxonomyCategory5').click();
        cy.get('#taxonomyCategory5').find('.menu').should('be.visible').find('sui-select-option').eq(1).click();
        cy.get('.sb-btn-primary').contains('Start creating').click();
        cy.wait(50000);

        cy.get('.iziModal-iframe').should('be.visible').then(($frame:any) => {
                const iframe = $frame.contents;
                iframe.find('.dropdownarrowparent').click();
        });
        
        cy.get('#authoringTextEditor').type('Generative AI testing.');
        cy.get('#authoringTextEditorBtn').click();
        cy.get('#reviewButton').click();
        cy.get('#name').clear().type('GAI').should('have.value', 'GAI');
        cy.get('#description').clear().type('Generative Artificial Intelligence (GenAI) holds enormous transformational potential for businesses.');
        cy.get('.search').click();
        cy.get('.transition').find('item').eq(4).click();
        cy.get('#_selecttaxonomyCategory5').select('Level 2').should('have.value', 'Level 2');
        cy.get('#copyrightYear').clear().type('2024');
        cy.get('.fixed-footer').find('button').contains('Save').click();

    });

    xit('create question set and send it for review', () => {
        cy.get('.spaces-icon').click();
        cy.get('h3').contains('Workspace').click();
        cy.get('.my-text').contains('QuestionSet').click();
        
        cy.get('input[placeholder="Name"]').clear().type('How does Generative AI work?');
        cy.get('textarea[placeholder="Description"]').clear().type('Generative AI works through the use of neural networks, specifically Recurrent Neural Networks (RNNs)');
        cy.get('.sb-dropdown-select').eq(0).select("Earth core concepts").should('have.value', '16: Object');
        cy.get('.sb-dropdown-select').eq(1).select("Level 3").should('have.value', '2: Object');
        cy.get('.sb-timer-input').eq(0).type('01');
        cy.get('.sb-timer-input').eq(1).type('32')
        cy.get('.sb-dropdown-select').eq(3).select("3").should('have.value', '3: 3');
        cy.get('.sb-dropdown-select').eq(4).select("50").should('have.value', '4: 50');
        cy.get('.sb-dropdown-select').eq(5).select("Complete").should('have.value', '1: Complete');
        cy.get('.sb-dropdown-select').eq(6).select("CC BY-NC-SA 4.0").should('have.value', '4: CC BY-NC-SA 4.0 ');
        cy.get('input[placeholder="Copyright & year"]').type('Compass');
        cy.get('.sb-collectionTree-fancyTree .sb-fixed-with-whitebg').find('button').eq(1).click();
        cy.get('input[placeholder="Title"]').clear().type('How does Generative AI work?');
        cy.get('textarea[placeholder="Description"]').clear().type('Generative AI works through the use of neural networks.');
        cy.get('.sb-dropdown-select').eq(1).select("Earth core concepts").should('have.value', '16: Object');
        cy.get('.sb-dropdown-select').eq(2).select("Level 3").should('have.value', '2: Object');
        cy.get('.sb-dropdown-select').eq(3).select("Multiple Choice Question").should('have.value', '1: Multiple Choice Question');
        cy.get('.sb-btn-normal').contains('Create New').click();
        cy.get('.ui .modal').should('be.visible').find('.ui .card').click();
        cy.get('.sb-btn-normal').contains('Next').click();
        cy.wait(2000);
        cy.get('.ck-editor__editable').eq(0).type('what is GAI?');
        cy.get('.ck-editor__editable').eq(1).type('AI that focuses on analyzing data.');
        cy.get('.ck-editor__editable').eq(2).type('AI that generates new content or data.');
        cy.get('#answer_2').check();
        // cy.get('.ck-editor__editable').eq(3).type('AI used for automating repetitive tasks.');
        // cy.get('.optionsLast').eq(15).cle    ar ;
        cy.get('input[placeholder="Title"]').type('Generative AI.');
        cy.get('.sb-dropdown-select').eq(0).select('evaluate').should('have.value', '4: evaluate');
        cy.get('input[placeholder="Marks"]').clear().type('3')
        cy.get('.sb-dropdown-select').eq(3).select('Parent').should('have.value', '2: Parent');
        cy.get('.sb-bg-lightBlue').find('.sb-btn-normal').eq(2).click();
        cy.wait(2000)
        cy.get('.iziToast-close').click();
        cy.get('.sb-bg-lightBlue').find('.sb-btn-normal').eq(2).click();
        cy.wait(200);
        cy.get('.ui .modal').should('be.visible').find('#termAndConditions').click();;
        cy.get('.sb-modal-actions').find('.sb-btn-primary').click();
        cy.get('.publicmenusection a').eq(4).click();
        cy.url().should('contain', 'workspace/content/review/1');
    });

 
    xit('Should login as creator and create Course and send it for review', () => {
            
        cy.get('.spaces-icon').click();
        cy.get('h3').contains('Workspace').click();
        cy.get('.my-text').eq(0).click();

        cy.get('input[placeholder="Title"]').clear().type('Generative AI');
        cy.get('textarea[placeholder="Description"]').clear().type('Generative course testing tranied expert');
        cy.get('input[placeholder="HH"]').clear().type('01');
        cy.get('input[placeholder="MM"]').clear().type('00');
        cy.get('.multi-select-container').eq(0).click();
        cy.get('.sb-modal-dropdown-web ul li').eq(17).click();
        cy.get('.multi-select-container').eq(1).click();
        cy.wait(100);
        cy.get('.sb-modal-dropdown-web').eq(1).find('ul li').eq(2).click();
        cy.get('input[placeholder="Copyright Year"]').type('2024');
        cy.get('.sb-collectionTree-fancyTree .sb-fixed-with-whitebg').find('button').eq(1).click();
        cy.get('input[placeholder="Title"]').clear().type('Generative AI unit');
        cy.get('textarea[placeholder="Description"]').clear().type('Unit 1: Generative course testing trannied expert');
        cy.get('.sb-fixed-with-whitebg').children('.sb-btn-outline-primary').click();
        cy.get('.sb-library-scroll').find('div.sbchapter__item').should('be.visible').eq(22).click();
        cy.get('.sb-btn-dark-green').should('be.visible').eq(0).click();
        cy.get('#addResource').should('be.visible').click();
        cy.wait(8000);
        cy.get('.add-to-library__header').find('.arrow').click();
        cy.get('.sb-bg-lightBlue').find('.sb-btn-primary').click();
        cy.get('.ui .modal').should('be.visible').find('#termAndConditions').click();
        cy.wait(200);
        cy.get('.sb-modal-actions').find('.sb-btn-primary').eq(1).click();
        cy.get('.publicmenusection a').eq(4).click();
        cy.url().should('contain', 'workspace/content/review/1');
    });

   
    

});