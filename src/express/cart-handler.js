const { SHIFTClient } = require('@shiftcommerce/shift-node-api')
const { getSessionExpiryTime } = require('../lib/session')

const cartApiEndpointQuery = {
  fields: {
    line_items: 'line_item_discounts,sku,stock_available_level,sub_total,tax_rate,title,total,total_discount,item,unit_price,unit_quantity',
    variants: 'title,sku,price,price_includes_taxes,picture_url,stock_allocated_level,meta_attributes,product',
    products: 'title,sku,slug,canonical_path,picture_url,meta_attributes',
    line_item_discounts: 'line_item_number,promotion_id,total',
    discount_summaries: 'name,promotion_id,total',
    customer_account: 'email,meta_attributes,reference',
    addresses: 'address_line_1,address_line_2,city,country,first_name,last_name,meta_attributes,postcode,preferred_billing,preferred_shipping,state',
    shipping_method: 'description,label,meta_attributes,reference,sku,sub_total,tax,tax_rate,total'
  },
  include: 'line_items.item.product,line_items.line_item_discounts,discount_summaries,customer_account,billing_address,shipping_address,shipping_method'
}

module.exports = {
  getCart: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.getCartV1(cartId, req.query)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  addToCart: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const cartId = req.signedCookies.cart

    let response

    if (cartId) {
      response = await SHIFTClient.addLineItemToCartV1(req, res, cartId)
    } else {
      response = await SHIFTClient.createNewCartWithLineItemV1(req, res)

      if (response.data.id) {
        res.cookie('cart', response.data.id, {
          signed: true,
          expires: getSessionExpiryTime()
        })
      }
    }

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  deleteLineItem: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const lineItemId = req.params.lineItemId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.deleteLineItemV1(lineItemId, cartId, req.query)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  updateLineItem: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const newQuantity = req.body.newQuantity
    const lineItemId = req.body.lineItemId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.updateLineItemV1(newQuantity, cartId, lineItemId, req.query)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  addCartCoupon: async (req, res) => {
    const couponCode = req.body.couponCode

    const cartId = req.signedCookies.cart

    let response

    try {
      response = await SHIFTClient.addCartCouponV1(couponCode, cartId)
    } catch (error) {
      response = {
        status: error.response.status,
        data: error.response.data
      }
    }

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  createAddress: async (req, res) => {
    const response = await SHIFTClient.createCustomerAddressV1(req)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  getShippingMethods: async (req, res) => {
    const response = await SHIFTClient.getShippingMethodsV1()

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  setCartBillingAddress: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const addressId = req.body.addressId
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.setCartBillingAddressV1(addressId, cartId, req.query)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  setCartShippingAddress: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const addressId = req.body.addressId
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.setCartShippingAddressV1(addressId, cartId, req.query)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },
  setCartShippingMethod: async (req, res) => {
    req.query = { ...req.query, ...cartApiEndpointQuery }
    const shippingMethodId = req.body.shippingMethodId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.setCartShippingMethodV1(cartId, shippingMethodId, req.query)

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
