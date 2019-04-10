// Libraries
import Router from 'next/router'

// Pages
import MyAccountPage from '../../src/pages/my-account'

// Actions
import * as AddressBookActions from '../../src/actions/address-book-actions'

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {}
}))

// Mock out Router usage in getDerivedStateFromProps
const originalRouter = Router.router

beforeAll(() => {
  Router.router = {
    asPath: 'example.com'
  }
})

afterAll(() => {
  Router.router = originalRouter
})

describe('componentDidMount', () => {
  test('redirects to the first default child when no menu is given', () => {
    const replaceSpy = jest.spyOn(Router, 'replace').mockImplementation(() => {})

    const wrapper = shallow(<MyAccountPage account={{}} dispatch={jest.fn()} />, { disableLifecycleMethods: true })

    wrapper.instance().componentDidMount()

    expect(replaceSpy).toHaveBeenCalledWith('example.com?menu=Details')
    expect(wrapper.state().currentMenu).toEqual('Details')

    replaceSpy.mockRestore()
  })

  test('redirects to the first default child when an invalid menu is given', () => {
    Router.router = {
      asPath: 'example.com?menu=invalid'
    }

    const replaceSpy = jest.spyOn(Router, 'replace').mockImplementation(() => {})

    const wrapper = shallow(<MyAccountPage account={{}} dispatch={jest.fn()} />, { disableLifecycleMethods: true })

    wrapper.instance().componentDidMount()

    expect(replaceSpy).toHaveBeenCalledWith('example.com?menu=Details')
    expect(wrapper.state().currentMenu).toEqual('Details')

    replaceSpy.mockRestore()
  })

  test("sets the state and doesn't redirect when a valid menu is given", () => {
    Router.router = {
      asPath: 'example.com?menu=Password'
    }

    const replaceSpy = jest.spyOn(Router, 'replace').mockImplementation(() => {})

    const wrapper = shallow(<MyAccountPage account={{}} dispatch={jest.fn()} />, { disableLifecycleMethods: true })

    wrapper.instance().componentDidMount()

    expect(replaceSpy).not.toHaveBeenCalled()
    expect(wrapper.state().currentMenu).toEqual('Password')

    replaceSpy.mockRestore()
  })
})

describe('handleUpdateDetailsSubmit()', () => {
  test('sets form status to success when updating customer account succeeds', async () => {
    const setStatus = jest.fn()
    const setSubmitting = jest.fn()
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve(true))

    const wrapper = shallow(<MyAccountPage dispatch={dispatch} account={{}} />, { disableLifecycleMethods: true })

    await wrapper.instance().handleUpdateDetailsSubmit({}, { setStatus, setSubmitting })

    expect(setStatus).toHaveBeenCalledWith('success')
  })

  test('sets form status to error when updating customer account fails', async () => {
    const setStatus = jest.fn()
    const setSubmitting = jest.fn()
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve(false))

    const wrapper = shallow(<MyAccountPage dispatch={dispatch} account={{}} />, { disableLifecycleMethods: true })

    await wrapper.instance().handleUpdateDetailsSubmit({}, { setStatus, setSubmitting })

    expect(setStatus).toHaveBeenCalledWith('error')
  })
})

const formData = {
  firstName: 'John',
  lastName: 'Doe',
  addressLine1: 'Address Line 1',
  addressLine2:  'Address Line 2',
  city: 'Leeds',
  county: 'West Yorkshire',
  countryCode: 'GB',
  postcode: 'LS27EY',
  preferredBilling: true,
  preferredShipping: true,
  label: 'Label',
  company: 'Shift',
  phone: '123',
  email: 'test@example.com'
}

describe('onAddressCreated()', () => {
  test('successfully saves the address to the address book', async () => {
    jest.useFakeTimers()

    const saveAddressSpy = jest.spyOn(AddressBookActions, 'saveToAddressBook')
    const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve(true))

    const wrapper = shallow(<MyAccountPage dispatch={dispatch} account={{}} />, { disableLifecycleMethods: true })

    const formikBag = {
      setStatus: jest.fn(),
      setSubmitting: jest.fn()
    }
    
    await wrapper.instance().onAddressCreated(formData, formikBag)

    expect(saveAddressSpy).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      line_1: 'Address Line 1',
      line_2: 'Address Line 2',
      city: 'Leeds',
      state: 'West Yorkshire',
      country_code: 'GB',
      zipcode: 'LS27EY',
      preferred_billing: true,
      preferred_shipping: true,
      label: 'Label',
      companyName: 'Shift',
      primary_phone: '123',
      email: 'test@example.com'
    })
    expect(fetchAddressBookSpy).toHaveBeenCalled()
    expect(formikBag.setStatus).toHaveBeenCalledWith('success-created')

    jest.runAllTimers()
    expect(formikBag.setStatus).toHaveBeenCalledWith(null)
    expect(formikBag.setSubmitting).toHaveBeenCalledWith(false)

    saveAddressSpy.mockRestore()
    fetchAddressBookSpy.mockRestore()
  })
})

describe('onAddressUpdated()', () => {
  test('successfully updates the address', async () => {
    jest.useFakeTimers()

    const updateAddressSpy = jest.spyOn(AddressBookActions, 'updateAddress')
    const fetchAddressBookSpy = jest.spyOn(AddressBookActions, 'fetchAddressBook')
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve(true))

    const wrapper = shallow(<MyAccountPage dispatch={dispatch} account={{}} addressBook={[]} />, { disableLifecycleMethods: true })
    wrapper.setState({
      currentAddressId: 10
    })

    const formikBag = {
      setStatus: jest.fn(),
      setSubmitting: jest.fn()
    }
    
    await wrapper.instance().onAddressUpdated(formData, formikBag)

    expect(updateAddressSpy).toHaveBeenCalledWith(10, {
      first_name: 'John',
      last_name: 'Doe',
      line_1: 'Address Line 1',
      line_2: 'Address Line 2',
      city: 'Leeds',
      state: 'West Yorkshire',
      country_code: 'GB',
      zipcode: 'LS27EY',
      preferred_billing: true,
      preferred_shipping: true,
      label: 'Label',
      companyName: 'Shift',
      primary_phone: '123',
      email: 'test@example.com'
    })
    expect(fetchAddressBookSpy).toHaveBeenCalled()
    expect(formikBag.setStatus).toHaveBeenCalledWith('success-updated')

    jest.runAllTimers()
    expect(formikBag.setStatus).toHaveBeenCalledWith(null)
    expect(formikBag.setSubmitting).toHaveBeenCalledWith(false)
  })
})
