/** Runs a long task after the response is sent. Failures are logged; the task records its own status. */
export function runInBackground(label, task) {
  setImmediate(() => {
    task().catch((error) => console.error(`[background] ${label} failed:`, error));
  });
}
