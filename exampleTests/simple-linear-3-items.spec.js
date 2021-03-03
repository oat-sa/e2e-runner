/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

 /**
 * Launch a delivery via LTI, by pre-populating a deployed LTI tool's fields
 * and using it to generate a valid launch link.
 *
 * @param {ltiOptions} options - The options to apply
 */
Cypress.Commands.add('ltiLaunchViaTool', options => {
    const toolUrl = options.toolUrl;
    const launchUrl = options.ltiLaunchUrl;
    const ltiResourceId = options.ltiResourceId;
    const registration = options.registration;

    cy.visit(`${toolUrl}?registration=${registration}&launch_url=${launchUrl}${ltiResourceId}`);

    cy.get('button[name="lti_resource_link_launch[submit]"]').click();

    cy.get('.row .card-footer a').then(($el) => {
        const ltiLink = $el.get(0).getAttribute('href');
        cy.visit(ltiLink);
    });
});

describe('The simple linear test with 3 items', () => {
    beforeEach(() => {
        // TODO: read from env
        // Local
        // cy.ltiLaunch({
        //     ltiBaseLaunchUrl: 'http://localhost:8001/api/v1/auth/launch-lti/',
        //     ltiResourceId: Cypress.env('deliveryIds').local.simpleLinear3items,
        //     ltiReturnUrl: 'http://localhost:8010/thank-you',
        // });

        // OAT-Demo
        cy.ltiLaunchViaTool({
            toolUrl: 'https://lti-demo-oat-demo.dev.gcp.taocloud.org/platform/message/launch/lti-resource-link',
            registration: 'oatDemoDeliverRegistration',
            ltiLaunchUrl: 'https://deliver-oat-demo.dev.gcp.taocloud.org/api/v1/auth/launch-lti-1p3/',
            ltiResourceId: Cypress.env('deliveryIds').oatDemo.simpleLinear3items
        });
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
