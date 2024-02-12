export const addUser = async ({ redisClient, user }) => {
  console.log(user);
  const customerKey = `customer:${user.phoneNumber}`;
  const existingCustomer = await redisClient.json.get(customerKey);
  if (!existingCustomer) {
      const userKey = `user:${user.phoneNumber}`;
      // Create the user data in Redis
      await redisClient.json.set(userKey, '$', user);
      return user;
  } else {
      throw new Error(`Customer ${customerKey} exist`);
  }
};