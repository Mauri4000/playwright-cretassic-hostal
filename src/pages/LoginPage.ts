import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';

/**
 * LoginPage — extends BasePage (Inheritance).
 * Covers the admin login form at /admin/login.
 */
export class LoginPage extends BasePage {
  protected get path() { return '/admin/login'; }

  private get form()          { return this.page.locator('form'); }
  private get emailInput()    { return this.form.locator('input[type="email"]'); }
  private get passwordInput() { return this.form.locator('input[type="password"]'); }
  private get submitButton()  { return this.form.locator('button[type="submit"]'); }
  private get errorMessage()  { return this.form.locator('p.text-red-400'); }

  constructor(page: Page) {
    super(page, Config.adminUrl);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.emailInput);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in as ${email}`);
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.submitButton.click();
  }

  async loginWithDefaults(): Promise<void> {
    await this.login(Config.testEmail, Config.testPassword);
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async isLoginFormVisible(): Promise<boolean> {
    return this.emailInput.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage, 5_000);
    return (await this.errorMessage.textContent()) ?? '';
  }

  async waitForRedirectAway(): Promise<void> {
    await this.page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15_000 });
  }
}
