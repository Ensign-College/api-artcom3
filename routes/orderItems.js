import { Router } from "express";
import { redisClient } from "../index.js"; 
import { addOrderItem } from "../services/orderItems.js"

import fs from 'fs';
import Ajv from 'ajv';


const router = Router();
const ajv = new Ajv();
const orderItemSchema = JSON.parse(fs.readFileSync("./schemas/orderItemSchema.json","utf-8"));

router.post('/', async (req, res) => {
  console.log(req.body)
  try {
    const validate = ajv.compile(orderItemSchema);
    const valid = validate(req.body);

    if(!valid) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // console.log(req.body)
    
    const orderItemId = await addOrderItem({
      redisClient,
      orderItem: req.body,
    });

    res.status(201).json({ orderItemId, message: "Order item added succesfully" })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
});


export { router as orderItemsRouter };
