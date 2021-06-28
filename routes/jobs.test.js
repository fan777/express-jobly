"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', () => {
  const newJob = {
    title: "J0",
    salary: 999,
    equity: "0.05",
    companyHandle: "c1",
  };

  test('works for admins', async () => {
    const resp = await request(app)
      .post('/jobs')
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        ...newJob
      },
    });
  })

  test('fails for non-admins', async () => {
    const resp = await request(app)
      .post('/jobs')
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  })

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "test123",
        salary: 5000,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "abc",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
})

/************************************** GET /jobs */

describe('GET / jobs', () => {
  test('ok for anon', async () => {
    const resp = await request(app).get('/jobs');
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "J1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
          },
          {
            id: expect.any(Number),
            title: "J2",
            salary: 150,
            equity: "0",
            companyHandle: "c1",
          },
          {
            id: expect.any(Number),
            title: "J3",
            salary: 200,
            equity: null,
            companyHandle: "c2",
          },
        ]
    });
  });

  test('works: filter - found', async () => {
    const resp = await request(app).get('/jobs?title=j&minSalary=175');
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "J3",
            salary: 200,
            equity: null,
            companyHandle: "c2",
          }
        ]
    })
  })

  test('works: filter - found', async () => {
    const resp = await request(app).get('/jobs?title=j&hasEquity=false');
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "J2",
            salary: 150,
            equity: "0",
            companyHandle: "c1",
          },
          {
            id: expect.any(Number),
            title: "J3",
            salary: 200,
            equity: null,
            companyHandle: "c2",
          }
        ]
    })
  })

  test('fails: test next() handler', async () => {
    await db.query('DROP TABLE jobs CASCADE');
    const resp = await request(app)
      .get('/jobs')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/99`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', () => {
  test('works for admin', async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 'J1111',
        salary: 200
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "J1111",
        salary: 200,
        equity: "0.1",
        companyHandle: "c1"
      },
    });
  });

  test("fails for non-admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "abctest",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "abctest",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such jobs", async function () {
    const resp = await request(app)
      .patch(`/jobs/999`)
      .send({
        title: "not possible",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: 8,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        equity: "5",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', () => {
  test('works for admin', async () => {
    const resp = await request(app)
      .delete('/jobs/1')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test('fails for users', async () => {
    const resp = await request(app)
      .delete('/jobs/1')
      .set('authorization', `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/job/999`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
})

