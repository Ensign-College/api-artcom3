import redis from 'redis'
import { v4 as uuidv4 } from 'uuid';
import { userPostHandler } from './lambda-path/users';
import { getAllUsers, getUser } from './lambda-services/userService';
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
// * PRODUCT FUNCTIONS
//************************

/**
 * Function: Generate SKU
 */
function generateSKU(productName, productID) {
  // Extract the first three characters from the product name
  const namePrefix = productName.substring(0, 3).toUpperCase();
  
  // Take the first eight characters from the UUID
  const idPrefix = productID.substring(0, 8).toUpperCase();
  
  // Combine the two prefixes to form the SKU
  const sku = namePrefix + '-' + idPrefix;
  
  return sku;
}

/**
 * Function: Add Product to Redis Client
 */
const addProduct = async ({ redisClient, product }) => {

  await redisClient.connect();

  const { name } = product;

  const productId = uuidv4();
  const sku = generateSKU(name, productId);
  const productKey = `product:${productId}`;
  console.log(product);
  const existingProduct = await redisClient.json.get(productKey);
  if (!existingProduct) {
      // Create the user data in Redis
      product.sku = sku;
      product.productId = productId;
      await redisClient.json.set(productKey, '$', product);
      await redisClient.disconnect();
      return product;
  } else {
      await redisClient.disconnect();
      throw new Error(`Customer ${productKey} exist`);
  }
};

/**
 * Function: Get Product by Id
 */
export const getProduct = async ({ redisClient, productId } ) => {
  await redisClient.connect();
  const productKey = `product:${productId}`
  const existingProduct = await redisClient.json.get(productKey);
  if (!existingProduct) {
    await redisClient.disconnect();
    throw new Error(`Customer ${productKey} doesn't exist`);
  }
  await redisClient.disconnect();
  return existingProduct;
}

/**
 * Function: Get All Products
 */
export const getAllProducts = async ({ redisClient }) => {
  await redisClient.connect();
  let cursor = 0;
  const products = [];

  do {
    const result = await redisClient.scan(cursor, {MATCH: 'product*', COUNT: 100});
    cursor = result.cursor;
    let keys = result.keys;

    for (const key of keys) {
      const product = await redisClient.json.get(key);
      products.push(product);
    }

  } while (cursor !== 0);

  await redisClient.disconnect();
  return products;
}

//***********************************************
// * MAIN: Entry point for AWS Lambda serverless
//***********************************************
export const handler = async (event, context) => {
  const { requestContext, rawPath, body, queryStringParameters } = event;

  const httpMethod = requestContext.http.method ?? '';

  event.redisClient = redisClient;

  // PATH: /user
  if (rawPath === '/users') {

    // USERS POST -> Create User
    if (httpMethod === 'POST') {
      return await userPostHandler(event);
    } 
    
    // USERS GET -> Get users
    else if (httpMethod === 'GET') {

      // TODO: Get User by Id
      if (queryStringParameters) {
        if (!queryStringParameters.userId) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'userId query param is missing' })
          };
        }
        const userId = queryStringParameters.userId;
        try {
          const response = await getUser({ redisClient, userId });
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          };
        } catch (err) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'The user cannot be found', err })
          };

        }
      } else {
        // TODO: Get All Users
        try {
          const response = await getAllUsers({ redisClient });
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

  // PATH: /products
  } else if (rawPath === '/products') {

    console.log('PRODUCTS');

    if (httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const redisClient = event.redisClient
      
      const product = {
        name: body.name,
        price: body.price,
      }
  
      try {
        const response = await addProduct({redisClient, product});
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'The product has been created.', event, response })
        };
      } catch(err) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'The product could not be created.', err })
        };
      }

    } else if (httpMethod === 'GET') {

      // Get Product by Id
      if (queryStringParameters) {
        if (!queryStringParameters.productId) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'productId query param is missing' })
          };
        }
        const productId = queryStringParameters.productId;
        try {
          const response = await getProduct({ redisClient, productId });
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          };
        } catch (err) {
          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'The product cannot be found', err })
          };

        }
      } else {
        // Get All Products
        try {
          const response = await getAllProducts({ redisClient });
          return {
            statusCode: 200,
            body: JSON.stringify({ response })
          }
        }
        catch (err) {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Products cannot be found', err })
          }
        };
      }
    }

  } else if (httpMethod === 'GET') {
    
    if (queryStringParameters) {
      if (!queryStringParameters.userId) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'userId query param is missing' })
        };
      }
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
