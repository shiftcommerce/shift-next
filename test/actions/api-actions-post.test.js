// Actions
import * as apiActions from '../../src/actions/api-actions'
import ApiClient from '../../src/lib/api-client'
import JsonApiParser from '../../src/lib/json-api-parser'

import post200 from '../fixtures/actions/api-actions/post-200'
import post201 from '../fixtures/actions/api-actions/post-201'
import post404 from '../fixtures/actions/api-actions/post-404'
import post422 from '../fixtures/actions/api-actions/post-422'

const testRequest = {
  endpoint: `/testEndpoint`,
  body: {
    data: {
      type: 'customer_accounts',
      attributes: {
        email: 'a.fletcher1234@gmail.com',
        email_confirmation: 'a.fletcher1234@gmail.com',
        password: 'qwertyuiop',
        password_confirmation: 'qwertyuiop'
      }
    }
  },
  requestActionType: 'GET_TEST',
  successActionType: 'SET_TEST',
  errorActionType: 'SET_ERROR'
}

describe('postEndpoint()', () => {
  test('dispatches request and success actions for 200 responses', async () => {
    const postSpy = jest.spyOn(ApiClient.prototype, 'post').mockImplementation(async () => post200)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.postEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ payload: new JsonApiParser().parse(post200.data), type: 'SET_TEST' })

    postSpy.mockRestore()
  })

  test('dispatches request and success actions for 201 responses', async () => {
    const postSpy = jest.spyOn(ApiClient.prototype, 'post').mockImplementation(async () => post201)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.postEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ payload: new JsonApiParser().parse(post201.data), type: 'SET_TEST' })

    postSpy.mockRestore()
  })

  test('dispatches request and error actions for 404 responses', async () => {
    const postSpy = jest.spyOn(ApiClient.prototype, 'post').mockImplementation(async () => post404)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.postEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ payload: { error: { data: post404.data } }, type: 'SET_ERROR' })

    postSpy.mockRestore()
  })

  test('dispatches request and error actions for 422 responses', async () => {
    const postSpy = jest.spyOn(ApiClient.prototype, 'post').mockImplementation(async () => post422)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.postEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ payload: { error: { data: post422.data } }, type: 'SET_ERROR' })

    postSpy.mockRestore()
  })
})
