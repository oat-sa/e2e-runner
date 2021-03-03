describe('The simple linear test with 3 items', () => {
    beforeEach(() => {
        // TODO: read from env
        // Local
        cy.ltiLaunch({
            ltiBaseLaunchUrl: 'http://localhost:8001/api/v1/auth/launch-lti/',
            ltiResourceId: Cypress.env('deliveryIds').local.simpleLinear3items,
            ltiReturnUrl: 'http://localhost:8010/thank-you',
        });

        // OAT-Demo
        // cy.ltiLaunchViaTool({
        //     toolUrl: 'https://lti-demo-oat-demo.dev.gcp.taocloud.org/platform/message/launch/lti-resource-link',
        //     registration: 'oatDemoDeliverRegistration',
        //     launchUrl: 'https://deliver-oat-demo.dev.gcp.taocloud.org/api/v1/auth/launch-lti-1p3/',
        //     ltiResourceId: Cypress.env('deliveryIds').oatDemo.simpleLinear3items
        // });
    });

    it('successfully runs', () => {
        // choose choice 2
        cy.get('.qti-choiceInteraction li:nth-of-type(2) label').click();

        cy.get('button[name=next]').click();

        // choose choice 3 then 1
        cy.get('.qti-choiceInteraction li:nth-of-type(3) label').click();
        cy.get('.qti-choiceInteraction li:nth-of-type(1) label').click();

        cy.get('button[name=next]').click();

        // choose and unset choice 3
        cy.get('.qti-choiceInteraction li:nth-of-type(3) label').click();
        cy.get('.qti-choiceInteraction li:nth-of-type(3) label').click();

        cy.get('button[name=next]').click();

        // screenshot
        cy.document().toMatchImageSnapshot({
            imageConfig: {
                threshold: 0.001
            },
        });

        cy.get('button[name=overview-submit]').click();

        cy.get('.dialog button.secondary').click(); // add test-ids to dialog buttons

        cy.get('.the-end button').click(); // add test-id

        // assert return url
        cy.location().then((location) => {
            expect(location.origin + location.pathname).to.equal(Cypress.env('ltiReturnUrl')); // lti_message, lti_log?
            const params = new URLSearchParams(location.search);
            expect(params.get('lti_msg')).to.equal('Test is finished');
        });
    });
});
