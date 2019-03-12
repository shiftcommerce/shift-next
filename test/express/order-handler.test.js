// Libraries
const nock = require('nock')

// Order handler
const { createOrder } = require('../../src/express/order-handler')

// Fixtures
const createOrderResponse = require('../fixtures/create-order-response')

afterEach(() => { nock.cleanAll() })

describe('createOrder()', () => {
  describe('with valid data', () => {
    test('should create an order with valid data and clear the cart cookie', async () => {
      const body = {
        data: {
          type: 'create_order',
          attributes: {
            billing_address: {},
            channel: 'web',
            currency: 'GBP',
            email: 'guest@order.com',
            ip_address: '1.1.1.1',
            line_items_resources: [],
            shipping_address: {},
            shipping_method: {},
            discount_summaries: [],
            sub_total: 19.45,
            total: 19.45,
            placed_at: '2018-10-31T14:37:34.113Z',
            payment_transactions_resources: []
          }
        }
      }

      const req = {
        body: body
      }

      const res = {
        status: jest.fn(x => ({
          send: jest.fn(y => y)
        })),
        clearCookie: jest.fn()
      }

      // because axios.defaults.adapter = httpAdapter isnt working we are having to nock the options request that axios makes
      nock(process.env.API_HOST)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization' })
        .options('/test_tenant/v2/create_order?include=line_items')
        .reply(200)

      nock(process.env.API_HOST)
        .post(`/${process.env.API_TENANT}/v2/create_order`)
        .query(true)
        .reply(201, createOrderResponse)

      const response = await createOrder(req, res)

      expect(response.email).toBe('guest@order.com')
      expect(response.ip_address).toBe('1.1.1.1')

      expect(res.clearCookie).toHaveBeenCalled()
    })
  })

  describe('with invalid data', () => {
    test('should return an error', async () => {
      const body = {
        data: {}
      }

      const req = {
        body: body
      }

      const res = {
        status: jest.fn(x => ({
          send: jest.fn(y => y)
        }))
      }

      // because axios.defaults.adapter = httpAdapter isnt working we are having to nock the options request that axios makes
      nock(process.env.API_HOST)
        .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization' })
        .options('/test_tenant/v2/create_order?include=line_items')
        .reply(200)

      nock(process.env.API_HOST)
        .post(`/${process.env.API_TENANT}/v2/create_order`)
        .query(true)
        .reply(422, {
          errors: [
            {
              title: 'Invalid payload',
              detail: 'Invalid payload',
              status: '422'
            }
          ]
        })

      expect.assertions(3)

      try {
        await createOrder(req, res)
      } catch (error) {
        expect(error.response.status).toBe(422)
        expect(error.response.data.errors[0].status).toBe('422')
        expect(error.response.data.errors[0].detail).toBe('Invalid payload')
      }
    })
  })
})
