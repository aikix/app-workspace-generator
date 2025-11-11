import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have basic test infrastructure', () => {
    expect(true).toBe(true);
  });

  it('should validate Node.js environment', () => {
    expect(process.version).toBeDefined();
    expect(process.version).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
