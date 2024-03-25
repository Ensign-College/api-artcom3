import redis from 'redis'
// import { postUserHandler } from './handlers/users.js';

// Obtener el host y el puerto de las variables de entorno
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

export const handler = async (event) => {
  const { requestContext, rawPath, body } = event;

  const httpMethod = requestContext.http.method ?? '';

  event.redisClient = redisClient;

  if (rawPath === '/users' && httpMethod === 'POST') {
    // return postUserHandler(event);

    const body = JSON.parse(event.body);
    const redisClient = event.redisClient
    
    const user = {
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber
    }
    // console.log(req.body)
    const response = await addUser({redisClient, user});
    
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User Created', event, response, redisHost, redisPort })
    };

    // return ({ success: true, message: 'User Created', response });
  

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
