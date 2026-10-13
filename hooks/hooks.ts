import {
  Before, After, BeforeAll, AfterAll,
  setWorldConstructor, setDefaultTimeout
} from '@cucumber/cucumber';
import { WorldContext } from '../src/core/WorldContext';
import { BrowserManager } from '../src/core/BrowserManager';
import { Logger } from '../src/utils/Logger';

const logger = new Logger('Hooks');

// ─── Register custom World ────────────────────────────────────────────────────
setWorldConstructor(WorldContext);

// ─── Default step timeout ─────────────────────────────────────────────────────
setDefaultTimeout(30_000);

// ─── Launch browser once for the entire test run ─────────────────────────────
BeforeAll(async function () {
  logger.info('Launching browser (BeforeAll)');
  await BrowserManager.getInstance().launch();
});

AfterAll(async function () {
  logger.info('Tearing down browser (AfterAll)');
  await BrowserManager.getInstance().teardown();
});

// ─── Per-scenario: open / close page ─────────────────────────────────────────
Before(async function (this: WorldContext, scenario) {
  this.scenarioName = scenario.pickle.name;
  logger.info(`▶  Starting: ${this.scenarioName}`);
  await this.initPage();
});

After(async function (this: WorldContext, scenario) {
  const status = scenario.result?.status;

  // On failure, attach a screenshot to the Allure report
  if (status === 'FAILED') {
    logger.warn(`✘  FAILED: ${this.scenarioName}`);
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    } catch {
      logger.error('Could not take failure screenshot');
    }
  } else {
    logger.info(`✔  ${status}: ${this.scenarioName}`);
  }

  // ─── Cleanup: delete test data created during scenario ──────────────────
  // Any rows inserted during the test should be tagged with notes='[e2e-test]'
  // so we can wipe them here without touching real data.
  //
  // Example (uncomment and import supabase if you add data-write steps):
  // const { createClient } = await import('@supabase/supabase-js');
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  // await supabase.from('reservations').delete().eq('notes', '[e2e-test]');

  await this.closePage();
});
