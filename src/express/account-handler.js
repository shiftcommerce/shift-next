// Shift-api client
const { SHIFTClient } = require('shift-api')

// Lib
const { getSessionExpiryTime } = require('../lib/session')

module.exports = {
  getAccount: async (req, res) => {
    const { customerId } = req.session

    if (!customerId) {
      return res.status(200).send({})
    }

    const params = {
      fields: {
        customer_accounts: 'email,meta_attributes'
      },
      // There are some default includes in the platform that we need this to ignore.
      include: ''
    }

    const response = await SHIFTClient.getAccountV1(params, customerId)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      default:
        return res.status(response.status).send(response.data)
    }
  },

  loginAccount: async (req, res) => {
    try {
      const response = await SHIFTClient.loginCustomerAccountV1(req.body)

      if (response.status === 201) {
        extractCustomerId(req, response.data.data)
        await assignCartToUser(req, res)
      }

      return res.status(response.status).send(response.data)
    } catch (error) {
      const response = error.response
      switch (response.status) {
        case 404:
        case 422:
          return res.status(response.status).send(response.data.errors)
        default:
          return res.status(response.status).send(response.data)
      }
    }
  },

  registerAccount: async (req, res) => {
    const response = await SHIFTClient.createCustomerAccountV1(req.body)

    switch (response.status) {
      case 404:
        return res.status(200).send({})
      case 422:
        return res.status(response.status).send(response.data.errors)
      case 201:
        extractCustomerId(req, response.data.data)
        await assignCartToUser(req, res)
        return res.status(201).send(response.data)
      default:
        return res.status(response.status).send(response.data)
    }
  },

  getCustomerOrders: async (req, res) => {
    const query = {
      filter: {
        account_reference: process.env.API_TENANT,
        customer_reference: req.session.customerId
      },
      fields: {
        customer_orders: 'account_reference,reference,placed_at,line_items,pricing,shipping_methods,shipping_addresses,discounts',
        line_items: 'quantity,sku,pricing,shipping_method,shipping_address,discounts',
        shipping_methods: 'label,price',
        shipping_addresses: 'name,company,lines,city,state,postcode,country',
        discounts: 'label,amount_inc_tax,coupon_code'
      },
      include: 'customer,shipping_methods,shipping_addresses,discounts,line_items,line_items.shipping_method,line_items.shipping_address,line_items.discounts'
    }

    const response = await SHIFTClient.getCustomerOrdersV1(query)

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

function extractCustomerId (req, data) {
  if (data.type === 'customer_accounts') {
    req.session.customerId = data.id
  } else if (data.type === 'customer_account_authentications') {
    req.session.customerId = data.relationships.customer_account.data.id
  }
}

async function assignCartToUser (req, res) {
  if (!req.session.customerId) return
  const cartId = req.signedCookies.cart

  if (cartId) {
    await SHIFTClient.assignCartToCustomerV1(cartId, req.session.customerId)
  } else {
    const customerAccountResponse = await SHIFTClient.getAccountV1({}, req.session.customerId)

    res.cookie('cart', customerAccountResponse.data.included.find(i => i.type === 'carts').id, {
      signed: true,
      expires: getSessionExpiryTime()
    })
  }
}
