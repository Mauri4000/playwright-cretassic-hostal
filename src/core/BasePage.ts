import { Page, Locator } from 'playwright';
import { IPage } from './interfaces/IPage';
import { Logger } from '../utils/Logger';

/**
 * BasePage — Abstract base class (Inheritance pattern).
 * All Page Objects extend this class so common functionality
 * (logging, waiting, taking screenshots) is inherited automatically.
 */
export abstract class BasePage implements IPage {
  protected readonly logger: Logger;

  constructor(public readonly page: Page, protected readonly baseUrl: string) {
    this.logger = new Logger(this.constructor.name);
  }

  /** Subclasses define their own URL path */
  protected abstract get path(): string;

  /** Navigate to this page */
  async navigate(): Promise<void> {
    const url = `${this.baseUrl}${this.path}`;
    this.logger.info(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  /** Subclasses define their ready condition */
  abstract waitForReady(): Promise<void>;

  // ─── Shared helpers (inherited by all pages) ──────────────────────────────

  protected async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  protected async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    this.logger.info(`Taking screenshot: ${name}`);
    return this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
