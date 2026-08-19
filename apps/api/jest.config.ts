import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!@xennic/)'],
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.spec.ts', '!**/*.module.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/../test/setup-env.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Map @xennic/database to its TS sources so Jest doesn't try to parse
    // the built ESM in packages/database/dist (which uses `export *`).
    '^@xennic/database$': '<rootDir>/../../../packages/database/src/index.ts',
    '^@xennic/database/(.*)$': '<rootDir>/../../../packages/database/src/$1',
  },
};

export default config;
