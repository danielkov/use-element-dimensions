const sizes = [[100, 300], [400, 25], [1024, 800], [1920, 1080]];

describe("initializes on sizes", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    // An excpetion gets thrown when ran in Cypress about the observer event
    // not finishing on time - we ignore this.
    return false;
  });

  before(() => {
    cy.visit("/");
  });

  beforeEach(function() {
    cy.get("#test-container").as("container");
  });

  sizes.forEach(size => {
    it(`should respond to ${JSON.stringify(size)}`, () => {
      cy.viewport.apply(cy, size);
      cy.get("@container").contains(`width: ${size[0]} height: ${size[1]}`);
    });
  });
});
