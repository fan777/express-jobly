"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', () => {
  const newJob = {
    title: "J0",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1",
  }

  test('works', async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
          FROM jobs
          WHERE title = 'J0'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "J0",
        salary: 100,
        equity: "0.1",
        company_handle: "c1",
      }
    ]);
  });
});

/************************************** findAll */
describe('findAll', () => {
  test('works: no filter', async () => {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 100,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 100,
        equity: "0.040",
        companyHandle: "c3",
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: null,
        equity: null,
        companyHandle: "d1",
      },
      {
        id: expect.any(Number),
        title: "J4",
        salary: 700,
        equity: "0.042",
        companyHandle: "d3",
      },
    ]);
  })
})