import redis from 'redis'
// import { postUserHandler } from './handlers/users.js';

// Get enviroment variables for ElastiCache
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;


const redisClient = redis.createClient({
  socket: {
    host: redisHost,
    port: redisPort
  },
  tls: {},
  ssl: true,
});

redisClient.on('error', err => console.error('Error de conexión con ElastiCache:', err));

//************************
// * USERS FUNCTIONS
//************************

/**
 * Function: Add User to Redis Client
 */
const addUser = async ({ redisClient, user }) => {

  await redisClient.connect();

  const customerKey = `customer:${user.phoneNumber}`;
  const existingCustomer = await redisClient.json.get(customerKey);
  if (!existingCustomer) {
      // Create the user data in Redis
      await redisClient.json.set(customerKey, '$', user);
      await redisClient.disconnect();
      return user;
  } else {
      await redisClient.disconnect();
      throw new Error(`Customer ${customerKey} exist`);
  }
};

/**
 * Function: Add User to Redis Client
 */
export const getUser = async ({ redisClient, userId } ) => {
  await redisClient.connect();
  const customerKey = `customer:${userId}`
  const existingCustomer = await redisClient.json.get(customerKey);
  if (!existingCustomer) {
    await redisClient.disconnect();
    throw new Error(`Customer ${customerKey} doesn't exist`);
  }
  await redisClient.disconnect();
  return existingCustomer;
}

/**
 * Function: Get All Users
 */
export const getAllUsers = async ({ redisClient }) => {
  await redisClient.connect();
  let cursor = 0;
  const users = [];

  do {
    const result = await redisClient.scan(cursor, {MATCH: 'customer*', COUNT: 100});
    cursor = result.cursor;
    let keys = result.keys;

    for (const key of keys) {
      const user = await redisClient.json.get(key);
      users.push(user);
    }

    console.log(result)
    console.log(users)
  } while (cursor !== 0);

  await redisClient.disconnect();
  return users;
}

/**
 * * Main: Entry point for AWS Lambda serverless
 */
export const handler = async (event, context) => {
  const { requestContext, rawPath, body, queryStringParameters } = event;

  const httpMethod = requestContext.http.method ?? '';

  event.redisClient = redisClient;

  // PATH: /user
  if (rawPath === '/users') {

    // USERS POST -> Create User
    if (httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const redisClient = event.redisClient
      
      const user = {
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber
      }
  
      try {
        const response = await addUser({redisClient, user});
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'The user has been created.', event, response, context })
        };
      } catch(err) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'The user could not be created.', err })
        };
      }
    } 
    
    // USERS GET -> Get users
    else if (httpMethod === 'GET') {
      if (queryStringParameters.userId != null) {
        const userId = queryStringParameters.userId;
        try {
          const response = await getUser({redisClient, userId});
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          };
        } catch(err) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'The user cannot be found', err })
          };
        }
      } else {
        // TODO: Get All Users
        try {
          const response = await getAllUsers({redisClient});
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          }
        }
        catch (err) {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'The users cannot be found', err })
          }
        };
      }
    }


  // PATH: /orders
  } else if (rawPath === '/orders') {

    


  } else if (httpMethod === 'GET') {

    try {
      const response = await getAllUsers({redisClient});
      return {
        statusCode: 200,
        body: JSON.stringify({ response })
      }
    }
    catch (err) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'The users cannot be found', err })
      }
    };
  } else if (httpMethod === 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'POST request received', event, requestBody: body })
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed', event })
    };
  }
};
