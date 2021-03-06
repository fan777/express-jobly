"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");
  await db.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1');
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM applications");


  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });
  await Company.create(
    {
      handle: "d1",
      name: "D1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://d1.img",
    });
  await Company.create(
    {
      handle: "d2",
      name: "D2",
      numEmployees: 5,
      description: "Desc2",
      logoUrl: "http://d2.img",
    });
  await Company.create(
    {
      handle: "d3",
      name: "D3",
      numEmployees: 9,
      description: "Desc3",
      logoUrl: "http://d3.img",
    });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await Job.create({
    title: "J1",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1",
  });
  await Job.create({
    title: "J2",
    salary: 150,
    equity: "0",
    companyHandle: "c1",
  });
  await Job.create({
    title: "J3",
    salary: 200,
    equity: null,
    companyHandle: "c2",
  });

  await db.query(`
  INSERT INTO applications(username, job_id)
    VALUES ('u2', 2),
           ('u1', 2)`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: true });
const u2Token = createToken({ username: "u2", isAdmin: false });
const u3Token = createToken({ username: "u3", isAdmin: false });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
};
