import { Given, When, Then } from '@cucumber/cucumber';
import { WorldContext } from '../../src/core/WorldContext';
import { VitrinaPage } from '../../src/pages/VitrinaPage';
import assert from 'assert';

Given('I navigate to the vitrina page', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  await page.navigate();
});

Then('the vitrina page should be visible', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  assert.ok(await page.isPageVisible(), 'Vitrina page not visible');
});

Then('the add product button should be visible', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  assert.ok(await page.isAddButtonVisible(), 'Add product button not visible');
});

When('I click add product', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  // Cleanup: if test product exists from a previous failed run, delete it first
  if (await page.productExists('TEST E2E PRODUCTO')) {
    await page.deleteProduct('TEST E2E PRODUCTO');
  }
  await page.clickAddProduct();
});

Then('the add product modal should open', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  assert.ok(await page.isAddModalOpen(), 'Add product modal did not open');
});

When('I fill product name {string}', async function (this: WorldContext, name: string) {
  const page = new VitrinaPage(this.page);
  await page.fillProductName(name);
});

When('I fill product price {float}', async function (this: WorldContext, price: number) {
  const page = new VitrinaPage(this.page);
  await page.fillProductPrice(price);
});

When('I submit the product form', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  await page.submitForm();
});

Then('the add product modal should close', async function (this: WorldContext) {
  const page = new VitrinaPage(this.page);
  assert.ok(await page.isAddModalClosed(), 'Add product modal is still open');
});

Then('I should see a product named {string}', async function (this: WorldContext, name: string) {
  const page = new VitrinaPage(this.page);
  await this.page.waitForTimeout(1_000);
  assert.ok(await page.productExists(name), `Product "${name}" not found in vitrina`);
});

When('I delete the product named {string}', async function (this: WorldContext, name: string) {
  const page = new VitrinaPage(this.page);
  await page.deleteProduct(name);
});

Then('I should not see a product named {string}', async function (this: WorldContext, name: string) {
  const page = new VitrinaPage(this.page);
  assert.ok(!(await page.productExists(name)), `Product "${name}" is still visible after deletion`);
});
