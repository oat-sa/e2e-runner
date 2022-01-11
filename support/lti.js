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
 * @property {Object} ltiCustom - Custom claims, such as availableActions and groups.allContexts
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
 * Gets a random number having the expected number of digits
 * @param {Number} digits
 * @returns {Number}
 */
const randomInt = digits => Math.round(Math.random() * Math.pow(10, digits || 1));

/**
 * List of internal LTI parameters builders per version
 * @type {Object}
 */
const ltiBuilders = {
    /**
     * Builds the LTI parameters for the version 1.0
     * @param {ltiOptions} options
     * @property {String} options.ltiResourceId - The identifier of the resource to use
     * @property {String} options.ltiLaunchUrl - The URL to call to launch the application
     * @property {String} [options.ltiReturnUrl] - The URL to redirect to once the application is closed
     * @property {String} options.ltiKey - The LTI key needed to connect the application
     * @property {String} options.ltiSecret - The LTI secret needed to connect the application
     * @property {String} options.ltiRole - The of the user who will launch the application
     * @property {String} [options.ltiLocale] - The locale language of the application
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
            context_id: `S${timestamp}${randomInt(1)}`,
            user_id: `${randomInt(6)}`,
            roles: ltiRole
        };
        // Optional parameters
        if (typeof ltiLocale === 'string' && ltiLocale.length) {
            ltiParams.launch_presentation_locale = ltiLocale;
        }
        if (typeof ltiReturnUrl === 'string' && ltiReturnUrl.length) {
            ltiParams.launch_presentation_return_url = ltiReturnUrl;
        }

        ltiParams.oauth_signature = oauth.hmacsign('POST', ltiLaunchUrl, ltiParams, ltiSecret);

        return ltiParams;
    }
};

/**
 * Loads options, defaulting to values from the config or from the internal defaults
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
        refinedOptions.ltiLaunchUrl || `${refinedOptions.ltiBaseLaunchUrl}${refinedOptions.ltiResourceId || ''}`;

    return refinedOptions;
}

/**
 * Builds an object representing the claims for an LTI launch
 * @param {ltiOptions} options
 * @returns {Object} all claims, JSON format
 */
function prepareLtiClaims(options) {
    const { ltiReturnUrl, ltiLocale, ltiContext, nrps, nrpsMembershipsUrl, ltiRole, ltiCustom } = options;
    const claims = {};
    const launchPresentationClaims = {};

    if (ltiReturnUrl || ltiLocale) {
        if (ltiReturnUrl) {
            Object.assign(launchPresentationClaims, {
                return_url: ltiReturnUrl
            });
        }
        if (ltiLocale) {
            Object.assign(launchPresentationClaims, {
                locale: ltiLocale
            });
        }
        Object.assign(claims, {
            'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': launchPresentationClaims
        });
    }

    if (ltiContext) {
        Object.assign(claims, {
            'https://purl.imsglobal.org/spec/lti/claim/context': {
                id: ltiContext
            }
        });
    }

    if (nrps) {
        Object.assign(claims, {
            'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice': {
                context_memberships_url: nrpsMembershipsUrl,
                service_versions: ['2.0']
            }
        });
    }
    if (ltiRole) {
        Object.assign(claims, {
            'https://purl.imsglobal.org/spec/lti/claim/roles': [ltiRole]
        });
    }

    if (ltiCustom) {
        Object.assign(claims, {
            'https://purl.imsglobal.org/spec/lti/claim/custom': ltiCustom
        });
    }

    Cypress.log({
        name: 'prepareLtiClaims',
        message: 'LTI claims',
        consoleProps() {
            return claims;
        }
    });

    return claims;
}

/**
 * Launch a LTI application.
 *
 * @example
 * // launch a new application of the resource
 * cy.ltiLaunch({ltiResourceId: '0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287'});
 *
 * @param {ltiOptions} options - The options to apply
 */
Cypress.Commands.add('ltiLaunch', options => {
    const ltiOptions = getLtiOptions(options);
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
});

/**
 * Launch a LTI application with parameters via the LTI 1.3 Demo tool
 * To work, toolUrl and ltiBaseLaunchUrl need to share same domain
 *
 * @example
 * cy.ltiLaunchViaTool({
 *   toolUrl: 'http://demo.lti.app',
 *   registration: 'default',
 *   ltiBaseLaunchUrl: 'https://launch.lti.app/api/v1/auth/launch-lti-1p3/',
 *   ltiResourceId: '0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287'
 * });
 *
 * @param {ltiOptions} options
 */
Cypress.Commands.add('ltiLaunchViaTool', options => {
    const toolUrl = options.toolUrl;
    const registration = options.registration;
    const ltiBaseLaunchUrl = options.ltiBaseLaunchUrl;
    const ltiResourceId = options.ltiResourceId || '';

    cy.visit(`${toolUrl}?registration=${registration}&launch_url=${ltiBaseLaunchUrl}${ltiResourceId}`);

    // Fill claims field
    const claims = prepareLtiClaims(options);

    cy.get('#lti_resource_link_launch_claims')
        .then(textarea => (textarea[0].value = JSON.stringify(claims)))
        .then(() => {
            // Generate launch link
            cy.contains('Generate').click();

            cy.contains('.btn', 'Launch LtiResourceLinkRequest').then($el => {
                // link has target="_blank" which we don't want to obey
                const ltiLink = $el.get(0).getAttribute('href');
                cy.visit(ltiLink);
            });
        });
});

/**
 * Returns the launch URL of an LTI application
 *
 * The command uses the API of `demo-lti1p3`
 * (https://github.com/oat-sa/demo-lti1p3/blob/master/doc/api.md#ltiresourcelinkrequest-launch-generation-endpoint)
 *
 * @example
 * cy.getLtiLaunchUrl({
 *   toolUrl: 'http://demo.lti.app/api/launch',
 *   authToken: 'q4s7fv80n9eq5z5f7fgs',
 *   registration: 'default',
 *   ltiResourceId: '0d3d8b41-7af1-4ad1-9fc0-5f9b1db23287',
 * body: {
            target_link_uri: "https://testrunner-oat-demo.dev.gcp-eu.taocloud.org/api/v1/auth/launch-lti-1p3/44b26693d772",
            registration,
            claims,
            user: {
                id: "pepe"
            }
        }
 * });
 *
 * @param {ltiOptions} options
 */
Cypress.Commands.add('getLtiLaunchUrl', options => {
    const { toolUrl, authToken, registration, targetLink, user } = options;
    const claims = prepareLtiClaims(options);

    cy.request({
        method: 'POST',
        url: `${toolUrl}/api/platform/messages/ltiResourceLinkRequest/launch`,
        auth: {
            bearer: authToken
        },
        body: {
            target_link_uri: targetLink,
            registration,
            claims,
            user
        }
    }).then(response => response.body.link);
});

/**
 * Creates NRPS membership on devkit
 * The command uses the API of devkit-lti1p3: https://oat-sa.github.io/doc-lti1p3/devkit/doc/api/
 * @param {ltiOptions} options
 */
Cypress.Commands.add('createNRPSMembership', options => {
    const { toolUrl, authToken, id, context, members, registration } = options;
    cy.request({
        method: 'POST',
        url: `${toolUrl}/api/platform/nrps/memberships`,
        auth: {
            bearer: authToken
        },
        body: {
            id,
            context,
            members,
            registration
        }
    });
});

/**
 * Deletes NRPS membership on devkit
 * The command uses the API of devkit-lti1p3: https://oat-sa.github.io/doc-lti1p3/devkit/doc/api/
 * @param {ltiOptions} options
 */
Cypress.Commands.add('DeleteNRPSMembership', options => {
    const { toolUrl, authToken, id } = options;

    cy.request({
        method: 'DELETE',
        url: `${toolUrl}/api/platform/nrps/memberships/${id}`,
        auth: {
            bearer: authToken
        }
    });
});

/**
 * Creates ACS assessment on devkit
 * The command uses the API of devkit-lti1p3: https://oat-sa.github.io/doc-lti1p3/devkit/doc/api/
 * @param {ltiOptions} options
 */
Cypress.Commands.add('createACSAssessment', options => {
    const { toolUrl, authToken, id, status } = options;
    cy.request({
        method: 'POST',
        url: `${toolUrl}/api/platform/proctoring/assessments`,
        auth: {
            bearer: authToken
        },
        body: {
            id,
            status
        }
    }).then(response => response.body.acs_url);
});

/**
 * Deletes ACS assessment on devkit
 * The command uses the API of devkit-lti1p3: https://oat-sa.github.io/doc-lti1p3/devkit/doc/api/
 * @param {ltiOptions} options
 */
Cypress.Commands.add('deleteACSAssessment', options => {
    const { toolUrl, authToken, id } = options;
    cy.request({
        method: 'DELETE',
        url: `${toolUrl}/api/platform/proctoring/assessments/${id}`,
        auth: {
            bearer: authToken
        }
    });
});
