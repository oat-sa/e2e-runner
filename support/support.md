# Support

In this folder you'll find some files with shared Cypress commands and functions. When adding commands, please create new files as needed, to keep things organised and prevent any file from growing too big (2-5 commands is a guideline).

These files will ususally be imported directly by consumers for their side effects:

```js
import '@oat-sa/e2e-runner/support/sharedCommands.js';
```

It's also permitted to define exports if another use case requires it.
