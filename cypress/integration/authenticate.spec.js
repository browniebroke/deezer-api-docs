// authenticate.spec.js created with Cypress

context('Authenticate', () => {
    it('Fill login', () => {
        cy.visit('https://connect.deezer.com/login.php')

        cy.get('input#login_mail').type("alla.brunoo@gmail.com")
        cy.get('input#login_password').type(Cypress.env('DEEZER_PASSWORD'))
        cy.get('button#login_form_submit').click()

        cy.wait(1000)

        // Extract sid cookie value and write to .env file
        cy.getCookie('sid').then((cookie) => {
            console.log(cookie)
            cy.writeFile('.sid', `${cookie.value}`)
        })
    })
})
