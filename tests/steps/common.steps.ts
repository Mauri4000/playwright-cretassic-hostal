import { Given, Then, When } from '@cucumber/cucumber';
import { WorldContext } from '../../src/core/WorldContext';
import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { CalendarPage } from '../../src/pages/CalendarPage';
import { PublicRoomsPage } from '../../src/pages/PublicRoomsPage';
import { Config } from '../../src/utils/Config';
import assert from 'assert';

// ─── Login / Auth ─────────────────────────────────────────────────────────────

Given('I am on the admin login page', async function (this: WorldContext) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

Given('I am logged in as admin', async function (this: WorldContext) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
  await loginPage.loginWithDefaults();
  await loginPage.waitForRedirectAway();
});

When('I enter valid admin credentials', async function (this: WorldContext) {
  const loginPage = new LoginPage(this.page);
  await loginPage.loginWithDefaults();
});

When('I enter email {string} and password {string}', async function (
  this: WorldContext, email: string, password: string
) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(email, password);
});

Then('I should be redirected to the dashboard', async function (this: WorldContext) {
  const dashboard = new DashboardPage(this.page);
  await dashboard.waitForReady();
  const url = await dashboard.getCurrentUrl();
  assert.ok(url.includes('/admin'), `Expected /admin URL, got ${url}`);
});

Then('the dashboard should display hotel stats', async function (this: WorldContext) {
  const dashboard = new DashboardPage(this.page);
  const count = await dashboard.getStatCardCount();
  assert.ok(count > 0, 'No stat cards found on dashboard');
});

Then('I should see an error message', async function (this: WorldContext) {
  const loginPage = new LoginPage(this.page);
  const msg = await loginPage.getErrorMessage();
  assert.ok(msg.length > 0, 'Expected an error message but found none');
});

Then('I should remain on the login page', async function (this: WorldContext) {
  const url = await this.page.url();
  assert.ok(url.includes('/login'), `Expected to stay on /login, got ${url}`);
});

// ─── Navigation ───────────────────────────────────────────────────────────────

When('I navigate to the calendar page', async function (this: WorldContext) {
  const calendarPage = new CalendarPage(this.page);
  await calendarPage.navigate();
});

// ─── Public site ──────────────────────────────────────────────────────────────

Given('I am on the public rooms page', async function (this: WorldContext) {
  const roomsPage = new PublicRoomsPage(this.page);
  await roomsPage.navigate();
});

Then('I should see room cards displayed', async function (this: WorldContext) {
  const roomsPage = new PublicRoomsPage(this.page);
  const count = await roomsPage.getRoomCount();
  assert.ok(count > 0, `Expected room cards, found ${count}`);
});

Then('the page title should contain {string}', async function (this: WorldContext, text: string) {
  const roomsPage = new PublicRoomsPage(this.page);
  const title = await roomsPage.getTitle();
  assert.ok(title.includes(text), `Title "${title}" does not include "${text}"`);
});

Then('I should see at least one room card', async function (this: WorldContext) {
  const roomsPage = new PublicRoomsPage(this.page);
  const count = await roomsPage.getRoomCount();
  assert.ok(count >= 1, `Expected at least 1 room card, got ${count}`);
});
