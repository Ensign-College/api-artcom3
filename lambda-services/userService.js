
export const testImport = () => {
  return 'IMPORT WORKS';
} 

// //************************
// // * USERS FUNCTIONS
// //************************

// /**
//  * Function: Add User to Redis Client
//  */
// export const addUser = async ({ redisClient, user }) => {

//   await redisClient.connect();

//   const customerKey = `customer:${user.phoneNumber}`;
//   const existingCustomer = await redisClient.json.get(customerKey);
//   if (!existingCustomer) {
//       // Create the user data in Redis
//       await redisClient.json.set(customerKey, '$', user);
//       await redisClient.disconnect();
//       return user;
//   } else {
//       await redisClient.disconnect();
//       throw new Error(`Customer ${customerKey} exist`);
//   }
// };

// /**
//  * Function: Add User to Redis Client
//  */
// export const getUser = async ({ redisClient, userId } ) => {
//   await redisClient.connect();
//   const customerKey = `customer:${userId}`
//   const existingCustomer = await redisClient.json.get(customerKey);
//   if (!existingCustomer) {
//     await redisClient.disconnect();
//     throw new Error(`Customer ${customerKey} doesn't exist`);
//   }
//   await redisClient.disconnect();
//   return existingCustomer;
// }

// /**
//  * Function: Get All Users
//  */
// export const getAllUsers = async ({ redisClient }) => {
//   await redisClient.connect();
//   let cursor = 0;
//   const users = [];

//   do {
//     const result = await redisClient.scan(cursor, {MATCH: 'customer*', COUNT: 100});
//     cursor = result.cursor;
//     let keys = result.keys;

//     for (const key of keys) {
//       const user = await redisClient.json.get(key);
//       users.push(user);
//     }

//     console.log(result)
//     console.log(users)
//   } while (cursor !== 0);

//   await redisClient.disconnect();
//   return users;
// }