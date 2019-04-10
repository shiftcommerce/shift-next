import setCheckout from '../../src/reducers/set-checkout'
import * as actionTypes from '../../src/actions/action-types'

test('correctly updates the address form when an address is selected', () => {
  const action = {
    type: actionTypes.SET_ADDRESS,
    address: {
      // Only testing some attributes for brevity
      first_name: 'John',
      last_name: 'Doe',
      meta_attributes: {
        phone_number: {
          value: '123'
        },
        email: {
          value: 'john@example.com'
        }
      }
    },
    formName: 'billingAddress'
  }

  const currentState = {
    shippingAddress: {
      first_name: '',
      last_name: '',
      primary_phone: '',
      email: ''
    },
    billingAddress: {
      first_name: '',
      last_name: '',
      primary_phone: '',
      email: ''
    }
  }

  const updatedState = setCheckout(currentState, action)

  // Assert billing address gets correctly updated
  expect(updatedState.billingAddress.first_name).toEqual('John')
  expect(updatedState.billingAddress.last_name).toEqual('Doe')
  expect(updatedState.billingAddress.primary_phone).toEqual('123')
  expect(updatedState.billingAddress.email).toEqual('john@example.com')
  // Assert shipping address isn't touched
  expect(updatedState.shippingAddress.first_name).toEqual('')
  expect(updatedState.shippingAddress.last_name).toEqual('')
  expect(updatedState.shippingAddress.primary_phone).toEqual('')
  expect(updatedState.shippingAddress.email).toEqual('')
})

test('correctly populates the address book', () => {
  const action = {
    type: actionTypes.SET_ADDRESS_BOOK,
    payload: {
      data: 'address book data'
    }
  }

  const updatedState = setCheckout({}, action)

  expect(updatedState.addressBook).toBe('address book data')
})

test('correctly marks shipping addresses as not requiring saving after persisting', () => {
  const action = {
    type: actionTypes.SET_ADDRESS_BOOK_ENTRY_SHIPPING,
    payload: {
      id: 10
    }
  }

  const currentState = {
    shippingAddress: {
      saveToAddressBook: true
    },
    billingAddress: {
      saveToAddressBook: true
    }
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.shippingAddress.saveToAddressBook).toBe(false)
  expect(updatedState.shippingAddress.id).toEqual(10)
  expect(updatedState.billingAddress.saveToAddressBook).toBe(true)
})

test('correctly marks billing addresses as not requiring saving after persisting', () => {
  const action = {
    type: actionTypes.SET_ADDRESS_BOOK_ENTRY_BILLING,
    payload: {
      id: 10
    }
  }

  const currentState = {
    shippingAddress: {
      saveToAddressBook: true
    },
    billingAddress: {
      saveToAddressBook: true
    }
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.billingAddress.saveToAddressBook).toBe(false)
  expect(updatedState.billingAddress.id).toEqual(10)
  expect(updatedState.shippingAddress.saveToAddressBook).toBe(true)
})

test('correctly deletes addresses from the store', () => {
  const action = {
    type: actionTypes.DELETE_ADDRESS,
    data: {
      addressId: 10
    }
  }

  const currentState = {
    addressBook: [{ id: 9 }, { id: 10 }, { id: 11 }]
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.addressBook).toEqual([{ id: 9 }, { id: 11 }])
})

test('sets shipping address id when a shipping address is created', () => {
  const action = {
    type: actionTypes.SHIPPING_ADDRESS_CREATED,
    payload: {
      id: 10
    }
  }

  const currentState = {
    shippingAddress: { }
  }

  const updatedState = setCheckout(currentState, action)

  console.log({updatedState})
  expect(updatedState.shippingAddress.id).toEqual(10)
})

test('sets billing address id when a billing address is created', () => {
  const action = {
    type: actionTypes.BILLING_ADDRESS_CREATED,
    payload: {
      id: 10
    }
  }

  const currentState = {
    billingAddress: {}
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.billingAddress.id).toEqual(10)
})

