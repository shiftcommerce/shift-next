import {
  saveToAddressBook,
  fetchAddressBook,
  deleteAddressBookEntry,
  setAddress
} from '../../src/actions/address-book-actions'

import * as types from '../../src/actions/action-types'

// Dependencies to be mocked out
import * as apiActions from '../../src/actions/api-actions'

test('saveToAddressBook posts correct body to correct URL', () => {
  apiActions.postEndpoint = jest.fn()

  const address = {
    country_code: 'GB',
    first_name: 'John',
    last_name: 'Doe',
    companyName: 'Doe Ltd',
    line_1: '1 Lime Street',
    line_2: 'Top floor',
    zipcode: 'LS27EY',
    city: 'Leeds',
    state: 'West Yorkshire',
    primary_phone: '07510123456',
    email: 'john@example.com',
    label: 'Home'
  }

  saveToAddressBook(address)

  expect(apiActions.postEndpoint).toHaveBeenCalledTimes(1)
  const request = apiActions.postEndpoint.mock.calls[0][0]
  expect(request.endpoint).toBe('/createAddressBookEntry')
  expect(request.body).toEqual({
    data: {
      type: 'addresses',
      attributes: {
        first_name: 'John',
        last_name: 'Doe',
        address_line_1: '1 Lime Street',
        address_line_2: 'Top floor',
        city: 'Leeds',
        state: 'West Yorkshire',
        country: 'GB',
        postcode: 'LS27EY',
        meta_attributes: {
          label: {
            value: 'Home'
          },
          company_name: {
            value: 'Doe Ltd'
          },
          phone_number: {
            value: '07510123456'
          },
          email: {
            value: 'john@example.com'
          }
        }
      }
    }
  })
})

describe('saveToAddressBook()', () => {
  test('saves a shipping address by default', () => {
    apiActions.postEndpoint = jest.fn()
    saveToAddressBook({})
    const request = apiActions.postEndpoint.mock.calls[0][0]
    expect(request.successActionType).toEqual(types.SET_ADDRESS_BOOK_ENTRY_SHIPPING)
  })

  test('saves a billing address when an option is given', () => {
    apiActions.postEndpoint = jest.fn()
    saveToAddressBook({}, { billing: true })
    const request = apiActions.postEndpoint.mock.calls[0][0]
    expect(request.successActionType).toEqual(types.SET_ADDRESS_BOOK_ENTRY_BILLING)
  })
})

test('fetchAddressBook sends a correct get request', () => {
  apiActions.readEndpoint = jest.fn()

  fetchAddressBook()

  expect(apiActions.readEndpoint).toHaveBeenCalledTimes(1)
  const request = apiActions.readEndpoint.mock.calls[0][0]
  expect(request.endpoint).toBe('/getAddressBook')
})

test('deleteAddressBookEntry sends a correct delete request', () => {
  apiActions.deleteEndpoint = jest.fn()

  const address = { id: 10 }

  deleteAddressBookEntry(address)

  expect(apiActions.deleteEndpoint).toHaveBeenCalledTimes(1)
  const request = apiActions.deleteEndpoint.mock.calls[0][0]
  expect(request.endpoint).toBe('/deleteAddress/10')
  expect(request.requestActionData).toEqual({ addressId: 10 })
})

test('setAddress returns a correct action', () => {
  const address = { id: 99 }
  const formName = 'shippingAddress'

  const action = setAddress(address, formName)

  expect(action.type).toEqual(types.SET_ADDRESS)
  expect(action.address).toEqual(address)
  expect(action.formName).toEqual(formName)
})
