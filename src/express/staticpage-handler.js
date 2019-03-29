const { SHIFTClient } = require('@shiftcommerce/shift-node-api')
const util = require('util')

module.exports = {
  getStaticPage: async (req, res) => {
    const response = await SHIFTClient.getStaticPageV1(req.params.id, req.query)

    console.log('handler parsed', util.inspect(response, { showHidden: false, depth: null }))

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
