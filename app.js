// import redis from 'redis'

// // Obtener el host y el puerto de las variables de entorno
// const redisHost = process.env.REDIS_HOST;
// const redisPort = process.env.REDIS_PORT;

// const redisClient = redis.createClient({
//   host: redisHost,
//   port: redisPort,
// });

// redisClient.on('error', err => console.error('Error de conexión con ElastiCache:', err));

export const handler = async (event) => {
  const { requestContext, rawPath, body } = event;

  const httpMethod = requestContext.http.method;

  // event.redisClient = redisClient;

  if (httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'GET request received' })
    };
  } else if (httpMethod === 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'POST request received', requestBody: body })
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed', event })
    };
  }
};
