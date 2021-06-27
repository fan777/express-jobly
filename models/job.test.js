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

/************************************** get */

describe('get', () => {
  test('works with job id', async () => {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "J1",
      salary: 100,
      equity: "0",
      companyHandle: "c1",
    })
  })

  test('not found, nonexistent job id', async () => {
    try {
      let job = await Job.get(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

})

/************************************** update */

describe('update', () => {
  const updateData = {
    title: "J99",
    salary: 9999,
    equity: "1.0",
  };

  test('works', async () => {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
          FROM jobs
          WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "J99",
      salary: 9999,
      equity: "1.0",
      companyHandle: "c1",
    }]);
  });

  test('works: null fields', async () => {
    const updateDataSetNulls = {
      title: "JTest",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: "c1",
    });
  });

  test('not found if no such job', async () => {
    try {
      await Job.update(541, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('bad request with no data', async () => {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', () => {
  test('works', async () => {
    await Job.remove(1);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id = 1`);
    expect(res.rows.length).toEqual(0);
  });

  test('not found if no such job', async () => {
    try {
      await Job.remove(591);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});