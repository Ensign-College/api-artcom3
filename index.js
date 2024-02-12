import express from 'express';
import bodyParser from 'body-parser';
import { createClient }  from 'redis';
import cors from 'cors';
import { addUser } from './services/userService';

// Connect Redis
const redisClient = createClient({
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

app.post('/boxes/add', async (req, res, next) => {
  console.log(req.body)
  try {
    // Get the existing boxes
    let existingBoxes = await redisClient.json.get('boxes') || [];
    
    // const lastId = existingBoxes.slice(-1).id

    // Create a new box
    const newBox = {
      id: req.body.id
    };

    // Update the 'boxes' key in Redis with the new list of boxes
    await redisClient.json.arrAppend('boxes', '$', newBox);

    res.json({ success: true, message: 'Box created successfully', newBox });
  } catch (error) {
    console.error('Error creating box:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/users/add', async (req, res, next) => {
  addUser(redisClient, req.body.user);
})

app.get('/boxes', async (req, res, next) => {
  let boxes = await redisClient.json.get('boxes');
  res.json(boxes);
})



app.listen(3001, () => {
  console.log('Listen on Port: 3001')
});