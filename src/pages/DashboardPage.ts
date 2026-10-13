import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';

/**
 * DashboardPage — extends BasePage (Inheritance).
 * Admin dashboard overview.
 */
export class DashboardPage extends BasePage {
  protected get path() { return '/admin'; }

  private get statsCards()    { return this.page.locator('[data-testid^="stat-card-"]'); }
  private get reservasCount() { return this.page.locator('[data-testid="reservas-count"]'); }

  constructor(page: Page) {
    super(page, Config.adminUrl);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.statsCards.first(), 15_000);
  }

  async getStatCardCount(): Promise<number> {
    return this.statsCards.count();
  }

  async getReservasText(): Promise<string> {
    return (await this.reservasCount.textContent()) ?? '';
  }

  async isFullyLoaded(): Promise<boolean> {
    const loadingSpinners = this.page.locator('.loading, [data-testid="loading"]');
    return (await loadingSpinners.count()) === 0;
  }
}
