const { sqlForPartialUpdate } = require('./sql');

describe('sqlForPartialUpdate', () => {
  test('works', () => {
    const data = {
      firstName: "John",
      lastName: "Smith"
    }
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        firstName: "first_name",
        lastName: "last_name",
      }
    );
    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual(["John", "Smith"]);
  });
});