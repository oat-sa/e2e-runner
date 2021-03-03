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
    "cy:open": "cypress open --project cypress"
}
```

The `--project` flag defines that a folder called `cypress` - relative to the project root - will be used as the basis for the local Cypress project.

After running `npm run cy:open` for the first time, a folder structure will be created in your project root:

<pre>
|-- cypress/
  |-- fixtures/         # Static fixtures for your tests
  |-- integration/      # Example tests / your tests
  |-- plugins/          # The place to init local Cypress plugins
  |-- screenshots/      # Output of failed tests
  |-- support/          # The place for local support commands
  |-- cypress.json      # Your main configuration file
</pre>

### Create environment config(s)

Create a file `cypress/cypress.env.json` containing values specific to your test environment. You may want more than one version of this file if you wish to test on several envs (e.g. local / remote).

The values within this object can be accessed in your tests via `Cypress.env('keyName')`.

## Commands

In your local project, and and all types of helpers can be defined within `support/`. Many of these will likely register commands using the `cy.Commands.add()` syntax.

In `e2e-runner`'s `support/` folder, however, it's preferable to export plain functions, which can them be registered as commands in the projects that need them.

```js
// e2e-runner/support/myfile.js
export function myCommand(params) { ... }

// project/support/commands.js
import { myCommand } from '@oat-sa-private/e2e-runner/support/lti.js';

Cypress.Commands.add('myCommand', myCommand);
```

## Plugins

Current recommendation is to install all plugins as dependencies of `e2e-runner` only. Then, edit your local `cypress.json` to point to the `plugins` folder of `e2e-runner`:

```json
{
  "pluginsFile": "../node_modules/@oat-sa-private/e2e-runner/plugins",
}
```

There could also be a way to use both centralised and local plugins.

## Develop

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

## NPM Commands

Scan for and run all tests:

```sh
npm run test
```

Run specific test:

```sh
npm run test <testname>
```

Run tests on another domain:

```sh
CYPRESS_baseUrl=http://example.com npm run test
```

Run tests from other location:

```sh
CYPRESS_integrationFolder=exampleTests npm run test
```

Modify pattern of test files:

```sh
CYPRESS_testFiles="**/e2e/*.spec.js" npm run test
```

Open Cypress interface

```sh
npm run cy:open
```

## Environment variables

You can use environment variables in your tests from the command line, which can be defined like so:

```sh
CYPRESS_foo=bar npm run test
```

and you can use it in your test like:

```js
const foo = Cypress.env('foo');
```
