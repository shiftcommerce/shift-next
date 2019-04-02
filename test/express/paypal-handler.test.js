// Libraries
const nock = require('nock')

// PayPal handler
const { patchOrder, authorizeOrder } = require('../../src/express/paypal-handler')

// Fixtures
const PayPalOauthResponse = require('../fixtures/paypal-oauth-response')
const PayPalInvalidOrderUpdateResponse = require('../fixtures/paypal-invalid-order-update-response')
const AuthorizeOrderResponse = require('../fixtures/paypal-order-authorization-response')
const PayPalInvalidOrderAuthorizationResponse = require('../fixtures/paypal-invalid-order-authorization-response')

beforeEach(() => {
  process.env.PAYPAL_CLIENT_ID = 'test'
  process.env.PAYPAL_CLIENT_SECRET = 'secret'
  process.env.ENABLE_PAYPAL_LIVE_ENVIRONMENT = false
})

nock.disableNetConnect()

afterEach(() => {
  delete process.env.PAYPAL_CLIENT_ID
  delete process.env.PAYPAL_CLIENT_SECRET
  delete process.env.ENABLE_PAYPAL_LIVE_ENVIRONMENT
  jest.resetAllMocks()
  nock.cleanAll()
})

const nockScope = nock('https://api.sandbox.paypal.com')

describe('patchOrder()', () => {
  test('returns correct response when order is successfully updated', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const purchaseUnitsReferenceID = 'default'
    const cart = {
      total: 20
    }
    const req = { 
      body: {
        cart: cart,
        payPalOrderID: payPalOrderID,
        purchaseUnitsReferenceID: purchaseUnitsReferenceID
      }
    }
    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    // Mock out a successful post request
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, PayPalOauthResponse)

    nockScope
      .intercept(`/v2/checkout/orders/${payPalOrderID}?`, 'PATCH')
      .reply(204, {})
    
    // Act
    const response = await patchOrder(req, res)

    // Assert
    expect(response).toEqual({})
  })

  test('returns error response when order is updated with an invalid total', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const purchaseUnitsReferenceID = 'default'
    const cartWithInvalidTotal = {
      total: ''
    }
    const req = { 
      body: {
        cart: cartWithInvalidTotal,
        payPalOrderID: payPalOrderID,
        purchaseUnitsReferenceID: purchaseUnitsReferenceID
      }
    }
    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    // Mock out a successful post request
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, PayPalOauthResponse)

    nockScope
      .intercept(`/v2/checkout/orders/${payPalOrderID}?`, 'PATCH')
      .reply(400, PayPalInvalidOrderUpdateResponse)
    
    // Act
    const error_response = await patchOrder(req, res)
  
    // Assert
    expect(JSON.parse(error_response)).toEqual(PayPalInvalidOrderUpdateResponse)
  })
})

describe('authorizeOrder()', () => {
  test('returns correct response when order is authorized', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const req = { 
      body: {
        payPalOrderID: payPalOrderID
      }
    }
    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    const expectedAuthorizationDetails = AuthorizeOrderResponse.purchase_units[0].payments.authorizations[0]

    // Mock out a successful post request
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, PayPalOauthResponse)

    nockScope
      .post(`/v2/checkout/orders/${payPalOrderID}/authorize?`, {})
      .reply(201, AuthorizeOrderResponse)

    // Act
    const response = await authorizeOrder(req, res)

    // Assert
    expect(response).toEqual({
      id: expectedAuthorizationDetails.id,
      status: expectedAuthorizationDetails.status,
      expirationTime: expectedAuthorizationDetails.expiration_time
    })
  })

  test('returns error response when order is authorized with an invalid order ID', async () => {
    // Arrange
    const payPalOrderID = 'INVALID'
    const req = { 
      body: {
        payPalOrderID: payPalOrderID
      }
    }
    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    // Mock out a successful post request
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, PayPalOauthResponse)

    nockScope
      .post(`/v2/checkout/orders/${payPalOrderID}/authorize?`, {})
      .reply(422, PayPalInvalidOrderAuthorizationResponse)

    // Act
    const error_response = await authorizeOrder(req, res)
  
    // Assert
    expect(JSON.parse(error_response)).toEqual(PayPalInvalidOrderAuthorizationResponse)
  })
})
