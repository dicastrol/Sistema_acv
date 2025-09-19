import '@testing-library/cypress/add-commands';

// Prevent failing tests due to uncaught exceptions triggered by external scripts.
Cypress.on('uncaught:exception', () => false);
