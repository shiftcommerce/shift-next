// Actions
import * as apiActions from '../../src/actions/api-actions'
import ApiClient from '../../src/lib/api-client'

import read200 from '../fixtures/actions/api-actions/read-200'
import read304 from '../fixtures/actions/api-actions/read-304'
import read500 from '../fixtures/actions/api-actions/read-500'

const testRequest = {
  endpoint: `/testEndpoint`,
  query: {
    fields: {
      menu: 'id,title'
    }
  },
  requestActionType: 'GET_TEST',
  successActionType: 'SET_TEST',
  errorActionType: 'SET_ERROR'
}

describe('readEnpoint()', () => {
  test('dispatches request and success actions for successful responses', async () => {
    const readSpy = jest.spyOn(ApiClient.prototype, 'read').mockImplementation(async () => read200)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.readEndpoint(testRequest)(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ 'payload': { 'data': [{ 'active': true, 'id': '132997', 'resource_id': 50, 'resource_type': 'StaticPage', 'slug': 'mens' }], 'pagination': {} }, 'type': 'SET_TEST' })

    readSpy.mockRestore()
  })

  test('dispatches request and success actions for 304 responses', async () => {
    const readSpy = jest.spyOn(ApiClient.prototype, 'read').mockImplementation(async () => read304)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.readEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ 'payload': { 'data': [{ 'active': true, 'id': '132997', 'resource_id': 50, 'resource_type': 'StaticPage', 'slug': 'mens' }], 'pagination': {} }, 'type': 'SET_TEST' })

    readSpy.mockRestore()
  })

  test('dispatches request and error actions for 500 responses', async () => {
    const readSpy = jest.spyOn(ApiClient.prototype, 'read').mockImplementation(async () => read500)

    // Arrange
    const dispatch = jest.fn()

    // Act
    await apiActions.readEndpoint(testRequest)(dispatch)

    // Assert
    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_TEST' })
    expect(dispatch).toHaveBeenCalledWith({ 'payload': { 'error': { 'data': { 'data': [{ 'attributes': { 'active': true, 'resource_id': 50, 'resource_type': 'StaticPage', 'slug': 'mens' }, 'id': '132997', 'links': { 'self': '/integration/v1/slugs/132997.json_api' }, 'type': 'slugs' }] }, 'request': { 'endpoint': '/testEndpoint', 'errorActionType': 'SET_ERROR', 'query': { 'fields': { 'menu': 'id,title' } }, 'requestActionType': 'GET_TEST', 'successActionType': 'SET_TEST' } } }, 'type': 'SET_ERROR' })

    readSpy.mockRestore()
  })
})
