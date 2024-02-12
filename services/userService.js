const addUser = async ({ redisClient, user }) => {
  const customerKey = `customer:${user.phoneNumber}`;
  const existingCustomer = await redisClient.json.get(customerKey);
  if (existingCustomer !== null) {
      const userKey = `user:${user.phoneNumber}-${Date.now()}`;
      // Create the user data in Redis
      await redisClient.json.set(userKey, '$', user);
  } else {
      throw new Error(`Customer ${customerKey} does not exist`);
  }
};

export { addUser };