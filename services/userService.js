export const addUser = async ({ redisClient, user }) => {
  console.log(user);
  const customerKey = `customer:${user.phoneNumber}`;
  const existingCustomer = await redisClient.json.get(customerKey);
  if (!existingCustomer) {
      // Create the user data in Redis
      await redisClient.json.set(customerKey, '$', user);
      return user;
  } else {
      throw new Error(`Customer ${customerKey} exist`);
  }
};

export const getUser = async ({ redisClient, phoneNumber } ) => {
  const customerKey = `customer:${phoneNumber}`
  console.log(phoneNumber)
  const existingCustomer = await redisClient.json.get(customerKey);
  console.log(existingCustomer);
  return existingCustomer;
}