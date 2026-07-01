const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const store = getStore("brazzaphone");

  try {
    if (event.httpMethod === "GET") {
      let data;
      try {
        data = await store.get("products");
      } catch (e) {
        data = null;
      }
      return {
        statusCode: 200,
        headers,
        body: data || "[]"
      };
    }

    if (event.httpMethod === "POST") {
      await store.set("products", event.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
