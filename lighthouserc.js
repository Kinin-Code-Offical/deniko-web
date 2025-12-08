module.exports = {
  ci: {
    collect: {
      // Server is started manually in CI workflow to ensure readiness
      url: ["http://127.0.0.1:3000/tr", "http://127.0.0.1:3000/en"],
      numberOfRuns: 3,
      settings: {
        chromeFlags:
          "--no-sandbox --disable-gpu --disable-dev-shm-usage --ignore-certificate-errors",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
  },
};
