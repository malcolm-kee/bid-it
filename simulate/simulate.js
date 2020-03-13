/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const path = require('path');

function runWorker() {
  return new Promise(fulfill => {
    const childPs = spawn('node', [path.resolve(__dirname, 'worker.js')]);

    childPs.on('close', code => {
      fulfill(code);
    });
  });
}

const WORKER_COUNT = 100;

(function main() {
  const works = [];

  for (let index = 0; index < WORKER_COUNT; index++) {
    works.push(runWorker().catch(console.error));
  }

  return Promise.allSettled(works);
})();
