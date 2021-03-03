/**
 * Simulates a tab keypress
 * Should be deprecated if and when Native Events lands in Cypress
 * @see https://github.com/cypress-io/cypress/issues/311
 * @see https://github.com/cypress-io/cypress/issues/299#issuecomment-380197761
 *
 * @usage
 * Cypress.Commands.add('typeTab', typeTab);
 * cy.get('button').typeTab(true);
 */
export function typeTab(shiftKey = false) {
    cy.focused().trigger('keydown', {
        keyCode: 9,
        which: 9,
        shiftKey: shiftKey
    });
}
