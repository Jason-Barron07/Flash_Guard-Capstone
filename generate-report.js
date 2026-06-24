const path = require('path');
const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: path.resolve(__dirname, 'tests/ui/artifacts/cucumber'),
  reportPath: path.resolve(__dirname, 'tests/ui/artifacts/cucumber/html-report'),
  metadata: {
    browser: {
      name: 'chromium',
      version: 'latest',
    },
    device: 'Local test machine',
    platform: {
      name: process.platform,
      version: process.version,
    },
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'FlashGuard UI BDD' },
      { label: 'Execution Start Time', value: new Date().toISOString() },
    ],
  },
});
