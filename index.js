import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient }  from 'redis';

import { ordersRouter } from './routes/orders.js';
import { userRouter } from './routes/users.js';
import { orderItemsRouter } from './routes/orderItems.js';

// Connect Redis
export const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use('/orders', ordersRouter);
app.use('/users', userRouter);
app.use('/orderItems', orderItemsRouter);

app.listen(3001, () => {
  console.log('Listen on Port: 3001')
});