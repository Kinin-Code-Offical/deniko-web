module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm exec next start -H 127.0.0.1",
      startServerReadyTimeout: 60000,
      url: ["http://127.0.0.1:3000/tr", "http://127.0.0.1:3000/en"],
      numberOfRuns: 3,
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
