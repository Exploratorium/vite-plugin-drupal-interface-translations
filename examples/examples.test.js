import { exec } from 'node:child_process';
import { readFile, rm, stat } from 'node:fs/promises';

import { beforeAll, beforeEach, describe, expect, test } from '@jest/globals';

describe('examples', () => {
  beforeAll(async () => {
    await new Promise((resolve, reject) => {
      exec(`npm run build`, (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });

    {
      const promises = [];
      for (const group of ['react', 'vanilla']) {
        const nodeModules = `examples/${group}/node_modules`;
        promises.push(
          stat(nodeModules)
            .then(() => rm(nodeModules, { recursive: true }))
            .catch((reason) => {
              if (reason.code !== 'ENOENT') {
                throw reason;
              }
            }),
        );

        const packageLock = `examples/${group}/package-lock.json`;
        promises.push(
          stat(packageLock)
            .then(() => rm(packageLock, { recursive: true }))
            .catch((reason) => {
              if (reason.code !== 'ENOENT') {
                throw reason;
              }
            }),
        );
      }
      await Promise.all(promises);
    }
  });

  ['react', 'vanilla'].forEach((group) => {
    describe(group, () => {
      beforeEach(async () => {
        const promises = [];
        for (const group of ['react', 'vanilla']) {
          promises.push(
            new Promise((resolve, reject) => {
              exec(`cd examples/${group} && npm install`, (error) => {
                if (error) {
                  reject(error);
                }
                resolve();
              });
            }),
          );
        }
        await Promise.all(promises);
      }, 10_000);

      test(`can build the example`, async () => {
        await new Promise((resolve, reject) => {
          exec(`cd examples/${group} && npm run build`, (error) => {
            if (error) {
              reject(error);
            }
            resolve();
          });
        });

        const potFilePath = `examples/${group}/translations/${group}.pot`;
        const content = await readFile(potFilePath, 'utf8');
        expect(content).toMatch(/\nmsgid "Vite logo"\n/);
      });
    });
  });
});
