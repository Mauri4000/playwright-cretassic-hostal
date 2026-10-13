import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';

/**
 * PublicRoomsPage — extends BasePage (Inheritance).
 * Public-facing rooms listing on cretassichostal.com.
 */
export class PublicRoomsPage extends BasePage {
  protected get path() { return '/#rooms'; }

  private get roomCards()          { return this.page.locator('[data-testid^="room-card-"][data-testid$="-content"]'); }
  private get unavailableBanners() { return this.page.locator('.bg-red-500, [data-testid="unavailable-banner"]'); }
  private get bookNowButtons()     { return this.page.getByRole('link', { name: /book now|reservar/i }); }
  private get checkInInput()       { return this.page.locator('input[name="checkIn"], input[type="date"]').first(); }
  private get checkOutInput()      { return this.page.locator('input[name="checkOut"], input[type="date"]').nth(1); }

  constructor(page: Page) {
    super(page, Config.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.roomCards.first(), 15_000);
  }

  async setDates(checkIn: string, checkOut: string): Promise<void> {
    await this.fillField(this.checkInInput,  checkIn);
    await this.fillField(this.checkOutInput, checkOut);
    await this.checkOutInput.press('Tab');
    await this.page.waitForTimeout(2_000);
  }

  async getRoomCount(): Promise<number> {
    return this.roomCards.count();
  }

  async getUnavailableCount(): Promise<number> {
    return this.unavailableBanners.count();
  }

  async isRoomUnavailable(roomName: string): Promise<boolean> {
    const card = this.page.locator(`[data-room-name="${roomName}"], .room-card`).filter({ hasText: roomName });
    const banner = card.locator('.bg-red-500, [data-testid="unavailable-banner"]');
    return banner.isVisible();
  }

  async getAvailableBookNowCount(): Promise<number> {
    return this.bookNowButtons.count();
  }
}
