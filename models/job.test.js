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
    title: "J1",
    salary: 100,
    equity: 0,
    companyHandle: "c1",
  }
  test('works', async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = db.query(
      `SELECT title, salary, equity, company_handle
          FROM jobs
          WHERE title = 'J1'`);
    expect(results.row).toEqual([
      {
        title: "J1",
        salary: 100,
        equity: 0,
        company_handle: "c1",
      }
    ]);
  });

});