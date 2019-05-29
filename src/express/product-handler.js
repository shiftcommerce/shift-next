const { SHIFTClient } = require('@shiftcommerce/shift-node-api')
const { setSurrogateHeaders } = require('../lib/set-cache-headers')

const productApiEndpointQuery = {
  fields: {
    asset_files: 'id,image_height,image_width,s3_url',
    variants: 'id,meta_attributes,title,description,reference,ewis_eligible,product_id,sku,stock_allocated_level,stock_level,tax_code,stock_available_level,has_assets,price_includes_taxes,available_to_order,price,current_price,picture_url'
  },
  include: 'asset_files,variants,template,meta.*'
}

module.exports = {
  getProductById: async (req, res) => {
    req.query = { ...req.query, ...productApiEndpointQuery }
    const response = await SHIFTClient.getProductV1(req.params.id, req.query)

    setSurrogateHeaders(response.headers, res)

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
