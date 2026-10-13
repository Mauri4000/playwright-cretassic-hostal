import { Browser, BrowserContext, Page, chromium, LaunchOptions } from 'playwright';
import { Config } from '../utils/Config';
import { Logger } from '../utils/Logger';

/**
 * BrowserManager — Singleton pattern.
 * Guarantees a single Browser instance is shared across the entire test run.
 * Tests obtain pages via BrowserManager.getInstance().newPage().
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private readonly logger = new Logger('BrowserManager');

  private constructor() {}

  /** Return (or create) the single BrowserManager instance */
  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  /** Launch the browser if not already running */
  async launch(): Promise<void> {
    if (this.browser) return;

    const options: LaunchOptions = {
      headless: Config.headless,
      slowMo:   Config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    this.logger.info(`Launching Chromium (headless=${options.headless})`);
    this.browser  = await chromium.launch(options);
    this.context  = await this.browser.newContext({
      viewport:    { width: 1280, height: 800 },
      locale:      'es-BO',
      timezoneId:  'America/La_Paz',
    });
    this.logger.info('Browser launched');
  }

  /** Open a fresh page within the shared context */
  async newPage(): Promise<Page> {
    if (!this.context) {
      await this.launch();
    }
    return this.context!.newPage();
  }

  /** Close page without closing the shared context */
  async closePage(page: Page): Promise<void> {
    await page.close();
  }

  /** Tear down browser — call once at the end of the test suite */
  async teardown(): Promise<void> {
    this.logger.info('Tearing down browser');
    await this.context?.close();
    await this.browser?.close();
    this.browser  = null;
    this.context  = null;
  }

  get isLaunched(): boolean {
    return this.browser !== null;
  }
}
