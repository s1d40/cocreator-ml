import { decodeUnifiedSession, extractTokenFromRequest, getUnifiedSessionFromRequest } from '../../auth';
import { verifyApiAuth } from '../api-auth';
import { getMlTokenForClient, setMlTokenForClient, getUserSettings, getMonitoredCompetitors } from '../user-store';
import { middleware } from '../../middleware';
import { NextRequest } from 'next/server';

function createJwt(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.signature_hash`;
}

function runTests() {
  console.log('--- Starting Unified Authentication Bridge Test Suite ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. JWT Session Decoding
  const validPayload = {
    client_id: 'client_acme_123',
    email: 'acme@example.com',
    name: 'Acme Seller',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const validJwt = createJwt(validPayload);
  const session1 = decodeUnifiedSession(validJwt);

  assert(session1 !== null, 'Decodes valid JWT session');
  assert(session1?.user.client_id === 'client_acme_123', 'Extracts correct client_id from JWT');
  assert(session1?.user.email === 'acme@example.com', 'Extracts correct email from JWT');

  // 2. Expired JWT Token
  const expiredPayload = {
    client_id: 'client_expired_456',
    exp: Math.floor(Date.now() / 1000) - 100,
  };
  const expiredJwt = createJwt(expiredPayload);
  const sessionExpired = decodeUnifiedSession(expiredJwt);
  assert(sessionExpired === null, 'Rejects expired JWT token');

  // 3. Token Missing client_id
  const invalidPayload = { email: 'no_client_id@example.com' };
  const invalidJwt = createJwt(invalidPayload);
  const sessionInvalid = decodeUnifiedSession(invalidJwt);
  assert(sessionInvalid === null, 'Rejects token without client_id');

  // 4. Token Extraction from Authorization Header
  const reqHeader = new Request('https://eval.cocreator.com/api/ml-token', {
    headers: { Authorization: `Bearer ${validJwt}` },
  });
  const extractedHeaderToken = extractTokenFromRequest(reqHeader);
  assert(extractedHeaderToken === validJwt, 'Extracts token from Authorization Bearer header');

  // 5. Token Extraction from Cookie Header
  const reqCookie = new Request('https://eval.cocreator.com/api/ml-token', {
    headers: { Cookie: `cocreator_session=${validJwt}` },
  });
  const extractedCookieToken = extractTokenFromRequest(reqCookie);
  assert(extractedCookieToken === validJwt, 'Extracts token from cocreator_session cookie');

  // 6. API Authentication Protection (verifyApiAuth)
  const unauthReq = new Request('https://eval.cocreator.com/api/ml-token');
  verifyApiAuth(unauthReq).then((authResult) => {
    assert(authResult.authenticated === false, 'API auth rejects unauthenticated request');
    assert(authResult.response.status === 401, 'API auth returns status 401 for unauthenticated request');
  });

  const authReq = new Request('https://eval.cocreator.com/api/ml-token', {
    headers: { Authorization: `Bearer ${validJwt}` },
  });
  verifyApiAuth(authReq).then((authResult) => {
    assert(authResult.authenticated === true, 'API auth accepts valid request');
    assert(authResult.clientId === 'client_acme_123', 'API auth returns correct clientId');
  });

  // 7. Per-Client Credential Isolation
  setMlTokenForClient('client_A', 'APP_USR-CLIENT-A-TOKEN');
  setMlTokenForClient('client_B', 'APP_USR-CLIENT-B-TOKEN');

  assert(getMlTokenForClient('client_A') === 'APP_USR-CLIENT-A-TOKEN', 'Client A retrieves Client A token');
  assert(getMlTokenForClient('client_B') === 'APP_USR-CLIENT-B-TOKEN', 'Client B retrieves Client B token');
  assert(getMlTokenForClient('client_A') !== getMlTokenForClient('client_B'), 'Tokens are strictly isolated between clients');

  // 8. Middleware Route Protection
  const nextReqUnauthPage = new NextRequest('https://eval.cocreator.com/mercado-livre');
  const mwResUnauthPage = middleware(nextReqUnauthPage);
  assert(mwResUnauthPage.status === 307 || mwResUnauthPage.status === 302, 'Middleware redirects unauthenticated page request');
  const redirectLocation = mwResUnauthPage.headers.get('location') || '';
  assert(redirectLocation.includes('/login?returnTo='), 'Middleware includes returnTo query parameter in login redirect');

  const nextReqUnauthApi = new NextRequest('https://eval.cocreator.com/api/ml-orders');
  const mwResUnauthApi = middleware(nextReqUnauthApi);
  assert(mwResUnauthApi.status === 401, 'Middleware returns 401 status for unauthenticated API request');

  const nextReqAuthPage = new NextRequest('https://eval.cocreator.com/mercado-livre', {
    headers: { Cookie: `cocreator_session=${validJwt}` },
  });
  const mwResAuthPage = middleware(nextReqAuthPage);
  assert(mwResAuthPage.status === 200, 'Middleware allows authenticated page request');

  setTimeout(() => {
    console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  }, 200);
}

runTests();
