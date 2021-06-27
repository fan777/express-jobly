const { BadRequestError } = require("../expressError");

/** Helper function to generate prepared statement for a partial update.
 * 
 * @param {*} dataToUpdate - data to be updated, represented as key and value, example:
 *     {firstName: "John", lastName: "Smith"}
 * @param {*} jsToSql - translation for keys having different column name in table, example:
 *     {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"}
 * @returns 
 *   setCols - text for SET clause in a parameterized UPDATE statement, example:
 *     "first_name"=$1, "last_name"=$2
 *   values - array of values corresponding to setCols, example:
 *     ["John", "Smith"]
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Helper function to generate prepared statement for filtered company select.
 * 
 * @param {*} filters - filters to be applied, represented as key and value, example:
 *     {name: "D", minEmployees: 3, maxEmployees: 9}
 * @param {*} jsToSql - translation for keys to column name in table, example:
 *     {minEmployees: "num_employees", maxEmployees: "num_employees"}
 * @returns 
 *   whereCols - text for WHERE clause in parameterized SELECT statement, example:
 *     WHERE "name" like $1 AND "minEmployees" >= $2 AND "maxEmployees" <= $3
 *   values - array of values corresponding to whereCols, example:
 *     ["%d%", 3, 9]
 */
function sqlForCompanyFilter(filters, jsToSql) {
  if (!filters || Object.keys(filters).length === 0) return {
    whereCols: "",
    values: []
  }

  const keys = Object.keys(filters);
  let values = Object.values(filters)

  const cols = keys.map((filterName, idx) => {
    if (filterName === 'name') {
      values[idx] = `%${values[idx].toLowerCase()}%`;
      return `LOWER("${filterName}") like $${idx + 1}`;
    }
    if (filterName === 'minEmployees')
      return `"${jsToSql[filterName]}">=$${idx + 1}`;
    if (filterName === 'maxEmployees')
      return `"${jsToSql[filterName]}"<=$${idx + 1}`;
  });

  return {
    whereCols: "WHERE " + cols.join(" AND "),
    values: values
  };
}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilter };
