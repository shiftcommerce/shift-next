// Libraries
const nock = require('nock')

// Account handler
const { patchOrder, authorizeOrder } = require('../../src/express/paypal-handler')

// Fixtures
const PatchOrderResponse = require('../fixtures/paypal-create-order-response')
const AuthorizeOrderResponse = require('../fixtures/paypal-order-authorization-response')

jest.doMock('@paypal/checkout-server-sdk')

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

const nockScope = nock('https://api.sandbox.paypal.com/')

describe('patchOrder()', () => {
  test('returns correct response when order is updated', async () => {
    // Arrange
    const payPalOrderID = '95689969696'
    const req = { 
      body: {
        cart: {
          sub_total: 18,
          total: 20,
          total_discount: 0,
          tax: 1,
          shipping_total: 1,
          shipping_total_discount: 0,
          free_shipping: false
        },
        payPalOrderID: payPalOrderID,
        purchaseUnitsReferenceID: 'default'
      }
    }
    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    // Mock out a successful post request
    nockScope
      .post(`/v2/checkout/orders/${payPalOrderID}`, bodyPayload)
      .reply(201, PatchOrderResponse)
    
    // Act
    const response = await patchOrder(req, res)

    // Assert
    expect(response).toEqual({
      status: 201,
      data: {
        id: PatchOrderResponse.id,
        status: PatchOrderResponse.status,
        expirationTime: PatchOrderResponse.expiration_time
      }
    })
  })
})

describe('authorizeOrder()', () => {
  test('returns correct response when order is authorized', async () => {
    // Arrange
    const payPalOrderID = '95689969696'
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
      .post(`/v2/checkout/orders/${payPalOrderID}/authorize`, {})
      .reply(200, AuthorizeOrderResponse)

    // Act
    const response = await authorizeOrder(req, res)

    // Assert
    expect(response).toEqual({
      status: 200,
      data: AuthorizeOrderResponse
    })
  })
})
