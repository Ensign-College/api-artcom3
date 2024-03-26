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

export const getUsers = async ({ redisClient }) => {
   let cursor = 0;
  const users = [];

  do {
    const result = await redisClient.scan(cursor, {MATCH: 'customer*', COUNT: 100});
    cursor = result.cursor;
    let keys = result.keys;

    for (const key of keys) {
      const user = await redisClient.json.get(key);
      users.push(user);
    }

    console.log(result)
    console.log(users)
  } while (cursor !== 0);

  return users;
}

export const getUser = async ({ redisClient, phoneNumber } ) => {
  const customerKey = `customer:${phoneNumber}`
  console.log(phoneNumber)
  const existingCustomer = await redisClient.json.get(customerKey);
  console.log(existingCustomer);
  return existingCustomer;
}