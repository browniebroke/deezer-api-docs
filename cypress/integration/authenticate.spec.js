// authenticate.spec.js created with Cypress
require("isomorphic-fetch");

function triggerScraper(githubToken, sessionId) {
  // https://docs.github.com/en/rest/reference/actions#create-a-workflow-dispatch-event
  const REPO = "browniebroke/deezer-api-docs";
  const API_ROOT = "https://api.github.com";
  return fetch(
    `${API_ROOT}/repos/${REPO}/actions/workflows/scrape.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${githubToken}`,
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { deezer_session_id: sessionId },
      }),
    }
  );
}

context("Authenticate", () => {
  it("Fill login", () => {
    cy.visit("https://connect.deezer.com/login.php");

    cy.get("input#login_mail").type("alla.brunoo@gmail.com");
    cy.get("input#login_password").type(Cypress.env("DEEZER_PASSWORD"));
    cy.get("button#login_form_submit").click();

    cy.wait(1000);

    // Extract sid cookie value and trigger scrape workflow
    cy.getCookie("sid").then((cookie) => {
      const cookieValue = cookie.value;
      triggerScraper(Cypress.env("GITHUB_PERSONAL_TOKEN"), cookieValue).then(
        (response) => {
          console.log(response.status);
        }
      );
    });

    // Keep the browser open until the Scrape workflow is finished
    cy.wait(30000);
  });
});
