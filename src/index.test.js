import { exec } from 'node:child_process';
import { readFile, rm, stat } from 'node:fs/promises';

import drupalInterfaceTranslations from './index.js';

describe('drupalInterfaceTranslations', () => {
  test('has a name', () => {
    const instance = drupalInterfaceTranslations();
    expect(instance).toHaveProperty('name');
  });
});

describe('examples', () => {
  const testCanBuild = (group) => {
    test(`can build the "${group}" example`, async () => {
      await new Promise((resolve, reject) => {
        exec(
          `cd examples/${group} && npm install && npm run build`,
          (error) => {
            if (error) {
              reject(error);
            }
            resolve();
          },
        );
      });

      const potFilePath = `examples/${group}/translations/${group}.pot`;
      const content = await readFile(potFilePath, 'utf8');
      expect(content).toMatch(/\nmsgid "Vite logo"\n/);
    }, 10_000);
  };

  beforeAll(async () => {
    await new Promise((resolve, reject) => {
      exec(`npm install && npm run build`, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });

    for (const group in ['react', 'vanilla']) {
      const nodeModules = `examples/${group}/node_modules`;
      try {
        await stat(nodeModules);
        await rm(nodeModules, { recursive: true, force: true });
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      const packageLock = `examples/${group}/package-lock.json`;
      try {
        await stat(packageLock);
        await rm(packageLock);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  });

  ['react', 'vanilla'].forEach(testCanBuild);
});
