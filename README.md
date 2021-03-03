# e2e-runner

End-to-end test runner based on [Cypress](https://www.cypress.io/), for testing any application.

## Install

Clone the repository

```sh
git clone git@github.com:oat-sa/e2e-runner-ng.git
```

Install the dependencies

```sh
cd e2e-runner
npm i
```

Create your local config

```sh
cp cypress.env.sample.json cypress.env.json
```

This file contains some configuration which can be used to override the project defaults defined in `cypress.json` in the root of this project (which is not intended to be modified).

Do not forget to fill in your local information. Please refer to the [Configure](#configure) section.

## Configure

Open the file `cypress.env.json` with your favourite editor, and fill with your own information:

TODO

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

## Project structure

<pre>
|-- commands            # Global commands
    |-- index.js        # Entry point
    |-- auth.js         # Authentication commands
    |-- server.js       # Server setup
|
|-- data                # Global data
    |-- users.js        # User list
|
|-- exampleTests        # Example tests for TaoCE
|-- plugins             # Plugin files
|-- screenshots         # Screenshots about failed tests
|-- scripts             # Helper script for the project
    |-- test.js         # Test runner
|
|-- cypress.json        # Cypress config file
|-- cypress.env.sample.json   # Sample local config file
</pre>
