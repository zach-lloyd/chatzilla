describe("Full User Journey", () => {
  it("allows a user to sign in, create a room, and send a message", () => {
    // Step 1: Visit the sign-in page and log in
    cy.loginByApi();
    cy.visit("/");
    // Step 2: Assert we landed on the home page after login
    // We wait for the Nav Panel button to appear to know the page is ready.
    cy.get('[aria-label="Open navigation panel"]').should("be.visible");

    // Step 3: Open the nav panel and click to create a new room
    cy.get('[aria-label="Open navigation panel"]').click();
    cy.get("button").contains("Create New Room").click();

    // Step 4: Fill out the new room form and submit it
    const roomName = "My Cypress Test Room";
    cy.get('[placeholder="Name your room..."]').type(roomName);
    cy.get("button").contains("Create Room").click();

    // Step 5: Assert that we were navigated to the new room's page
    cy.contains("h1", roomName).should("be.visible");

    // Step 6: Type a message and send it
    const testMessage = "This is a test message!";
    cy.get('[placeholder*="Tell the room"]').type(testMessage);
    cy.get('[alt="Send message"]').click();

    // Step 7: Assert that the new message appears in the message list
    cy.contains(testMessage).should("be.visible");
  });
});
