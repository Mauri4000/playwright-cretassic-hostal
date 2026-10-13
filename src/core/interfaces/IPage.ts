import { Page } from 'playwright';

/**
 * IPage — contract every Page Object must satisfy.
 * Enforces navigate() and waitForReady() on all page classes.
 */
export interface IPage {
  /** Navigate to this page's URL */
  navigate(): Promise<void>;

  /** Wait until the page is fully interactive */
  waitForReady(): Promise<void>;

  /** The underlying Playwright Page instance */
  readonly page: Page;
}
