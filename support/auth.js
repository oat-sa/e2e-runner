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
 * General-purpose login request matching the format of the TAO login form
 * @param {Object} options
 * @param {String} options.url
 * @param {String} options.username
 * @param {String} options.password
 */
Cypress.Commands.add('login', ({ url, username, password }) => {
    cy.request({
        method: 'POST',
        url,
        form: true,
        body: {
            login: username,
            password: password,
            loginForm_sent: 1
        }
    });
});
