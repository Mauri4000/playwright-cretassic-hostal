import { Page } from 'playwright';
import { BasePage } from '../core/BasePage';
import { Config } from '../utils/Config';

export class VitrinaPage extends BasePage {
  protected get path() { return '/admin/vitrina'; }

  private get addBtn()        { return this.page.locator('[data-testid="btn-add-product"]'); }
  private get addModal()      { return this.page.locator('[data-testid="modal-add-product"]'); }
  private get nameInput()     { return this.page.locator('[data-testid="input-product-name"]'); }
  private get priceInput()    { return this.page.locator('[data-testid="input-product-price"]'); }
  private get submitBtn()     { return this.page.locator('[data-testid="btn-submit-product"]'); }

  constructor(page: Page) { super(page, Config.adminUrl); }

  async waitForReady(): Promise<void> {
    await this.waitForVisible(this.addBtn, 15_000);
  }

  async isPageVisible(): Promise<boolean> { return this.addBtn.isVisible(); }
  async isAddButtonVisible(): Promise<boolean> { return this.addBtn.isVisible(); }

  async clickAddProduct(): Promise<void> { await this.addBtn.click(); }

  async isAddModalOpen(): Promise<boolean> {
    await this.waitForVisible(this.addModal, 5_000);
    return this.addModal.isVisible();
  }

  async fillProductName(name: string): Promise<void> {
    await this.fillField(this.nameInput, name);
  }

  async fillProductPrice(price: number): Promise<void> {
    await this.fillField(this.priceInput, String(price));
  }

  async submitForm(): Promise<void> {
    await this.submitBtn.click();
    await this.page.waitForTimeout(2_000);
  }

  async isAddModalClosed(): Promise<boolean> {
    await this.page.waitForTimeout(500);
    return !(await this.addModal.isVisible().catch(() => false));
  }

  async productExists(name: string): Promise<boolean> {
    try {
      await this.page.locator('p.text-xs.font-semibold', { hasText: name })
        .first().waitFor({ state: 'visible', timeout: 8_000 });
      return true;
    } catch { return false; }
  }

  async deleteProduct(name: string): Promise<void> {
    // Find the card by product name text (inside p.text-xs.font-semibold)
    // then click the first button in the card (trash icon, absolute top-2 left-2)
    const card = this.page.locator('div.bg-white.rounded-2xl', { hasText: name }).first();
    await card.waitFor({ state: 'visible', timeout: 8_000 });
    const trashBtn = card.locator('button').first();
    await trashBtn.click();
    // Confirm with "Sí, eliminar" in the confirmation modal
    const confirmBtn = this.page.getByText('Sí, eliminar');
    await confirmBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await confirmBtn.click();
    await this.page.waitForTimeout(1_500);
  }
}
