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
export const getUser = async ({ redisClient, phoneNumber } ) => {
  await redisClient.connect();
  const customerKey = `customer:${phoneNumber}`
  const existingCustomer = await redisClient.json.get(customerKey);
  if (!existingCustomer) {
    await redisClient.disconnect();
    throw new Error(`Customer ${customerKey} doesn't exist`);
  }
  await redisClient.disconnect();
  return existingCustomer;
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
      } catch(error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'The user could not be created.', error })
        };
      }
    } 
    
    // USERS GET -> Get users
    else if (httpMethod === 'GET') {
      if (queryStringParameters.userId) {
        const userId = queryStringParameters.userId;

        return {
          statusCode: 500,
          body: JSON.stringify({ userId })
        };

        try {
          const response = await getUser({redisClient, userId});
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          };
        } catch(error) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error })
          };
        }
      }
    }

  } else if (httpMethod === 'GET') {

    const redisClient = await event.redisClient

    const user = {
      firstName: "Kevin",
      lastName: "Haro",
      phoneNumber: 3854615172
    }

    const response = await addUser({redisClient, user});

    // await redisClient.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'GET request received', event, response })
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
