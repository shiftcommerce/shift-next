// actionTypes
import * as types from '../actions/action-types'

const addressFormFields = {
  country_code: '',
  line_1: '',
  line_2: '',
  address2Shown: '',
  zipcode: '',
  city: '',
  state: '',
  companyName: '',
  companyNameShown: ''
}

const formFields = {
  first_name: '',
  last_name: '',
  primary_phone: '',
  email: '',
  newsletterOptIn: false,
  saveToAddressBook: false,
  preferred_billing: false,
  preferred_shipping: false,
  label: '',
  collapsed: false,
  completed: false,
  selected: false,
  errors: {},
  ...addressFormFields
}

const checkoutInitialState = {
  error: false,
  shippingAddress: {
    ...formFields
  },
  shippingMethod: {
    completed: false
  },
  billingAddress: {
    ...formFields
  },
  shippingAddressAsBillingAddress: true,
  reviewOrder: {
    completed: false
  },
  currentStep: 1,
  addressBook: []
}

export default function setCheckout (state = checkoutInitialState, action) {
  let newState = Object.assign({}, state)

  switch (action.type) {
    case types.SET_CHECKOUT_INPUT_VALUE:
      newState[action.payload.formName][action.payload.fieldName] = action.payload.fieldValue
      newState.billingAddress[action.payload.fieldName] = action.payload.fieldValue
      newState.updatedAt = new Date()
      return newState

    case types.SET_CHECKOUT_INPUT_VALIDATION_MESSAGE:
      let errors = Object.assign({}, newState[action.payload.formName]['errors'], { [action.payload.fieldName]: action.payload.validationMessage })
      Object.assign(newState[action.payload.formName], { errors: errors })
      newState.updatedAt = new Date()
      return newState

    case types.SET_CHECKOUT_INPUT_SHOWN:
      newState[action.payload.formName][action.payload.fieldName] = true
      newState.updatedAt = new Date()
      return newState

    // For storing checkout loaded from indexedDB
    case types.STORE_CHECKOUT:
      newState = action.checkout
      return newState

    case types.SET_ADDRESS:
      const chosenAddress = action.address
      const meta = chosenAddress.meta_attributes
      const companyName = meta.company_name && meta.company_name.value

      newState[action.formName] = {
        id: chosenAddress.id,
        country_code: chosenAddress.country,
        first_name: chosenAddress.first_name,
        last_name: chosenAddress.last_name,
        companyName: companyName,
        companyNameShown: !!companyName,
        line_1: chosenAddress.address_line_1,
        line_2: chosenAddress.address_line_2,
        address2Shown: !!chosenAddress.address_line_2,
        zipcode: chosenAddress.postcode,
        city: chosenAddress.city,
        state: chosenAddress.state,
        primary_phone: meta.phone_number.value,
        email: meta.email.value,
        saveToAddressBook: false,
        selected: true,
        collapsed: true,
        preferred_billing: chosenAddress.setAsPreferredBilling,
        preferred_shipping: chosenAddress.setAsPreferredShipping,
        errors: {}
      }
      return newState

    case types.SET_ADDRESS_BOOK:
      newState.addressBook = action.payload.data
      return newState

    case types.SET_ADDRESS_BOOK_ENTRY_BILLING:
      newState.billingAddress.saveToAddressBook = false
      newState.billingAddress.id = action.payload.id
      return newState

    case types.SET_ADDRESS_BOOK_ENTRY_SHIPPING:
      newState.shippingAddress.saveToAddressBook = false
      newState.shippingAddress.id = action.payload.id
      return newState

    case types.DELETE_ADDRESS:
      newState.addressBook = state.addressBook.filter(address => address.id !== action.data.addressId)
      return newState

    case types.AUTOFILL_ADDRESS:
      const address = action.address
      newState.shippingAddress = {
        id: address.id,
        city: address.city,
        country_code: address.country,
        email: address.meta_attributes.email.value,
        first_name: address.first_name,
        last_name: address.last_name,
        line_1: address.address_line_1,
        line_2: address.address_line_2,
        primary_phone: address.meta_attributes.phone_number.value,
        state: address.state || '',
        zipcode: address.postcode,
        preferred_shipping: address.preferred_shipping,
        preferred_billing: address.preferred_billing,
        selected: true,
        collapsed: true,
        errors: {}
      }
      return newState

    case types.AUTOFILL_BILLING_ADDRESS:
      newState.billingAddress = {
        id: action.address.id,
        city: action.address.city,
        country_code: action.address.country,
        email: action.address.meta_attributes.email.value,
        first_name: action.address.first_name,
        last_name: action.address.last_name,
        line_1: action.address.address_line_1,
        line_2: action.address.address_line_2,
        primary_phone: action.address.meta_attributes.phone_number.value,
        state: action.address.state || '',
        zipcode: action.address.postcode,
        preferred_shipping: action.address.preferred_shipping,
        preferred_billing: action.address.preferred_billing,
        selected: true,
        collapsed: true,
        errors: {}
      }
      return newState

    case types.SHIPPING_ADDRESS_CREATED:
      newState.shippingAddress.id = action.payload.id
      return newState

    case types.BILLING_ADDRESS_CREATED:
      newState.billingAddress.id = action.payload.id
      return newState

    default:
      return newState
  }
}
