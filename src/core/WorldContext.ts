import { World, IWorldOptions } from '@cucumber/cucumber';
import { Page } from 'playwright';
import { BrowserManager } from './BrowserManager';

/**
 * WorldContext — Cucumber World class.
 * Injected into every step definition; carries the shared Page reference
 * and any state that needs to live for the duration of a scenario.
 */
export class WorldContext extends World {
  page!: Page;
  lastError?: Error;
  scenarioName: string = '';

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initPage(): Promise<void> {
    this.page = await BrowserManager.getInstance().newPage();
  }

  async closePage(): Promise<void> {
    await BrowserManager.getInstance().closePage(this.page);
  }
}
