import { Given, When, Then } from '@cucumber/cucumber';
import { WorldContext } from '../../src/core/WorldContext';
import { CalendarPage } from '../../src/pages/CalendarPage';
import assert from 'assert';

// ─── Helper: click a calendar cell's inner button ─────────────────────────────
// Problem: CalendarPage renders a `<div class="fixed inset-0 z-40">` backdrop whenever
// a CardMenu or QuickMenu is open. `cell.click()` fires at screen coordinates → browser
// routes the event to the topmost element at those coords → the z-40 backdrop intercepts
// it instead of the cell. `force: true` doesn't help (same coordinate routing).
//
// Solution: use `page.evaluate` to dispatch a proper MouseEvent directly on the button
// element inside the cell. This bypasses hit-testing entirely. We pass real clientX/Y so
// that the QuickMenu / CardMenu position calculation (which uses e.clientX, e.clientY)
// produces a visible, on-screen menu.
async function clickCellButton(page: WorldContext['page'], room: string, day: number) {
  const cell = page.locator(`[data-testid="cell-${room}-${day}"]`);
  await cell.waitFor({ state: 'visible', timeout: 10_000 });
  // Get the element's bounding rect so we can pass realistic clientX/Y
  const box = await cell.boundingBox();
  const cx = box ? Math.round(box.x + box.width / 2) : 400;
  const cy = box ? Math.round(box.y + box.height / 2) : 300;
  // Dispatch directly to the first button inside the cell (reservation block or "+" button)
  await page.evaluate(
    ({ testid, clientX, clientY }: { testid: string; clientX: number; clientY: number }) => {
      const cell = document.querySelector(`[data-testid="${testid}"]`);
      const btn = cell?.querySelector('button') as HTMLButtonElement | null;
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX, clientY }));
    },
    { testid: `cell-${room}-${day}`, clientX: cx, clientY: cy }
  );
  await page.waitForTimeout(500);
}

// ─── Navigation ───────────────────────────────────────────────────────────────

Given('I navigate to May 2026 on the calendar', async function (this: WorldContext) {
  const cal = new CalendarPage(this.page);
  await cal.navigate();
  await cal.navigateToMonth('2026-05');

  // Cleanup: if A1-15 has a leftover test reservation, delete it
  const cell = this.page.locator('[data-testid="cell-A1-15"]');
  if (await cell.isVisible().catch(() => false)) {
    const status = await cell.getAttribute('data-status').catch(() => '');
    if (status && status !== 'empty') {
      await clickCellButton(this.page, 'A1', 15);
      const editBtn = this.page.locator('button', { hasText: 'Editar' }).first();
      if (await editBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await editBtn.click();
        await this.page.waitForTimeout(500);
        const delBtn = this.page.getByRole('button', { name: /^Eliminar$/ });
        if (await delBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await delBtn.click();
          await this.page.waitForTimeout(2_000);
        } else {
          const cancelBtn = this.page.locator('[data-testid="btn-cancel-reservation"]');
          if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click();
        }
      } else {
        // Close any open overlay by clicking its backdrop
        await this.page.mouse.click(10, 10);
        await this.page.waitForTimeout(300);
      }
    }
  }
});

Then('the calendar should show {string}', async function (this: WorldContext, text: string) {
  const heading = await this.page.locator('[data-testid="month-label"]').textContent() ?? '';
  assert.ok(heading.includes(text), `Month label "${heading}" does not include "${text}"`);
});

// ─── Cell interaction ─────────────────────────────────────────────────────────

When('I click on room {string} day {int}', async function (this: WorldContext, room: string, day: number) {
  // Empty cell → clickCellButton → QuickMenu → click "📅 Reserva" → form opens
  await clickCellButton(this.page, room, day);
  const reservaBtn = this.page.getByRole('button', { name: /Reserva$/ }).first();
  await reservaBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await reservaBtn.click();
  await this.page.waitForTimeout(300);
});

When('I click on the reservation block in room {string} day {int}', async function (this: WorldContext, room: string, day: number) {
  // Occupied cell → clickCellButton → CardMenu → click "✏️ Editar" → form opens
  await clickCellButton(this.page, room, day);
  const editBtn = this.page.locator('button', { hasText: 'Editar' }).first();
  await editBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await editBtn.click();
  await this.page.waitForTimeout(300);
});

