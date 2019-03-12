const axios = require('axios')
const nock = require('nock')
const httpAdapter = require('axios/lib/adapters/http')

const { fetchData } = require('../../src/lib/api-server')

axios.defaults.adapter = httpAdapter

nock.disableNetConnect()

afterEach(() => { nock.cleanAll() })

test('fetchDataRequest returns correct data', async () => {
  const queryObject = { key: 'value' }

  const url = 'some/endpoint'

  const mockedResponse = {
    id: 10,
    attributes: {
      color: 'teal',
      material: 'wood'
    }
  }

  nock(process.env.API_HOST)
    .get(`/${url}`)
    .query(true)
    .reply(200, mockedResponse)

  const response = await fetchData(queryObject, url)

  expect(response.status).toBe(200)
  expect(response.data).toEqual(mockedResponse)
})
