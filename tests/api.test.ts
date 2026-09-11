import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET as getColleges } from '../src/app/api/colleges/route';
import { GET as getCollegeDetail } from '../src/app/api/colleges/[slug]/route';
import { GET as compareColleges } from '../src/app/api/compare/route';
import { GET as getSaved, POST as saveCollege } from '../src/app/api/saved/route';
import { DELETE as deleteSaved } from '../src/app/api/saved/[collegeId]/route';
import { GET as getComparisons, POST as saveComparison } from '../src/app/api/comparisons/route';
import { DELETE as deleteComparison } from '../src/app/api/comparisons/[id]/route';
import { POST as registerUser } from '../src/app/api/auth/register/route';
import { POST as loginUser } from '../src/app/api/auth/login/route';
import { POST as logoutUser } from '../src/app/api/auth/logout/route';
import { createSessionToken, AUTH_COOKIE_NAME } from '../src/lib/auth';
import prisma from '../src/lib/prisma';

test.describe('CollegeFinder Backend API Test Suite', () => {
  let sampleCollegeIds: string[] = [];
  let sampleSlug = '';

  test.before(async () => {
    // Retrieve sample colleges from seeded database for ID-based tests
    const colleges = await prisma.college.findMany({
      take: 4,
      select: { id: true, slug: true },
    });
    sampleCollegeIds = colleges.map((c) => c.id);
    sampleSlug = colleges[0].slug;
  });

  test.describe('GET /api/colleges', () => {
    test('Normal request returns 200 with college list and pagination', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?page=1&limit=10');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(Array.isArray(json.data));
      assert.equal(json.data.length, 10);
      assert.ok(json.pagination);
      assert.equal(json.pagination.page, 1);
      assert.equal(json.pagination.limit, 10);
      assert.ok(json.pagination.total >= 100);
      assert.ok(json.pagination.totalPages >= 10);
    });

    test('Search filter matches college name or description', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?search=technology');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.length > 0);
      for (const item of json.data) {
        const text = `${item.name} ${item.description} ${item.city} ${item.state}`.toLowerCase();
        const matchesText = text.includes('technology') || text.includes('tech');
        if (matchesText) {
          assert.ok(true);
        } else {
          const courseCount = await prisma.course.count({
            where: {
              collegeId: item.id,
              name: { contains: 'technology', mode: 'insensitive' },
            },
          });
          assert.ok(courseCount > 0, `College ${item.name} does not match search query`);
        }
      }
    });

    test('Course filter strictly returns colleges offering the specified program', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?course=Computer%20Science&limit=10');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.length > 0);
      for (const item of json.data) {
        // Verify in database that this college actually offers Computer Science
        const count = await prisma.course.count({
          where: {
            collegeId: item.id,
            name: { contains: 'Computer Science', mode: 'insensitive' },
          },
        });
        assert.ok(count > 0, `College ${item.name} does not offer Computer Science`);
      }
    });

    test('Location filter matches city or state', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?location=CA');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.length > 0);
      for (const item of json.data) {
        assert.ok(item.state === 'CA' || item.location.includes('CA'));
      }
    });

    test('Fee range filter returns colleges strictly within bounds', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?minFees=10000&maxFees=30000');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data.length > 0);
      for (const item of json.data) {
        assert.ok(item.fees >= 10000 && item.fees <= 30000);
      }
    });

    test('Sorting by fees ascending returns correct order', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?sort=fees_asc&limit=10');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      for (let i = 0; i < json.data.length - 1; i++) {
        assert.ok(json.data[i].fees <= json.data[i + 1].fees);
      }
    });

    test('Sorting by rating descending returns correct order', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?sort=rating_desc&limit=10');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      for (let i = 0; i < json.data.length - 1; i++) {
        assert.ok(json.data[i].rating >= json.data[i + 1].rating);
      }
    });

    test('Empty results scenario returns empty array with total 0', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?search=xyznonexistentphrase98765');
      const res = await getColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.deepEqual(json.data, []);
      assert.equal(json.pagination.total, 0);
    });

    test('Invalid query parameter (minFees > maxFees) returns 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?minFees=50000&maxFees=20000');
      const res = await getColleges(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'INVALID_PARAMETERS');
    });

    test('Invalid rating bounds (> 5) returns 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges?minRating=6');
      const res = await getColleges(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'INVALID_PARAMETERS');
    });
  });

  test.describe('GET /api/colleges/[slug]', () => {
    test('Valid slug returns college with courses, placements, and reviews', async () => {
      const req = new NextRequest(`http://localhost:3000/api/colleges/${sampleSlug}`);
      const res = await getCollegeDetail(req, { params: Promise.resolve({ slug: sampleSlug }) });
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.ok(json.data);
      assert.equal(json.data.slug, sampleSlug);
      assert.ok(Array.isArray(json.data.courses));
      assert.ok(Array.isArray(json.data.placements));
      assert.ok(Array.isArray(json.data.reviews));
    });

    test('Nonexistent slug returns 404 NOT_FOUND', async () => {
      const req = new NextRequest('http://localhost:3000/api/colleges/non-existent-college-slug-xyz');
      const res = await getCollegeDetail(req, { params: Promise.resolve({ slug: 'non-existent-college-slug-xyz' }) });
      assert.equal(res.status, 404);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'NOT_FOUND');
    });
  });

  test.describe('GET /api/compare', () => {
    test('Comparing 2 valid colleges returns 200 with matching items', async () => {
      const ids = `${sampleCollegeIds[0]},${sampleCollegeIds[1]}`;
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.length, 2);
      assert.equal(json.data[0].id, sampleCollegeIds[0]);
      assert.equal(json.data[1].id, sampleCollegeIds[1]);
    });

    test('Comparing 3 valid colleges returns 200 with matching items', async () => {
      const ids = `${sampleCollegeIds[0]},${sampleCollegeIds[1]},${sampleCollegeIds[2]}`;
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.data.length, 3);
    });

    test('Fewer than 2 colleges is rejected with 400', async () => {
      const ids = sampleCollegeIds[0];
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'INVALID_COMPARISON_SELECTION');
    });

    test('More than 3 colleges is rejected with 400', async () => {
      const ids = `${sampleCollegeIds[0]},${sampleCollegeIds[1]},${sampleCollegeIds[2]},${sampleCollegeIds[3]}`;
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'INVALID_COMPARISON_SELECTION');
    });

    test('Duplicate IDs are rejected with 400', async () => {
      const ids = `${sampleCollegeIds[0]},${sampleCollegeIds[0]}`;
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 400);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'INVALID_COMPARISON_SELECTION');
    });

    test('Nonexistent college ID returns 404', async () => {
      const ids = `${sampleCollegeIds[0]},nonexistentcuid12345`;
      const req = new NextRequest(`http://localhost:3000/api/compare?ids=${ids}`);
      const res = await compareColleges(req);
      assert.equal(res.status, 404);

      const json = await res.json();
      assert.ok(json.error);
      assert.equal(json.error.code, 'COLLEGE_NOT_FOUND');
    });
  });

  test.describe('Authentication & Saved Colleges Security', () => {
    test('Unauthenticated user cannot access GET /api/saved', async () => {
      const res = await getSaved(new NextRequest('http://localhost:3000/api/saved'));
      assert.equal(res.status, 401);

      const json = await res.json();
      assert.equal(json.error.code, 'UNAUTHORIZED');
    });

    test('Unauthenticated user cannot access POST /api/saved', async () => {
      const req = new NextRequest('http://localhost:3000/api/saved', {
        method: 'POST',
        body: JSON.stringify({ collegeId: sampleCollegeIds[0] }),
      });
      const res = await saveCollege(req);
      assert.equal(res.status, 401);
    });

    test('Unauthenticated user cannot access DELETE /api/saved/[collegeId]', async () => {
      const req = new NextRequest(`http://localhost:3000/api/saved/${sampleCollegeIds[0]}`, {
        method: 'DELETE',
      });
      const res = await deleteSaved(req, { params: Promise.resolve({ collegeId: sampleCollegeIds[0] }) });
      assert.equal(res.status, 401);
    });

    test('Register creates account and duplicate returns 409', async () => {
      const testEmail = `testuser_${Date.now()}@example.com`;
      const req1 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Student',
          email: testEmail,
          password: 'SecurePassword123!',
        }),
      });
      const res1 = await registerUser(req1);
      assert.equal(res1.status, 201);

      const json1 = await res1.json();
      assert.equal(json1.data.email, testEmail);

      // Attempt duplicate registration
      const req2 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Duplicate Student',
          email: testEmail,
          password: 'AnotherPassword123!',
        }),
      });
      const res2 = await registerUser(req2);
      assert.equal(res2.status, 409);

      const json2 = await res2.json();
      assert.equal(json2.error.code, 'EMAIL_ALREADY_EXISTS');
    });

    test('Login with valid credentials succeeds and sets session cookie', async () => {
      const email = `loginuser_${Date.now()}@example.com`;
      const password = 'ValidPassword123!';

      // Register account
      await registerUser(
        new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: 'Login Tester', email, password }),
        })
      );

      // Attempt login
      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const loginRes = await loginUser(loginReq);
      assert.equal(loginRes.status, 200);

      const json = await loginRes.json();
      assert.equal(json.data.email, email);

      const cookie = loginRes.cookies.get(AUTH_COOKIE_NAME);
      assert.ok(cookie);
      assert.ok(cookie.value.length > 20);
    });

    test('Login with invalid credentials fails with 401', async () => {
      // Wrong password
      const wrongPassReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com', password: 'WrongPassword123!' }),
      });
      const wrongPassRes = await loginUser(wrongPassReq);
      assert.equal(wrongPassRes.status, 401);

      const json = await wrongPassRes.json();
      assert.equal(json.error.code, 'INVALID_CREDENTIALS');
    });

    test('Logout clears the session cookie', async () => {
      const logoutRes = await logoutUser();
      assert.equal(logoutRes.status, 200);

      const cookie = logoutRes.cookies.get(AUTH_COOKIE_NAME);
      assert.ok(cookie);
      assert.equal(cookie.value, '');
    });

    test('End-to-End Saved Colleges: Save, Duplicate Check, List, Cross-User Isolation, and Remove', async () => {
      // 1. Create User A
      const userA = await prisma.user.create({
        data: {
          name: 'User A',
          email: `user_a_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash_for_test',
        },
      });
      const tokenA = await createSessionToken({ userId: userA.id, email: userA.email });

      // 2. Create User B
      const userB = await prisma.user.create({
        data: {
          name: 'User B',
          email: `user_b_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash_for_test',
        },
      });
      const tokenB = await createSessionToken({ userId: userB.id, email: userB.email });

      const targetCollegeId = sampleCollegeIds[0];

      // 3. User A saves a college
      const saveReq1 = new NextRequest('http://localhost:3000/api/saved', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${tokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: targetCollegeId, notes: 'Target Dream School' }),
      });
      const saveRes1 = await saveCollege(saveReq1);
      assert.equal(saveRes1.status, 201);
      const saveJson1 = await saveRes1.json();
      assert.equal(saveJson1.data.collegeId, targetCollegeId);

      // 4. Duplicate save attempt by User A returns 409 ALREADY_SAVED
      const saveReq2 = new NextRequest('http://localhost:3000/api/saved', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${tokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: targetCollegeId }),
      });
      const saveRes2 = await saveCollege(saveReq2);
      assert.equal(saveRes2.status, 409);
      const saveJson2 = await saveRes2.json();
      assert.equal(saveJson2.error.code, 'ALREADY_SAVED');

      // 5. Saving nonexistent college returns 404 NOT_FOUND
      const saveInvalidReq = new NextRequest('http://localhost:3000/api/saved', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${tokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: 'cuid_nonexistent_12345' }),
      });
      const saveInvalidRes = await saveCollege(saveInvalidReq);
      assert.equal(saveInvalidRes.status, 404);

      // 6. User A lists saved colleges
      const listReqA = new NextRequest('http://localhost:3000/api/saved', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenA}` },
      });
      const listResA = await getSaved(listReqA);
      assert.equal(listResA.status, 200);
      const listJsonA = await listResA.json();
      assert.equal(listJsonA.data.length, 1);
      assert.equal(listJsonA.data[0].collegeId, targetCollegeId);

      // 7. Cross-User Security Check: User B cannot delete User A's saved college
      const crossDeleteReq = new NextRequest(
        `http://localhost:3000/api/saved/${targetCollegeId}`,
        {
          method: 'DELETE',
          headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenB}` },
        }
      );
      const crossDeleteRes = await deleteSaved(crossDeleteReq, {
        params: Promise.resolve({ collegeId: targetCollegeId }),
      });
      assert.equal(crossDeleteRes.status, 404); // Not found in User B's list

      // Verify User A still has the college saved
      const verifySaved = await prisma.savedCollege.findUnique({
        where: {
          userId_collegeId: {
            userId: userA.id,
            collegeId: targetCollegeId,
          },
        },
      });
      assert.ok(verifySaved);

      // 8. User A successfully deletes their own saved college
      const deleteReqA = new NextRequest(
        `http://localhost:3000/api/saved/${targetCollegeId}`,
        {
          method: 'DELETE',
          headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenA}` },
        }
      );
      const deleteResA = await deleteSaved(deleteReqA, {
        params: Promise.resolve({ collegeId: targetCollegeId }),
      });
      assert.equal(deleteResA.status, 200);

      // Verify record is now gone from database
      const verifyDeleted = await prisma.savedCollege.findUnique({
        where: {
          userId_collegeId: {
            userId: userA.id,
            collegeId: targetCollegeId,
          },
        },
      });
      assert.equal(verifyDeleted, null);
    });
  });

  test.describe('Saved Comparisons API', () => {
    test('Unauthenticated user cannot access GET /api/comparisons', async () => {
      const req = new NextRequest('http://localhost:3000/api/comparisons');
      const res = await getComparisons(req);
      assert.equal(res.status, 401);
    });

    test('Unauthenticated user cannot access POST /api/comparisons', async () => {
      const req = new NextRequest('http://localhost:3000/api/comparisons', {
        method: 'POST',
        body: JSON.stringify({ collegeIds: sampleCollegeIds.slice(0, 2) }),
      });
      const res = await saveComparison(req);
      assert.equal(res.status, 401);
    });

    test('Fewer than 2 colleges is rejected with 400', async () => {
      // Create dedicated test user
      const user = await prisma.user.create({
        data: {
          name: 'Compare Validator',
          email: `compval_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash',
        },
      });
      const token = await createSessionToken({ userId: user.id, email: user.email });
      const req = new NextRequest('http://localhost:3000/api/comparisons', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeIds: [sampleCollegeIds[0]] }),
      });
      const res = await saveComparison(req);
      assert.equal(res.status, 400);
      await prisma.user.delete({ where: { id: user.id } });
    });

    test('End-to-End: Save comparison, list comparisons, and delete comparison', async () => {
      // Create dedicated test user
      const user = await prisma.user.create({
        data: {
          name: 'Compare Tester',
          email: `comp_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash',
        },
      });

      const token = await createSessionToken({ userId: user.id, email: user.email });

      // Save comparison with 2 colleges
      const saveReq = new NextRequest('http://localhost:3000/api/comparisons', {
        method: 'POST',
        headers: {
          cookie: `${AUTH_COOKIE_NAME}=${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeIds: sampleCollegeIds.slice(0, 2),
          name: 'Test Tech Duo',
        }),
      });
      const saveRes = await saveComparison(saveReq);
      assert.equal(saveRes.status, 201);
      const saveJson = await saveRes.json();
      assert.equal(saveJson.data.name, 'Test Tech Duo');
      assert.equal(saveJson.data.collegeIds.length, 2);
      const comparisonId = saveJson.data.id;

      // List comparisons
      const listReq = new NextRequest('http://localhost:3000/api/comparisons', {
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const listRes = await getComparisons(listReq);
      assert.equal(listRes.status, 200);
      const listJson = await listRes.json();
      assert.equal(listJson.data.length, 1);
      assert.equal(listJson.data[0].id, comparisonId);
      assert.equal(listJson.data[0].colleges.length, 2);

      // Delete comparison
      const deleteReq = new NextRequest(`http://localhost:3000/api/comparisons/${comparisonId}`, {
        method: 'DELETE',
        headers: { cookie: `${AUTH_COOKIE_NAME}=${token}` },
      });
      const deleteRes = await deleteComparison(deleteReq, {
        params: Promise.resolve({ id: comparisonId }),
      });
      assert.equal(deleteRes.status, 200);

      // Verify deletion in DB
      const inDb = await prisma.savedComparison.findUnique({ where: { id: comparisonId } });
      assert.equal(inDb, null);

      // Cleanup user
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  test.after(async () => {
    await prisma.$disconnect();
  });
});
