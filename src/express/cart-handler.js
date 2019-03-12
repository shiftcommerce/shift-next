const { SHIFTClient } = require('shift-api')
const { getSessionExpiryTime } = require('../lib/session')

module.exports = {
  getCart: async (req, res) => {
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.getCartV1(cartId)

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
    const lineItemId = req.params.lineItemId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.deleteLineItemV1(lineItemId, cartId)

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
    const newQuantity = req.body.newQuantity
    const lineItemId = req.body.lineItemId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.updateLineItemV1(newQuantity, cartId, lineItemId)

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
    const addressId = req.body.addressId
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.setCartBillingAddressV1(addressId, cartId)

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
    const addressId = req.body.addressId
    const cartId = req.signedCookies.cart
    const response = await SHIFTClient.setCartShippingAddressV1(addressId, cartId)

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
    const shippingMethodId = req.body.shippingMethodId
    const cartId = req.signedCookies.cart

    const response = await SHIFTClient.setCartShippingMethodV1(cartId, shippingMethodId)

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
