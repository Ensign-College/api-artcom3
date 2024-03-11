import { Router } from "express";


import { addUser, getUser } from '../services/userService.js';
import { redisClient } from "../index.js"; 

const router = Router();

// * Get All Users
router.get('/', async (req, res, next) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber
  }
  // console.log(req.body)
  const response = await addUser({redisClient, user});
  res.json({ success: true, message: 'User Created', response });
});

// * Get User By Id (phone-number)
router.get('/:phoneNumber', async (req, res, next) => {
  const phoneNumber = req.params.phoneNumber;

  const response = await getUser({ redisClient, phoneNumber });
  res.json({ succes: true, message: response });
})


// * Create User
router.post('/users/add', async (req, res, next) => {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber
  }
  // console.log(req.body)
  const response = await addUser({redisClient, user});
  res.json({ success: true, message: 'User Created', response });
})
  
export { router as userRouter };