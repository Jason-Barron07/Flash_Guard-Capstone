module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['tests/ui/hooks/**/*.ts', 'tests/ui/step-definitions/**/*.ts'],
    paths: ['tests/ui/features/**/*.feature'],
    format: [
      'progress',
      'summary',
      'json:tests/ui/artifacts/cucumber/cucumber-report.json',
      'html:tests/ui/artifacts/cucumber/cucumber-report.html',
    ],
    retry: 0,
  },
};
