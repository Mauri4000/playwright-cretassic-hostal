import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';

export class TransactionsPage extends BasePage {
  protected get path() { return '/admin/transactions'; }

  private get addBtn()          { return this.page.locator('[data-testid="btn-add-transaction"]'); }
  private get modal()           { return this.page.locator('[data-testid="transaction-modal"]'); }
  private get amountInput()     { return this.page.locator('[data-testid="input-amount"]'); }
  private get descriptionInput(){ return this.page.locator('[data-testid="input-description"]'); }
  private get saveBtn()         { return this.page.locator('[data-testid="btn-save-transaction"]'); }
  private get prevMonthBtn()    { return this.page.locator('[data-testid="btn-prev-month"]'); }
  private get nextMonthBtn()    { return this.page.locator('[data-testid="btn-next-month"]'); }

  constructor(page: Page) { super(page, Config.adminUrl); }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.addBtn, 15_000);
  }

  async isPageVisible(): Promise<boolean> { return this.addBtn.isVisible(); }
  async isAddButtonVisible(): Promise<boolean> { return this.addBtn.isVisible(); }

  async clickAdd(): Promise<void> { await this.addBtn.click(); }

  async isModalOpen(): Promise<boolean> {
    await this.waitForVisible(this.modal, 5_000);
    return this.modal.isVisible();
  }

  async fillAmount(amount: number): Promise<void> {
    await this.waitForVisible(this.amountInput);
    await this.fillField(this.amountInput, String(amount));
  }

  async fillDescription(description: string): Promise<void> {
    await this.waitForVisible(this.descriptionInput);
    await this.fillField(this.descriptionInput, description);
  }

  async deleteTestTransaction(description: string): Promise<void> {
    // Ensure the transaction table is visible (switch to Caja Mayor if needed)
    const cajaMayorTab = this.page.getByRole('button', { name: /Caja Mayor/i });
    if (await cajaMayorTab.isVisible().catch(() => false)) {
      await cajaMayorTab.click();
      await this.page.waitForTimeout(500);
    }
    // Find the row by description text and click its trash icon (title="Eliminar")
    const row = this.page.locator('tbody tr', { hasText: description }).first();
    await row.waitFor({ state: 'visible', timeout: 8_000 });
    const trashBtn = row.locator('button[title="Eliminar"]');
    await trashBtn.click();
    // Confirm dialog appears — click the confirm delete button
    const confirmBtn = this.page.locator('[data-testid="btn-confirm-delete"]');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await confirmBtn.click();
    await this.page.waitForTimeout(1_500);
  }

  async selectCategory(category: string): Promise<void> {
    // Use data-testid="section-category" to unambiguously find the category CustomSelect
    const section = this.page.locator('[data-testid="section-category"]');
    await section.waitFor({ state: 'visible', timeout: 5_000 });
    const trigger = section.locator('button[type="button"]').first();
    await trigger.waitFor({ state: 'visible', timeout: 5_000 });
    await trigger.click();
    await this.page.waitForTimeout(400);
    // Click the option inside the dropdown (hasText does reliable substring match)
    const option = section.locator('button', { hasText: category }).first();
    await option.waitFor({ state: 'visible', timeout: 5_000 });
    await option.click();
    await this.page.waitForTimeout(200);
  }

  async clickSave(): Promise<void> {
    await this.saveBtn.click();
    await this.page.waitForTimeout(2_000);
  }

  async isModalClosed(): Promise<boolean> {
    await this.page.waitForTimeout(500);
    return !(await this.modal.isVisible().catch(() => false));
  }

  async transactionExists(amount: string): Promise<boolean> {
    // fmt() formats 50 → "50,00" (comma as decimal separator)
    const formatted = parseFloat(amount).toFixed(2).replace('.', ',');
    const text = `Bs. ${formatted}`;
    // Wait for the page to load
    await this.waitForVisible(this.addBtn, 10_000);
    // Admin lands on "all" resumen tab — transaction table is hidden there.
    // Switch to "Caja Mayor" tab to make the table visible.
    const cajaMayorTab = this.page.getByRole('button', { name: /Caja Mayor/i });
    if (await cajaMayorTab.isVisible().catch(() => false)) {
      await cajaMayorTab.click();
      await this.page.waitForTimeout(500);
    }
    const locator = this.page.getByText(text).first();
    try {
      await locator.waitFor({ state: 'visible', timeout: 8_000 });
      return true;
    } catch { return false; }
  }

  async clickNextMonth(): Promise<void> {
    await this.nextMonthBtn.click();
    await this.page.waitForTimeout(500);
  }

  async clickPrevMonth(): Promise<void> {
    await this.prevMonthBtn.click();
    await this.page.waitForTimeout(500);
  }
}
