import { Given, When, Then } from '@cucumber/cucumber';
import { WorldContext } from '../../src/core/WorldContext';
import { TransactionsPage } from '../../src/pages/TransactionsPage';
import assert from 'assert';

Given('I navigate to the transactions page', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  await page.navigate();
});

Then('the transactions page should be visible', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  assert.ok(await page.isPageVisible(), 'Transactions page not visible');
});

Then('the add transaction button should be visible', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  assert.ok(await page.isAddButtonVisible(), 'Add transaction button not visible');
});

When('I click add transaction', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  await page.clickAdd();
});

Then('the transaction modal should open', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  assert.ok(await page.isModalOpen(), 'Transaction modal did not open');
});

When('I fill transaction amount {int}', async function (this: WorldContext, amount: number) {
  const page = new TransactionsPage(this.page);
  await page.fillAmount(amount);
});

When('I fill transaction description {string}', async function (this: WorldContext, description: string) {
  const page = new TransactionsPage(this.page);
  await page.fillDescription(description);
});

When('I select category {string}', async function (this: WorldContext, category: string) {
  const page = new TransactionsPage(this.page);
  await page.selectCategory(category);
});

When('I click save transaction', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  await page.clickSave();
});

Then('the transaction modal should close', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  assert.ok(await page.isModalClosed(), 'Transaction modal is still open');
});

Then('I should see a transaction with amount {string}', async function (this: WorldContext, amount: string) {
  const page = new TransactionsPage(this.page);
  await this.page.waitForTimeout(1_000);
  assert.ok(await page.transactionExists(amount), `Transaction Bs. ${amount} not found in list`);
});

When('I click next month on transactions', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  await page.clickNextMonth();
});

When('I click prev month on transactions', async function (this: WorldContext) {
  const page = new TransactionsPage(this.page);
  await page.clickPrevMonth();
});

When('I delete test transaction {string}', async function (this: WorldContext, description: string) {
  const page = new TransactionsPage(this.page);
  await page.deleteTestTransaction(description);
});

Then('I should not see a transaction description {string}', async function (this: WorldContext, description: string) {
  const page = new TransactionsPage(this.page);
  // Switch to Caja Mayor to check the table
  const cajaMayorTab = this.page.getByRole('button', { name: /Caja Mayor/i });
  if (await cajaMayorTab.isVisible().catch(() => false)) {
    await cajaMayorTab.click();
    await this.page.waitForTimeout(500);
  }
  const row = this.page.locator('tbody tr', { hasText: description }).first();
  const visible = await row.isVisible().catch(() => false);
  assert.ok(!visible, `Transaction with description "${description}" still visible after delete`);
});
