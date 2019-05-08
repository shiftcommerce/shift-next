const { SHIFTClient } = require('@shiftcommerce/shift-node-api')

module.exports = {
  getCategory: async (req, res) => {
    const response = await SHIFTClient.getCategoryV1(req.params.id, req.query)

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
