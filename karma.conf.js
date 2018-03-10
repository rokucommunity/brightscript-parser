module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', "karma-typescript"],
    files: [
      'src/**/*.ts'
    ],
    exclude: [
    ],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript']
    },
    reporters: ['progress', 'karma-typescript'],
    karmaTypescriptConfig: {
      bundlerOptions: {
        sourceMap: true
      },
      coverageOptions: {
        instrumentation: true
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  })
}
