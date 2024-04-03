import { addUser } from "../lambda-services/userService";

export const userPostHandler = async (event) => {
  const body = JSON.parse(event.body);
  const redisClient = event.redisClient;
  
  const user = {
    firstName: body.firstName,
    lastName: body.lastName,
    phoneNumber: body.phoneNumber
  }

  try {
    const response = await addUser({redisClient, user});
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'The user has been created.', event, response, context })
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'The user could not be created.', err })
    };
  }
}