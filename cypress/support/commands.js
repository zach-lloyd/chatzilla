// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// I created this command to address login problems related to my frontend and
// backend using different ports and the session cookie not being correctly
// recognized/sent. This logs the user in, caches all the session data, and
// automatically restores it before each test that needs it.
Cypress.Commands.add("loginByApi", (email, password) => {
  const rails = Cypress.env("RAILS_HOST") || "http://localhost:3000";

  cy.request({
    method: "POST",
    url: `${rails}/sign_in`,
    form: true, // Devise expects url-encoded params
    body: { user: { email, password } },
  }).then(({ headers, status }) => {
    expect(status).to.eq(302); // Devise redirects on success
    const cookie = headers["set-cookie"].find((c) =>
      c.startsWith("_messenger_session")
    );
    const value = cookie.split(";")[0].split("=")[1];

    cy.setCookie("_messenger_session", value); // now the SPA is logged in
  });
});
