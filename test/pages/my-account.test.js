// Libraries
import Router from 'next/router'

// Pages
import MyAccountPage from '../../src/pages/my-account'

// Actions
import { getCustomerOrders } from '../../src/actions/account-actions'

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

    const wrapper = shallow(<MyAccountPage />, { disableLifecycleMethods: true })

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

    const wrapper = shallow(<MyAccountPage />, { disableLifecycleMethods: true })

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

    const wrapper = shallow(<MyAccountPage />, { disableLifecycleMethods: true })

    wrapper.instance().componentDidMount()

    expect(replaceSpy).not.toHaveBeenCalled()
    expect(wrapper.state().currentMenu).toEqual('Password')

    replaceSpy.mockRestore()
  })
})
