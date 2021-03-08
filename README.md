# e2e-runner

End-to-end test runner based on [Cypress](https://www.cypress.io/), for testing any application.

This is the core system, which contains only the Cypress library, some common plugins, and some shared code to be imported into your local test files as needed.

## Install

The `e2e-runner` is intended to be installed as a dependency in the project you plan to test.

```sh
# in your project root
npm install @oat-sa-private/e2e-runner --save-dev
```

Next, add an npm script to your project's `package.json`:

```json
"scripts": {
    "cy:open": "cypress open"
}
```

After running `npm run cy:open` for the first time, `cypress.json` and the `cypress` folder will be created in your project root:

<pre>
|-- cypress.json      # Your main configuration file
|-- cypress/
  |-- fixtures/         # Static fixtures for your tests
  |-- integration/      # Example tests / your tests
  |-- plugins/          #
  |-- screenshots/      # Output of failed tests
  |-- support/          # The place for local support commands
</pre>

### Create environment config(s)

Create a file `cypress.env.json` containing values specific to your test environment. You may want more than one version of this file if you wish to test on several envs (e.g. local / remote).

Alternatively, you can use a different env file by configuring, in `cypress.json`:

```json
{
    "env": {
        "configFile": "path/to/another/file.json"
    }
}
```

This opens up the possibility to change environment configs via the CLI (see [Scripts](#scripts)).

The values within this object can be accessed in your tests via `Cypress.env('keyName')`. Nested values are supported too.

## Commands

In `e2e-runner`'s `support/` folder you will find files of reusable commands, grouped by topic. Each file registers a number of commands to the `Cypress.Commands` collection. To make these commands available in your local project, simply import the whole file for its side effects:

```js
// e2e-runner/support/sharedCommands.js
Cypress.Commands.add('myCommand', (params) => { ... });
Cypress.Commands.add('myOtherCommand', (params) => { ... });

// project/cypress/support/commands.js
import '@oat-sa-private/e2e-runner/support/sharedCommands.js';
```

In your local project's `support/` folder, any and all types of helpers can be defined, which may use or compose the imported commands if desired.

### Commands from third-party dependencies

Some plugins also register commands. You can import these files (for their side effects) in you local project's support file.

## Plugins

Current recommendation is to install all plugins as dependencies of `e2e-runner` only. Then, edit your local `cypress.json` to point to the `plugins` folder of `e2e-runner`:

```json
{
  "pluginsFile": "../node_modules/@oat-sa-private/e2e-runner/plugins",
}
```

## Development

To develop in `e2e-runner` while having it linked to a local project:

Clone the repository

```sh
git clone git@github.com:oat-sa/e2e-runner.git
```

Install the dependencies

```sh
cd e2e-runner
npm install
```

Link the package

```sh
# in e2e-runner
npm link

# in your project root
npm link @oat-sa-private/e2e-runner
```

The cloned repo should now be symlinked into your project's `node_modules`, for easy development.

## Scripts

<a name="#scripts"></a>

The following are examples of npm scripts you could set up in your local project. This takes advantage of Cypress configuration being [overridable by environment variables](https://docs.cypress.io/guides/guides/environment-variables.html) prefixed with `CYPRESS_` and by `--env` flags. This can be useful in CI.

Open Cypress interface

```sh
npm run cy:open # mapped to "cypress open"
```

Run Cypress headlessly

```sh
npm run cy:run # mapped to "cypress run"
```

Run Cypress using another browser

```sh
npm run cy:run:firefox # mapped to "cypress run --browser firefox"
```

Run a specific test:

```sh
CYPRESS_testFiles="**/myTest.spec.js" npm run cy:run
```

Run tests from another folder:

```sh
CYPRESS_integrationFolder=exampleTests npm run cy:run
```

Run tests on another domain:

```sh
CYPRESS_baseUrl=http://example.com npm run cy:run
```

Run tests with a whole other env config file:

```sh
npm run cy:run:demoenv # mapped to cypress run --env cypress/envs/env-demo.json
```
