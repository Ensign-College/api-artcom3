import { getOrder, addOrder } from '../services/orderservice.js';

export const getOrderHandler = async (event) => {
  const orderId = event.pathParameters.orderId;
  let order = await getOrder({ redisClient: event.redisClient, orderId });
  if (order === null) {
    return {
      statusCode: 404,
      body: 'Order not found'
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(order)
    };
  }
};

export const addOrderHandler = async (event) => {
  const body = JSON.parse(event.body);

  const { customerId, ShippingAdress } = body;
  let responseStatus = 400;

  if (customerId && ShippingAdress) {
    responseStatus = 200;
    try {
      const order = await addOrder({ redisClient: event.redisClient, order: body });
      return {
        statusCode: responseStatus,
        body: JSON.stringify(order)
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: 'Internal Server Error'
      };
    }
  }

  if (responseStatus === 400) {
    return {
      statusCode: responseStatus,
      body: `Missing one of the following fields: ${!customerId ? 'customerId' : ''}${!customerId && !ShippingAdress ? ', ' : ''}${!ShippingAdress ? 'ShippingAdress' : ''}`
    };
  }
};