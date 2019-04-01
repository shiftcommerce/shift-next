// Libraries
import nock from 'nock'
import PayPalClient from '../../src//lib/paypal-client'
import Config from '../../src/lib/config'

// Fixtures
import payPalAuthorizationResponse from '../fixtures/paypal-order-authorization-response'
import payPalUpdateOrderResponse from '../fixtures/paypal-update-order-response'

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

const cart = {
  total: 18.50
}
const payPalOrderID = '5C91751271779461V'
const purchaseUnitsReferenceID = 'default'

test('authorizeOrder returns correct response status and data when successful', async () => {
  // Arrange
  const expectedPayload = {
    id: '0557749097767711F',
    status: 'CREATED',
    expirationTime: '2019-04-24T20:47:07Z'
  }

  // Mock out a successful get request
  nockScope
    .post(`/v2/checkout/orders/${payPalOrderID}/authorize`, {})
    .reply(200, payPalAuthorizationResponse)

  // Act
  const response = await PayPalClient.authorizeOrder(payPalOrderID)

  // Assert
  expect(response.status).toBe(201)
  expect(response.data).toEqual(expectedPayload)
})

test('patchOrder returns correct response status and data when successful', async () => {
  // Arrange
  const bodyPayload = PayPalClient.buildPatchOrderPayload(purchaseUnitsReferenceID, cart) 

  // Mock out a successful get request
  nockScope
    .post(`/v2/checkout/orders/${payPalOrderID}`, bodyPayload)
    .reply(200, payPalUpdateOrderResponse)

  // Act
  const response = await PayPalClient.patchOrder(payPalOrderID, purchaseUnitsReferenceID, cart)

  // Assert
  expect(response.status).toBe(200)
  expect(response.data).toEqual(payPalUpdateOrderResponse)
})

test('buildPatchOrderPayload returns correct patch payload', async () => {
  // Arrange
  const expectedPayload = [
    {
      'op': 'replace',
      'path': '/intent',
      'value': 'AUTHORIZE'
    },
    {
      'op': 'replace',
      'path': `/purchase_units/@reference_id=='default'/amount`,
      'value': {
        'currency_code': 'GBP',
        'value': 18.50
      }
    }
  ]

  // Act
  const bodyPayload = PayPalClient.buildPatchOrderPayload(purchaseUnitsReferenceID, cart) 

  // Assert
  expect(bodyPayload).toEqual(expectedPayload)
})
