import { After, Before, ITestCaseHookParameter, Status, setDefaultTimeout } from '@cucumber/cucumber';
import path from 'path';
import fs from 'fs';
import { CustomWorld } from './world';

setDefaultTimeout(30000);

Before(async function (this: CustomWorld) {
  await this.initBrowser();
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshotsDir = path.resolve(__dirname, '../artifacts/screenshots');
    fs.mkdirSync(screenshotsDir, { recursive: true });
    const fileName = `${scenario.pickle.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`;
    await this.page.screenshot({ path: path.join(screenshotsDir, fileName), fullPage: true });
  }

  await this.closeBrowser();
});
