// Libraries
const nock = require('nock')

// Address Book Handler
const { getAddressBook, createAddressBookEntry, deleteAddress } = require('../../src/express/addressbook-handler')

// Fixtures
const addressBookResponse = require('../fixtures/addressbook-response')
const addressBookResponseParsed = require('../fixtures/addressbook-response-parsed')
const createAddressBookEntryRequest = require('../fixtures/create-addressbook-request')
const createAddressBookResponseParsed = require('../fixtures/create-addressbook-response-parsed')

afterEach(() => { nock.cleanAll() })

describe('getAddressBook()', () => {
  test('returns an empty response when customerId is not in the session', async () => {
    const req = { session: {} }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    const response = await getAddressBook(req, res)
    expect(response).toEqual({})
  })

  test('returns the data with a customerId', async () => {
    const req = {
      session: {
        customerId: 77
      }
    }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    nock(process.env.API_HOST)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization' })
      .options('/test_tenant/v1/customer_accounts/77/addresses')
      .reply(200)

    nock(process.env.API_HOST)
      .get('/test_tenant/v1/customer_accounts/77/addresses')
      .reply(200, addressBookResponse)

    const response = await getAddressBook(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(response).toEqual(addressBookResponseParsed)
  })
})

describe('createAddressBookEntry()', () => {
  test('returns an empty response when customerId is not in the session', async () => {
    const req = { session: {} }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    const response = await createAddressBookEntry(req, res)
    expect(response).toEqual({})
  })

  test('creates an address book entry with customerId', async () => {
    const req = {
      session: {
        customerId: 77
      }
    }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    nock(process.env.API_HOST)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization' })
      .options('/test_tenant/v1/customer_accounts/77/addresses')
      .reply(200)

    nock(process.env.API_HOST)
      .post('/test_tenant/v1/customer_accounts/77/addresses')
      .reply(201, createAddressBookEntryRequest)

    const response = await createAddressBookEntry(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(response).toEqual(createAddressBookResponseParsed)
  })
})

describe('deleteAddress()', () => {
  test('returns an empty response when customerId is not in the session', async () => {
    const req = {
      session: {},
      params: {
        addressId: '469'
      }
    }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    const response = await deleteAddress(req, res)
    expect(response).toEqual({})
  })

  test('deletes an address with customerId and addressId', async () => {
    const req = {
      session: {
        customerId: 77
      },
      params: {
        addressId: '469'
      }
    }

    const res = {
      status: jest.fn(x => ({
        send: jest.fn(y => y)
      }))
    }

    nock(process.env.API_HOST)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Authorization' })
      .options('/test_tenant/v1/customer_accounts/77/addresses/469')
      .reply(200)

    nock(process.env.API_HOST)
      .delete('/test_tenant/v1/customer_accounts/77/addresses/469')
      .reply(204)

    const response = await deleteAddress(req, res)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(response).toEqual('')
  })
})
