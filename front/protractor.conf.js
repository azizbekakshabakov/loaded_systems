exports.config = {
    directConnect: true,
    baseUrl: 'http://localhost:4200/',
    specs: ['./tests/*.js'],
    framework: 'jasmine',
    // useAllAngular2AppRoots: true,
    // capabilities: {
    //     browserName: 'firefox',
    //     'moz:firefoxOptions': {
    //       binary: 'firefox' // Optional: Specify the path to Firefox binary
    //     }
    //   }

    // capabilities: {
    //     browserName: 'chrome',
    //     chromeOptions: {
    //       args: ['--headless', '--disable-gpu']
    //     }
    //   },
    
    capabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
            args: ['--headless']
        }
    },
    
      jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
      },
    //   onPrepare: function() {
    //     browser.waitForAngularEnabled(false);
    //   }
};