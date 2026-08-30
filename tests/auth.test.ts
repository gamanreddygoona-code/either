import { describe, it, expect } from 'vitest';

describe('Auth & Session Security API', () => {
  it('API returns 401 without token', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/connectors');
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('API returns 200 with valid Bearer token', async () => {
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@either.dev', role: 'developer' })
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.token;

    const res = await fetch('http://127.0.0.1:3000/api/connectors', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    expect(res.status).toBe(200);
  });
});