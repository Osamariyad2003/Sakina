/**
 * Artificial delay for the offline/local implementations.
 *
 * Without it every local read resolves in the same tick, so loading and
 * skeleton states never appear during development and a screen that breaks
 * under real latency looks fine. Defined once here instead of as a private
 * `fakeDelay` in each of 14 services (docs/architecture-review.md §9).
 *
 * Only local/mock code should call this. Nothing on a real network path
 * should ever slow itself down on purpose.
 */
export function simulateLatency(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
