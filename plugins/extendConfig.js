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

const fs = require('fs-extra');
const path = require('path');

/**
 * Reads env config from file
 * @see https://docs.cypress.io/api/plugins/configuration-api.html#Switch-between-multiple-configuration-files
 * @param {String} envConfigFile
 * @returns {Promise} resolves to JSON
 */
function getConfigurationByFile(envConfigFile) {
    const pathToEnvConfigFile = path.resolve(envConfigFile);
    return fs.readJson(pathToEnvConfigFile);
}

/**
 * Extends Cypress env config with data from file
 * specified on env.configFile key, if exists
 * @param {Object} config - Cypress config file
 * @returns {Object} - Extended Cypress config
 */
function extendConfig(config) {
    if (config && config.env && config.env.configFile) {
        return getConfigurationByFile(config.env.configFile).then(configJson => {
            Object.assign(config.env, configJson);
            return config;
        });
    }
    return config;
}

module.exports = extendConfig;
