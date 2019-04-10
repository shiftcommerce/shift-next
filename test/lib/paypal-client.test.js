// Libraries
import nock from 'nock'
import { PayPalClient } from '../../src/lib/paypal-client'

// Fixtures
const payPalOauthResponse = require('../fixtures/paypal-oauth-response')
const payPalInvalidOrderUpdateResponse = require('../fixtures/paypal-invalid-order-update-response')
const payPalAuthorizeOrderResponse = require('../fixtures/paypal-order-authorization-response')
const payPalInvalidOrderAuthorizationResponse = require('../fixtures/paypal-invalid-order-authorization-response')

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

// silence console logs
console.log = () => {}

test('buildPatchOrderPayload returns correct patch payload', async () => {
  // Arrange
  const purchaseUnitsReferenceID = 'default'
  const cart = {
    total: 18.50
  }
  const expectedPayload = [
    {
      'op': 'replace',
      'path': `/purchase_units/@reference_id=='default'/amount`,
      'value': {
        'currency_code': 'GBP',
        'value': "18.5"
      }
    }
  ]

  // Act
  const bodyPayload = PayPalClient.buildPatchOrderPayload(purchaseUnitsReferenceID, cart) 

  // Assert
  expect(bodyPayload).toEqual(expectedPayload)
})

describe('patchOrder()', () => {
  test('patchOrder returns correct response status and data when successful', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const purchaseUnitsReferenceID = 'default'
    const cart = {
      total: 18.50
    }

    // Mock out requests
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, payPalOauthResponse)

    nockScope
      .intercept(`/v2/checkout/orders/${payPalOrderID}?`, 'PATCH')
      .reply(204, {})

    // Act
    const response = await PayPalClient.patchOrder(payPalOrderID, purchaseUnitsReferenceID, cart)

    // Assert
    expect(response.status).toBe(204)
    expect(response.data).toEqual({})
  })

  test('returns an error response when order is updated with an invalid total', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const purchaseUnitsReferenceID = 'default'
    const cartWithInvalidTotal = {
      total: ''
    }

    // Mock out requests
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, payPalOauthResponse)

    nockScope
      .intercept(`/v2/checkout/orders/${payPalOrderID}?`, 'PATCH')
      .reply(400, payPalInvalidOrderUpdateResponse)
    
    // Act
    const error_response= await PayPalClient.patchOrder(payPalOrderID, purchaseUnitsReferenceID, cartWithInvalidTotal)
  
    // Assert
    expect(error_response.status).toBe(400)
    expect(JSON.parse(error_response.data)).toEqual(payPalInvalidOrderUpdateResponse)
  })
})

describe('authorizeOrder()', () => {
  test('returns correct response status and data when successful', async () => {
    // Arrange
    const payPalOrderID = '5C91751271779461V'
    const expectedPayload = {
      id: '0557749097767711F',
      status: 'CREATED',
      expirationTime: '2019-04-24T20:47:07Z'
    }
    // Mock out requests
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, payPalOauthResponse)

    nockScope
      .post(`/v2/checkout/orders/${payPalOrderID}/authorize?`, {})
      .reply(201, payPalAuthorizeOrderResponse)

    // Act
    const response = await PayPalClient.authorizeOrder(payPalOrderID)

    // Assert
    expect(response.status).toBe(201)
    expect(response.data).toEqual(expectedPayload)
  })

  test('returns an error response when order is authorized with an invalid order ID', async () => {
    // Arrange
    const payPalOrderID = 'INVALID'

    // Mock out requests
    nockScope
      .post('/v1/oauth2/token')
      .reply(200, payPalOauthResponse)

    nockScope
      .post(`/v2/checkout/orders/${payPalOrderID}/authorize?`, {})
      .reply(422, payPalInvalidOrderAuthorizationResponse)

    // Act
    const error_response = await PayPalClient.authorizeOrder(payPalOrderID)
  
    // Assert
    expect(error_response.status).toBe(422)
    expect(JSON.parse(error_response.data)).toEqual(payPalInvalidOrderAuthorizationResponse)
  })
})
