describe('Autenticación', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/#/');
  });

  it('permite iniciar sesión cuando las credenciales son válidas', () => {
    cy.intercept('POST', '/auth/login', (req) => {
      expect(req.body).to.deep.equal({ usuario: 'demo', password: 'demo123' });
      req.reply({
        statusCode: 200,
        body: { token: 'token-falso' }
      });
    }).as('loginRequest');

    cy.findByLabelText('Usuario').type('demo');
    cy.findByLabelText('Contraseña').type('demo123');

    cy.contains('button', 'Iniciar sesión').click();
    cy.contains('button', 'Iniciando sesión...').should('exist');

    cy.wait('@loginRequest');

    cy.location('hash').should('eq', '#/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.eq('token-falso');
    });

    cy.findByText('Bienvenido al Dashboard de PredictMRS').should('be.visible');
    cy.findByText('Próximas Citas').should('be.visible');
  });

  it('muestra un mensaje de error cuando las credenciales son incorrectas', () => {
    cy.intercept('POST', '/auth/login', {
      statusCode: 401,
      body: { error: 'Credenciales incorrectas' }
    }).as('loginError');

    cy.findByLabelText('Usuario').type('demo');
    cy.findByLabelText('Contraseña').type('incorrecta');

    cy.contains('button', 'Iniciar sesión').click();

    cy.wait('@loginError');

    cy.findByRole('alert').should('contain.text', 'Credenciales incorrectas');
    cy.contains('button', 'Iniciar sesión').should('not.be.disabled');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});
