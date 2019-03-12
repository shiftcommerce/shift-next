import nock from 'nock'
import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'

import ApiClient from '../../src//lib/api-client'
import payload from '../fixtures/products-payload'
import Config from '../../src/lib/config'

axios.defaults.adapter = httpAdapter

beforeEach(() => {
  Config.set({
    apiHostProxy: 'http://example.com'
  })
})

afterEach(() => { nock.cleanAll() })

const nockScope = nock('http://example.com')

test('read returns correct response status and data when successful', async () => {
  // Prepare the request query object
  const queryObject = {
    fields: {
      include: 'asset_files,variants,bundles,template,meta.*'
    }
  }

  // Initialize the client
  const client = new ApiClient()

  // Mock out a successful get request
  nockScope
    .get('/products')
    .query(queryObject)
    .reply(200, payload)

  // Make the request
  const response = await client.read('/products', queryObject)

  // Assert response comes back as expected
  expect(response.status).toBe(200)
  expect(response.data).toEqual(payload)
})

test('post returns correct response status and data when successful', async () => {
  // Prepare the request query object
  const body = {
    key: 'value'
  }

  // Initialize the client
  const client = new ApiClient()

  // Mock out a successful get request
  nockScope
    .post('/postEndpoint', body)
    .reply(201, payload)

  // Make the request
  const response = await client.post('/postEndpoint', body)

  // Assert response comes back as expected
  expect(response.status).toBe(201)
  expect(response.data).toEqual(payload)
})

test('delete returns correct response status and data when successful', async () => {
  // Initialize the client
  const client = new ApiClient()

  // Mock out a successful delete request
  nockScope
    .delete('/deleteEndpoint')
    .reply(204, { key: 'value' })

  // Make the request
  const response = await client.delete('/deleteEndpoint')

  // Assert response comes back as expected
  expect(response.status).toEqual(204)
  expect(response.data).toEqual({ key: 'value' })
})

test('delete returns correct response and status and logs when request fails', async () => {
  // Mock out the error logger and silence it
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

  // Initialize the client
  const client = new ApiClient()

  // Mock out a failing delete request
  nockScope
    .delete('/deleteEndpoint')
    .reply(503, { error: 'not enough pandas' })

  // Make the request
  const response = await client.delete('/deleteEndpoint')

  // Assert response comes back as expected
  expect(response.status).toEqual(503)
  expect(response.data).toEqual({ error: 'not enough pandas' })

  // Assert an error has been logged
  expect(spy).toHaveBeenCalledTimes(1)

  // Clean up after mocking out the error logger
  spy.mockRestore()
})
