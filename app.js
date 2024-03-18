const express = require('express');
const app = express();

app.use(express.json());

exports.handler = async (event) => {
  const { httpMethod, body } = event;

  if (httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'GET request received' })
    };
  } else if (httpMethod === 'POST') {
    // Aquí puedes manejar la lógica de tu aplicación Express.js para las solicitudes POST
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'POST request received', requestBody: body })
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }
};

// Esto no será ejecutado cuando la función Lambda se invoque, solo necesitas exportar 'handler'
// pero puedes mantener el resto de tu aplicación Express.js para pruebas locales, por ejemplo
app.listen(3000, () => console.log('Express server listening on port 3000'));