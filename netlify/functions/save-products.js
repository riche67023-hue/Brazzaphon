const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const filePath = path.join('/tmp', 'products.json');

  try {
    if (event.httpMethod === 'GET') {
      let data = '[]';
      try {
        data = fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        // Si le fichier n'existe pas encore en /tmp, on lit la version du dépôt
        data = fs.readFileSync(path.join(__dirname, '../../products.json'), 'utf8');
      }
      return { statusCode: 200, headers, body: data };
    }

    if (event.httpMethod === 'POST') {
      const products = event.body;
      fs.writeFileSync(filePath, products);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
