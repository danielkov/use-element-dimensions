const preset = "macbook-15";
const dimensions = {
  landscape: [900, 1440],
  portrait: [1440, 900]
};

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

  Object.entries(dimensions).forEach(([name, size]) => {
    it(`${name} should be ${JSON.stringify(size)}`, () => {
      cy.viewport(preset, name);
      cy.get("@container").contains(`width: ${size[0]} height: ${size[1]}`);
    });
  });
});
