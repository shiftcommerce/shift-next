const { SHIFTClient } = require('@shiftcommerce/shift-node-api')
const { setSurrogateHeaders } = require('../lib/set-cache-headers')

module.exports = {
  getProductById: async (req, res) => {
    const response = await SHIFTClient.getProductV1(req.params.id, req.query)

    // copy over any CDN cache key response headers from the platform request
    Object.keys(response.headers)
      .filter(name => name.toLowerCase().indexOf('surrogate') === 0)
      .forEach(key => {
        res.set(key, response.headers[key])
      })

    setSurrog(response.headers, res)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  }
}
