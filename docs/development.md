# Development

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
