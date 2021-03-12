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
 * Copyright (c) 2019-21 (original work) Open Assessment Technologies SA ;
 */

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const { initPlugin: initSnapshotPlugin } = require('cypress-plugin-snapshots/plugin');

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
 * Responsible for init of third-party plugins
 * Also extends config object
 * This function is called when a project is opened or re-opened (e.g. due to the project's config changing)
 *
 * @type {Cypress.PluginConfig}
 * @param {function} on used to hook into various events Cypress emits
 * @param {Object} config the resolved Cypress config
 */
module.exports = (on, config) => {
    // plugin inits
    initSnapshotPlugin(on, config);

    // extend main config with env config, if env.configFile key exists
    if (config && config.env && config.env.configFile) {
        return getConfigurationByFile(config.env.configFile).then(configJson => {
            Object.assign(config.env, configJson);
            return config;
        });
    }
    return config;
};
