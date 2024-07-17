/**
 *
 * Module containing database related utility functions
 * @module core/db
 *
 * @requires mssql
 */

/**
 * The MS-SQL module
 */

import sql from "mssql";

export const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  // If you're on Windows Azure, you will need this:
  options: { encrypt: false },
  connectionTimeout: 5000,
  requestTimeout: 15000,
  pool: {
    max: 20,
    min: 1,
    idleTimeoutMillis: 60000,
  },
};


/**
 * Internal variable to hold on to (cache) the existing (connected) connection pool
 * @type sql.ConnectionPool
 */
let _connectionPool;

export async function resetConnection() {
  if(_connectionPool?.connected) {
    await _connectionPool.close();
  }
  _connectionPool = undefined;
}

/**
 * Get the connection pool.
 *
 * Existing connection pool will be reused if they are still connected.
 *
 * @returns {sql.ConnectionPool} the connection pool (cached)
 */
let connectionPool = async () => {
  if (!_connectionPool || !_connectionPool.connected) {
    _connectionPool = await new sql.ConnectionPool(config).connect();
  }

  return _connectionPool;
};

let timed_query = (request) => async (command, name) => {
  let response;
  try {
    response = await request.query(command);
  } catch (error) {
    // This code wraps the internal errors for the tedious library
    // and allows the error stack to be properly set due to raising a new Error here.
    let wrappedError = new Error(`Error executing ${name}`);
    wrappedError.causedBy = error;
    throw wrappedError;
  }

  let params = "(none)";

  if (request._paramMap) {
    if (Object.keys(request._paramMap).length > 0) {
      params = "{";
      for (let key of Object.keys(request._paramMap)) {
        params = params + `\n\t${key}: ${request._paramMap[key]},`;
      }
      params = params + "\n}";
    }
  } else {
    params = "{\n\tCould not find input params\n}";
  }

  return response;
};

/**
 * Create a function allowing the the request to track input parameters while
 * delegating to the original `input` function on the request.
 *
 * @param {sql.Request} req the request to decorate.
 * @returns a new function to act as replacement for the `input` function on the
 * request
 *
 * @see module:shared/db~timed_query
 */
let input = (req) => {
  return (param, value) => {
    req._paramMap[param] = value;
    return req._origInput(param, value);
  };
};

/**
 * Get a new database request.
 *
 * The request is decorated with additional properties allowing tracking of query
 * time as well as parameters.
 *
 * @see module:shared/db~timed_query
 * @see module:shared/db~input
 *
 * @returns {sql.Request} a decorated database request.
 */
export const db = async () => {
  let pool = await connectionPool();

  let request = await pool.request();

  request.timed_query = timed_query(request);
  request._paramMap = {};
  request._origInput = request.input;
  request.input = input(request);

  return request;
};

/**
 * Get a new database transaction.
 *
 * The requests for this transaction are decorated with additional properties
 * allowing tracking of query time as well as parameters.
 *
 * @returns {sql.Transaction} a database transaction with decorated requests.
 */
export const transaction = async () => {
  let pool = await connectionPool();
  let tx = await pool.transaction();

  tx.timed_request = async () => {
    let request = await tx.request();
    request.timed_query = timed_query(request);
    request._paramMap = {};
    request._origInput = request.input;
    request.input = input(request);

    return request;
  };

  return tx;
};

/**
 * Function to execute inside a transaction.
 * @callback transactionExecutable
 * @param {sql.Transaction} tx the transaction against which to execute
 * @returns {*} the result of the executable code
 */

/**
 * Asynchronously execute code inside of a transaction.
 *
 * Calling this function almost <emph>ALWAYS</emph> needs to be awaited, or the users
 * of APIs will not be notified of errors during the execution on the DB
 * @param {module:shared/db~transactionExecutable} executable the code to run inside
 *   a transaction
 * @returns {Promise<*>} the result of applying the executable against a transaction
 */
export const withTransaction = async (executable) => {
  if (executable == undefined || !(executable instanceof Function)) {
    throw new Error("Callback function required to execute in a transaction");
  } else {
    let tx = await transaction();
    try {
      await tx.begin();
      let result = await executable(tx);
      await tx.commit();
      return result;
    } catch (error) {
      try {
        await tx.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction", {
          rollbackError,
        });
      }
      return Promise.reject(error);
    }
  }
};
