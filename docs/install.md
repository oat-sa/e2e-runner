# Installation

The `e2e-runner` is intended to be installed as a dependency in the project you plan to test.

```sh
# in your project root
npm install @oat-sa-private/e2e-runner --save-dev
```

Next, add npm scripts to your project's `package.json`:

```json
"scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run"
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

## Create environment config(s)

Create a file `cypress.env.json` containing values specific to your test environment. You may want more than one version of this file if you wish to test on several envs (e.g. local / remote).

Alternatively, you can use a different env file by configuring, in `cypress.json`:

```json
{
    "env": {
        "configFile": "cypress/envs/my-env.json"
    }
}
```

This opens up the possibility to change environment configs at launch time via the CLI (see [Scripts](./development.md#scripts)).

The values within this object can be accessed in your tests via `Cypress.env('keyName')`. Nested values are supported too.