test('populates shipping address when it is autofilled', () => {
  const action = {
    type: actionTypes.AUTOFILL_ADDRESS,
    address: {
      id: 20,
      city: 'Leeds',
      country: 'UK',
      first_name: 'Dave',
      last_name: 'Davis',
      address_line_1: '10 Queen Street',
      address_line_2: 'Top Floor',
      state: 'West Yorkshire',
      postcode: 'LS27EY',
      preferred_shipping: true,
      preferred_billing: false,
      meta_attributes: {
        phone_number: { value: '123' },
        email: { value: 'dave@example.com' }
      }
    }
  }

  const currentState = {
    shippingAddress: {}
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.shippingAddress).toEqual({
    id: 20,
    city: 'Leeds',
    country_code: 'UK',
    email: 'dave@example.com',
    first_name: 'Dave',
    last_name: 'Davis',
    line_1: '10 Queen Street',
    line_2: 'Top Floor',
    primary_phone: '123',
    state: 'West Yorkshire',
    zipcode: 'LS27EY',
    preferred_shipping: true,
    preferred_billing: false,
    selected: true,
    collapsed: true,
    errors: {}
  })
})

test('populates billing address when it is autofilled', () => {
  const action = {
    type: actionTypes.AUTOFILL_BILLING_ADDRESS,
    address: {
      id: 20,
      city: 'Leeds',
      country: 'UK',
      first_name: 'Dave',
      last_name: 'Davis',
      address_line_1: '10 Queen Street',
      address_line_2: 'Top Floor',
      state: 'West Yorkshire',
      postcode: 'LS27EY',
      preferred_shipping: true,
      preferred_billing: false,
      meta_attributes: {
        phone_number: { value: '123' },
        email: { value: 'dave@example.com' }
      }
    }
  }

  const currentState = {
    billingAddress: {}
  }

  const updatedState = setCheckout(currentState, action)

  expect(updatedState.billingAddress).toEqual({
    id: 20,
    city: 'Leeds',
    country_code: 'UK',
    email: 'dave@example.com',
    first_name: 'Dave',
    last_name: 'Davis',
    line_1: '10 Queen Street',
    line_2: 'Top Floor',
    primary_phone: '123',
    state: 'West Yorkshire',
    zipcode: 'LS27EY',
    preferred_shipping: true,
    preferred_billing: false,
    selected: true,
    collapsed: true,
    errors: {}
  })
})

test('sets billing address when a PayPal order is created', () => {
  // Arrange
  const addressPayload = {
    first_name: 'test',
    last_name: 'buyer',
    email: 'testbuyer@flexcommerce.com',
    line_1: '1 Main Terrace',
    line_2: undefined,
    city: 'Wolverhampton',
    state: 'West Midlands',
    zipcode: 'W12 4LQ',
    country_code: 'GB',
    primary_phone: '0352878596',
    collapsed: true,
    completed: true,
    showEditButton: false
  }
  const action = {
    type: actionTypes.SET_CHECKOUT_BILLING_ADDRESS,
    payload: {
      address: addressPayload
    }
  }
  const currentState = {
    billingAddress: {}
  }

  // Act 
  const updatedState = setCheckout(currentState, action)

  // Assert
  expect(updatedState.billingAddress).toEqual(addressPayload)
})

test('sets shipping address when a PayPal order is created', () => {
  // Arrange
  const addressPayload = {
    first_name: 'Test',
    last_name: 'Example',
    email: 'testbuyer@flexcommerce.com',
    line_1: 'Shift Commerce Ltd, Old School Boar',
    line_2: 'Calverley Street',
    city: 'Leeds',
    state: 'N/A',
    zipcode: 'LS1 3ED',
    country_code: 'GB',
    primary_phone: '0352878596',
    collapsed: true,
    completed: true,
    showEditButton: false
  }
  const action = {
    type: actionTypes.SET_CHECKOUT_SHIPPING_ADDRESS,
    payload: {
      address: addressPayload
    }
  }
  const currentState = {
    shippingAddress: {}
  }

  // Act 
  const updatedState = setCheckout(currentState, action)

  // Assert
  expect(updatedState.shippingAddress).toEqual(addressPayload)
})
