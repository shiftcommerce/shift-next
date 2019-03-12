const axios = require('axios')
const qs = require('qs')

// libs
const { setCacheHeaders } = require('./set-cache-headers')

const auth = {
  username: process.env.API_TENANT,
  password: process.env.API_ACCESS_TOKEN
}

const headers = {
  'Content-Type': 'application/vnd.api+json',
  'Accept': 'application/vnd.api+json'
}

const fetchData = async (queryObject, url) => {
  const query = qs.stringify(queryObject)

  try {
    const response = await axios.get(`${process.env.API_HOST}/${url}?${query}`, {
      auth: auth,
      headers: headers
    })

    setCacheHeaders(response)
    return response
  } catch (error) {
    console.error(error)
    return error.response
  }
}

module.exports = { fetchData }
