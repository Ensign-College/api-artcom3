
import { addUser, getUser } from '../services/userService.js';

// * Get All Users
// router.get('/', async (event) => {
//   const user = {
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     phoneNumber: req.body.phoneNumber
//   }
//   // console.log(req.body)
//   const response = await addUser({redisClient, user});
//   res.json({ success: true, message: 'User Created', response });
// });

// // * Get User By Id (phone-number)
// router.get('/:phoneNumber', async (req, res, next) => {
//   const phoneNumber = req.params.phoneNumber;

//   const response = await getUser({ redisClient, phoneNumber });
//   res.json({ succes: true, message: response });
// })


// * Create User Handler
export const postUserHandler = async (event) => {

  const body = JSON.parse(event.body);
  const redisClient = event.redisClient
  
  const user = {
    firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber
  }
  // console.log(req.body)
  const response = await addUser({redisClient, user});
  res.json({ success: true, message: 'User Created', response });
}
  
// export { router as userRouter };