When('I right-click on the reservation block in room {string} day {int}', async function (this: WorldContext, room: string, day: number) {
  // Occupied (status=ocupado) cell → clickCellButton → CardMenu → click "⬆ Check out"
  await clickCellButton(this.page, room, day);
  const checkoutBtn = this.page.getByRole('button', { name: /Check out/ });
  await checkoutBtn.waitFor({ state: 'visible', timeout: 8_000 });
  await checkoutBtn.click();
  await this.page.waitForTimeout(500);
});

// ─── Direct check-in (creates reservation as 'ocupado') ────────────────────────

Given('there is a checked-in guest in room {string} day {int}', async function (this: WorldContext, room: string, day: number) {
  const cell = this.page.locator(`[data-testid="cell-${room}-${day}"]`);
  await cell.waitFor({ state: 'visible', timeout: 10_000 });

  // If already occupied, nothing to do
  const status = await cell.getAttribute('data-status').catch(() => 'empty') ?? 'empty';
  if (status === 'ocupado') return;

  // Click the cell to open QuickMenu (cell is empty)
  await clickCellButton(this.page, room, day);

  // Two "Check-in directo" buttons may exist in the DOM (desktop + mobile QuickMenus).
  // Use .first() to avoid strict mode violation.
  const directBtn = this.page.getByRole('button', { name: /Check-in directo/ }).first();
  await directBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await directBtn.click();
  await this.page.waitForTimeout(400);

  // Fill the Check-in directo form
  const nameInput = this.page.locator('[data-testid="input-guest-name"]').first();
  await nameInput.waitFor({ state: 'visible', timeout: 5_000 });
  await nameInput.fill('Test E2E Checkout');

  const priceInput = this.page.locator('[data-testid="input-price-per-night"]');
  await priceInput.waitFor({ state: 'visible', timeout: 5_000 });
  await priceInput.fill('200');

  const saveBtn = this.page.locator('[data-testid="btn-save-reservation"]');
  await saveBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await saveBtn.click();

  // Poll until data-status becomes 'ocupado'
  await this.page.waitForTimeout(1_000);
  for (let i = 0; i < 10; i++) {
    const s = await cell.getAttribute('data-status').catch(() => '') ?? '';
    if (s === 'ocupado') break;
    await this.page.waitForTimeout(500);
  }
  const finalStatus = await cell.getAttribute('data-status').catch(() => 'unknown');
  if (finalStatus !== 'ocupado') {
    throw new Error(
      `Background: failed to create ocupado reservation in ${room}-${day}. ` +
      `data-status after save = "${finalStatus}"`
    );
  }
});

// ─── Reservation modal ────────────────────────────────────────────────────────

Then('the reservation modal should open', async function (this: WorldContext) {
  const modal = this.page.locator('[data-testid="reservation-modal"]');
  await modal.waitFor({ state: 'visible', timeout: 8_000 });
  assert.ok(await modal.isVisible(), 'Reservation modal did not open');
});

Then('the reservation modal should close', async function (this: WorldContext) {
  const modal = this.page.locator('[data-testid="reservation-modal"]');
  await modal.waitFor({ state: 'hidden', timeout: 8_000 });
});

When('I fill guest name {string}', async function (this: WorldContext, name: string) {
  const input = this.page.locator('[data-testid="input-guest-name"]').first();
  await input.clear();
  await input.fill(name);
});

When('I fill num nights {int}', async function (this: WorldContext, nights: number) {
  const input = this.page.locator('[data-testid="input-num-nights"]');
  await input.clear();
  await input.fill(String(nights));
});

When('I fill price per night {int}', async function (this: WorldContext, price: number) {
  const input = this.page.locator('[data-testid="input-price-per-night"]');
  await input.clear();
  await input.fill(String(price));
});

When('I click save reservation', async function (this: WorldContext) {
  const saveBtn = this.page.locator('[data-testid="btn-save-reservation"]');
  await saveBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await saveBtn.click();
  await this.page.waitForTimeout(2_000);
});

When('I click delete reservation', async function (this: WorldContext) {
  const deleteBtn = this.page.getByRole('button', { name: /^Eliminar$/ });
  await deleteBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await deleteBtn.click();
  await this.page.waitForTimeout(2_000);
});

Then('the guest name field should contain {string}', async function (this: WorldContext, text: string) {
  const input = this.page.locator('[data-testid="input-guest-name"]').first();
  const value = await input.inputValue();
  assert.ok(value.includes(text), `Guest name "${value}" does not include "${text}"`);
});

