import { Router } from "express";


import { addOrder, getOrder } from '../services/orderservice.js';
import { redisClient } from "../index.js"; 

const router = Router()

router.get("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  let order = await getOrder({ redisClient, orderId });
  if (order === null) {
    res.status(404).send('Order not found');
  } else {
    res.json(order);
  }
})

router.post("/", async (req, res) => {

  console.log(req.body);

  const { customerId, ShippingAdress } = req.body;
  let responseStatus = 400;

  if (customerId && ShippingAdress) {
    responseStatus = 200;
    try {
      const order = await addOrder({ redisClient, order: req.body });
      res.status(responseStatus).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  if (responseStatus === 400) {
    return res.status(responseStatus).send(
      `Missing one of the following fields: ${!customerId ? 'customerId' : ''}${!customerId && !ShippingAdress ? ', ' : ''}${!ShippingAdress ? 'ShippingAdress' : ''}`
    );
  }

  // res.status(responseStatus).send();
});

export { router as ordersRouter };