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
 * Copyright (c) 2020-21 (original work) Open Assessment Technologies SA ;
 */

import oauth from 'oauth-sign';

/**
 * @typedef {Object} ltiOptions
 * @property {String} ltiVersion - The version of LTI to apply
 * @property {String} ltiResourceId - The identifier of the resource to use
 * @property {String} ltiBaseLaunchUrl - The base URL to build the launch URL
 * @property {String} ltiLaunchUrl - The URL to call to launch the application
 * @property {String} ltiReturnUrl - The URL to redirect to once the application is closed
 * @property {String} ltiKey - The LTI key needed to connect the application
 * @property {String} ltiSecret - The LTI secret needed to connect the application
 * @property {String} ltiRole - The of the user who will launch the application
 * @property {String} ltiLocale - The locale language of the application
 * @property {String} ltiAccessToken - An access token to use instead of building it
 */

/**
 * Default values for the LTI options
 * @type {ltiOptions}
 */
const defaultLtiOptions = {
    ltiVersion: '1p0',
    ltiBaseLaunchUrl: 'http://localhost:8001/api/v1/auth/launch-lti/',
    ltiReturnUrl: 'http://localhost:8010/thank-you',
    ltiRole: 'Learner',
    ltiLocale: 'en-GB'
};

/**
 * List of internal LTI parameters builders per version
 * @type {Object}
 */
const ltiBuilders = {
    /**
     * Builds the LTI parameters for the version 1.0
     * @property {String} ltiResourceId - The identifier of the resource to use
     * @property {String} ltiLaunchUrl - The URL to call to launch the application
     * @property {String} ltiReturnUrl - The URL to redirect to once the application is closed
     * @property {String} ltiKey - The LTI key needed to connect the application
     * @property {String} ltiSecret - The LTI secret needed to connect the application
     * @property {String} ltiRole - The of the user who will launch the application
     * @property {String} ltiLocale - The locale language of the application
     * @returns {Object}
     */
    lti1p0({ ltiResourceId, ltiLaunchUrl, ltiKey, ltiSecret, ltiRole, ltiReturnUrl, ltiLocale }) {
        const timestamp = Math.round(Date.now() / 1000);
        const ltiParams = {
            // LTI Required Parameters
            lti_message_type: 'basic-lti-launch-request',
            lti_version: 'LTI-1p0',
            resource_link_id: ltiResourceId,
            // OAuth 1.0a Required Parameters
            oauth_consumer_key: ltiKey,
            oauth_nonce: btoa(`${timestamp}`),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: timestamp,
            oauth_version: '1.0',
            // Context Parameters
            context_id: `S${timestamp}${Math.round(Math.random() * 10)}`,
            roles: ltiRole,
            launch_presentation_locale: ltiLocale,
            launch_presentation_return_url: ltiReturnUrl
        };

        ltiParams.oauth_signature = oauth.hmacsign('POST', ltiLaunchUrl, ltiParams, ltiSecret);

        return ltiParams;
    }
};

/**
 * Loads options, defaulting to values from the config or for the internal defaults
 * @param {ltiOptions} options
 * @returns {ltiOptions}
 */
function getLtiOptions(options) {
    const {
        ltiVersion,
        ltiAccessToken,
        ltiResourceId,
        ltiBaseLaunchUrl,
        ltiLaunchUrl,
        ltiReturnUrl,
        ltiKey,
        ltiSecret,
        ltiRole,
        ltiLocale
    } = Cypress.env();

    const refinedOptions = Object.assign(
        {},
        defaultLtiOptions,
        {
            ltiVersion,
            ltiAccessToken,
            ltiResourceId,
            ltiBaseLaunchUrl,
            ltiLaunchUrl,
            ltiReturnUrl,
            ltiKey,
            ltiSecret,
            ltiRole,
            ltiLocale
        },
        options
    );

    refinedOptions.ltiLaunchUrl =
        refinedOptions.ltiLaunchUrl || `${refinedOptions.ltiBaseLaunchUrl}${refinedOptions.ltiResourceId}`;

    return refinedOptions;
}

/**
 * Launch a LTI application.
 *
 * @example
 *
 * // launch a new application of the resource
 * cy.ltiLaunch({ltiResourceId: '0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287'});
 *
 * // take over an existing launch
 * cy.ltiLaunch({ltiAccessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI2YzBhZGJ0zNDU0-0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287-4'});
 *
 * @param {ltiOptions} options - The options to apply
 */
Cypress.Commands.add('ltiLaunch', options => {
    const ltiOptions = getLtiOptions(options);

    if (ltiOptions.ltiAccessToken) {
        Cypress.log({
            name: 'ltiLaunch',
            message: 'Pre-built access token',
            consoleProps() {
                return {
                    'LTI Access Token': ltiOptions.ltiAccessToken
                };
            }
        });

        cy.visit(`/?accessToken=${ltiOptions.ltiAccessToken}`);
    } else {
        const ltiBuilder = ltiBuilders[`lti${ltiOptions.ltiVersion}`];
        const ltiParams = ltiBuilder && ltiBuilder(ltiOptions);

        Cypress.log({
            name: 'ltiLaunch',
            message: `${!ltiBuilder ? 'WARNING: Unsupported ' : ''}LTI version ${ltiOptions.ltiVersion}`,
            consoleProps() {
                return {
                    'LTI Version': ltiOptions.ltiVersion,
                    'LTI Resource ID': ltiOptions.ltiResourceId,
                    'LTI Launch URL': ltiOptions.ltiLaunchUrl,
                    'LTI Return URL': ltiOptions.ltiReturnUrl,
                    'LTI Key': ltiOptions.ltiKey,
                    'LTI Secret': ltiOptions.ltiSecret,
                    'LTI Role': ltiOptions.ltiRole,
                    'LTI Presentation Locale': ltiOptions.ltiLocale,
                    'LTI Params': ltiParams
                };
            }
        });

        cy.visit({
            url: ltiOptions.ltiLaunchUrl,
            method: 'POST',
            body: ltiParams
        });
    }
});

/**
 * Launch a LTI application with parameters via the LTI 1.3 Demo tool
 *
 * @example
 * cy.ltiLaunch({toolUrl: 'http://demo.tool', regstration: 'default', ltiLaunchUrl: 'https://lti.app/api/v1/auth/launch-lti-1p3/', ltiResourceId: '0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287'});
 *
 * @param {ltiOptions} options
 */
Cypress.Commands.add('ltiLaunchViaTool', options => {
    const toolUrl = options.toolUrl;
    const registration = options.registration;
    const ltiLaunchUrl = options.ltiLaunchUrl;
    const ltiResourceId = options.ltiResourceId;
    const ltiReturnUrl = options.ltiReturnUrl;
    const ltiLocale = options.ltiLocale;

    cy.visit(`${toolUrl}?registration=${registration}&launch_url=${ltiLaunchUrl}${ltiResourceId}`);

    // Fill claims field
    if (ltiReturnUrl || ltiLocale) {
        cy.get('#lti_resource_link_launch_claims').then(textarea => {
            textarea.value = JSON.stringify({
                "https://purl.imsglobal.org/spec/lti/claim/launch_presentation": {
                    "return_url": ltiReturnUrl,
                    "locale": ltiLocale
                }
            });
        });
    }

    // Generate launch link
    cy.get('button[name="lti_resource_link_launch[submit]"]').click();

    cy.get('.row .card-footer a').then(($el) => {
        const ltiLink = $el.get(0).getAttribute('href');
        cy.visit(ltiLink);
    });
});