Then('room {string} day {int} should show a reservation block', async function (this: WorldContext, room: string, day: number) {
  const cell = this.page.locator(`[data-testid="cell-${room}-${day}"]`);
  let status = 'empty';
  for (let i = 0; i < 16; i++) {
    status = await cell.getAttribute('data-status').catch(() => 'empty') ?? 'empty';
    if (status !== 'empty') break;
    await this.page.waitForTimeout(500);
  }
  assert.ok(status !== 'empty', `Cell ${room}-${day} data-status is still "empty" after saving`);
});

Then('room {string} day {int} should be empty', async function (this: WorldContext, room: string, day: number) {
  const cell = this.page.locator(`[data-testid="cell-${room}-${day}"]`);
  let status = 'unknown';
  for (let i = 0; i < 10; i++) {
    status = await cell.getAttribute('data-status').catch(() => 'unknown') ?? 'unknown';
    if (status === 'empty') break;
    await this.page.waitForTimeout(500);
  }
  assert.strictEqual(status, 'empty', `Cell ${room}-${day} data-status="${status}" (expected "empty")`);
});

// ─── Checkout modal ───────────────────────────────────────────────────────────

Then('the checkout modal should open', async function (this: WorldContext) {
  const modal = this.page.locator('[data-testid="checkout-modal"]');
  await modal.waitFor({ state: 'visible', timeout: 8_000 });
  assert.ok(await modal.isVisible(), 'Checkout modal did not open');
});

Then('the checkout modal should close', async function (this: WorldContext) {
  const modal = this.page.locator('[data-testid="checkout-modal"]');
  await modal.waitFor({ state: 'hidden', timeout: 8_000 });
});

Then('the checkout modal should show the guest name', async function (this: WorldContext) {
  const modal = this.page.locator('[data-testid="checkout-modal"]');
  const text = await modal.textContent() ?? '';
  assert.ok(text.length > 10, 'Checkout modal does not show guest info');
});

When('I set departure time {string}', async function (this: WorldContext, time: string) {
  const [hh, mm] = time.split(':');
  const inputs = this.page.locator('[data-testid="checkout-modal"] input[type="number"]');
  await inputs.nth(0).fill(hh);
  await inputs.nth(1).fill(mm);
});

Then('the departure time should show {string}', async function (this: WorldContext, time: string) {
  const [hh] = time.split(':');
  const inputs = this.page.locator('[data-testid="checkout-modal"] input[type="number"]');
  const val = await inputs.nth(0).inputValue();
  assert.ok(val === hh || val.includes(hh), `Departure hour "${val}" does not match "${hh}"`);
});

When('I clear departure time', async function (this: WorldContext) {
  const inputs = this.page.locator('[data-testid="checkout-modal"] input[type="number"]');
  await inputs.nth(0).fill('');
  await inputs.nth(1).fill('');
});

When('I click save checkout', async function (this: WorldContext) {
  const saveBtn = this.page.locator('[data-testid="btn-save-checkout"]');
  await saveBtn.waitFor({ state: 'visible', timeout: 5_000 });
  await saveBtn.click();
  await this.page.waitForTimeout(1_500);
});

// ─── Soft cleanup: delete a reservation only if it exists ─────────────────────
When('I try to delete any test reservation in room {string} day {int}', async function (this: WorldContext, room: string, day: number) {
  const cell = this.page.locator(`[data-testid="cell-${room}-${day}"]`);
  if (!(await cell.isVisible().catch(() => false))) return;
  const status = await cell.getAttribute('data-status').catch(() => '');
  if (!status || status === 'empty') return;

  // Click cell → CardMenu → Editar
  await clickCellButton(this.page, room, day);
  const editBtn = this.page.locator('button', { hasText: 'Editar' }).first();
  if (!(await editBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
    await this.page.mouse.click(10, 10);
    return;
  }
  await editBtn.click();
  await this.page.waitForTimeout(500);

  // Click Eliminar
  const delBtn = this.page.getByRole('button', { name: /^Eliminar$/ });
  if (!(await delBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
    const cancelBtn = this.page.locator('[data-testid="btn-cancel-reservation"]');
    if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click();
    return;
  }
  await delBtn.click();
  await this.page.waitForTimeout(2_000);
});
