import { describe, it, expect } from 'vitest';

describe('Health Check API', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(typeof data.timestamp).toBe('string');
  });
});