# Plugins & Commands

Plugins and commands make up over 90% of what is provided by `e2e-runner`.

## Plugins

Shared plugins can be added to `e2e-runner`, either by writing them here, or installing as dependencies. The idea is to create a file in `e2e-runner/plugins/` which exports the functionality you want to expose.

Projects can then import the plugins they need and compose them in their local `pluginsFile`.

### Bundled plugins

- [cypress-plugin-snapshots](https://github.com/meinaart/cypress-plugin-snapshots) - takes visual snapshots for comparison with subsequent test runs
- extendConfig - Extends Cypress config file with environment variables

## Commands

In `e2e-runner`'s `support/` folder you will find files of reusable commands, grouped by topic. Each file registers a number of commands to the `Cypress.Commands` collection. To make these commands available in your local project, simply import the whole file for its side effects:

```js
// e2e-runner/support/sharedCommands.js
Cypress.Commands.add('myCommand', (params) => { ... });
Cypress.Commands.add('myOtherCommand', (params) => { ... });

// project/cypress/support/commands.js
import '@oat-sa/e2e-runner/support/sharedCommands.js';
```

In your local project's `support/` folder, any and all types of helpers can be defined, which may use or compose the imported commands if desired.

### Commands from third-party dependencies

Some plugins also register commands. You can import these files (for their side effects) in your local project's support file:

#### Visual Testing Plugin ####

```json
// cypress.json
{
    "screenshotsFolder": "@oat-sa/e2e-runner/cypress/snapshots/actual",
    "env": {
        "SNAPSHOT_BASE_DIRECTORY": "@oat-sa/e2e-runner/cypress/snapshots/base",
        "INTEGRATION_FOLDER": "@oat-sa/e2e-runner/cypress/integration",
        "type": "base"
    },
    "trashAssetsBeforeRuns": true,
    "videos": false
}
```

```js
// project/cypress/support/index.js
const compareSnapshotCommand = require('cypress-visual-regression/dist/command');

compareSnapshotCommand();
```

```js
// project/cypress/plugins/index.js
const extendConfig = require('@oat-sa/e2e-runner/plugins/extendConfig.js');
const initSnapshotPlugin = require('@oat-sa/e2e-runner/plugins/snapshots.js');

module.exports = (on, config) => {
    // plugin inits
    const snapshotConfig = initSnapshotPlugin(on, config);
    config = {...config, ...snapshotConfig};

    // apply secondary configfile from path defined by env.configFile
    return extendConfig(config);
}
```
