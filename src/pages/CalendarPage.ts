import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';
import { DateUtils } from '../utils/DateUtils';

/**
 * CalendarPage — extends BasePage (Inheritance).
 * Admin calendar view where reservations are created/managed.
 */
export class CalendarPage extends BasePage {
  protected get path() { return '/admin/calendar'; }

  // ─── Locators ─────────────────────────────────────────────────────────────
  private get calendarGrid()      { return this.page.locator('[data-testid="calendar-grid"]'); }
  private get todayButton()       { return this.page.getByRole('button', { name: /hoy|today/i }); }
  private get prevMonthButton()   { return this.page.locator('[data-testid="btn-prev-month"]'); }
  private get nextMonthButton()   { return this.page.locator('[data-testid="btn-next-month"]'); }

  constructor(page: Page) {
    super(page, Config.adminUrl);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.calendarGrid);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goToToday(): Promise<void> {
    await this.todayButton.click();
    await this.waitForReady();
  }

  async navigateToMonth(isoDate: string): Promise<void> {
    // Navigate until the displayed month/year matches isoDate
    const targetMonth = DateUtils.monthName(isoDate);
    const targetYear  = isoDate.split('-')[0];
    const maxClicks   = 24;

    for (let i = 0; i < maxClicks; i++) {
      const heading = await this.page.locator('[data-testid="month-label"]').textContent() ?? '';
      if (heading.includes(targetMonth) && heading.includes(targetYear)) break;
      // Determine direction
      const currentYear  = Number(heading.match(/\d{4}/)?.[0] ?? 0);
      const currentMonth = heading;
      const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const targetIdx  = months.indexOf(targetMonth);
      const currentIdx = months.findIndex(m => heading.includes(m));
      const goNext = currentYear < Number(targetYear) || (currentYear === Number(targetYear) && currentIdx < targetIdx);
      if (goNext) await this.nextMonthButton.click();
      else        await this.prevMonthButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  // ─── Room cell interactions ───────────────────────────────────────────────

  async getRoomCell(roomId: string, day: number): Promise<import('playwright').Locator> {
    return this.page.locator(`[data-room="${roomId}"][data-day="${day}"], [data-testid="cell-${roomId}-${day}"]`);
  }

  async isRoomOccupied(roomId: string, day: number): Promise<boolean> {
    const cell = await this.getRoomCell(roomId, day);
    const classes = await cell.getAttribute('class') ?? '';
    return classes.includes('ocupado') || classes.includes('reserva');
  }

  async clickRoomCell(roomId: string, day: number): Promise<void> {
    const cell = await this.getRoomCell(roomId, day);
    await cell.click();
  }

  // ─── Urgencia alert ───────────────────────────────────────────────────────

  async hasUrgenciaAlert(): Promise<boolean> {
    return this.page.locator('[data-testid="urgencia-alert"], .urgencia-banner').isVisible();
  }

  async dismissUrgencia(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /habilitar|marcar/i });
    await btn.click();
  }
}
