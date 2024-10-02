describe('Логин страница', function() {

    it('Должна возвр страниц логин', function() {
      browser.get('http://localhost:4200/login');

      var heading = element(by.css('h1'));
  
      expect(heading.getText()).toEqual('Логин');
    });
  });

describe('Login Page', function() {

    it('should enter email, click confirm, and check localStorage for token', async function() {
      await browser.get('http://localhost:4200/login');
  
      var emailInput = element(by.id('emailInput'));
      await emailInput.sendKeys('sam');
  
      var passwordInput = element(by.id('passwordInput'));
      await passwordInput.sendKeys('sam');
  
      var confirmButton = element(by.id('confirm'));
      await confirmButton.click();
  
      await browser.wait(async function() {
        return await browser.executeScript('return localStorage.getItem("token") != null;');
      }, 5000, 'отсутствует');
  
      var token = await browser.executeScript('return localStorage.getItem("token");');
      expect(token).toBeTruthy();
    });
});