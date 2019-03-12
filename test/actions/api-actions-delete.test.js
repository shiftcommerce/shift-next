import { deleteEndpoint } from '../../src/actions/api-actions'
import ApiClient from '../../src/lib/api-client'

// Mock out ApiClient
jest.mock('../../src/lib/api-client')

test('it dispatches a requestActionType event if the request specifies one', async () => {
  ApiClient.mockImplementation(() => {
    return {
      delete: () => Promise.resolve()
    }
  })

  const request = {
    requestActionType: 'INITIATE_DELETE_REQUEST',
    requestActionData: 'supplementary data'
  }
  const dispatch = jest.fn()

  await deleteEndpoint(request)(dispatch)

  expect(dispatch).toHaveBeenCalledWith({
    type: 'INITIATE_DELETE_REQUEST',
    data: 'supplementary data'
  })
})

test('it dispatches a successActionType event if the request specifies one and the api responds with a 204', async () => {
  ApiClient.mockImplementation(() => {
    return {
      delete: () => Promise.resolve({
        status: 204,
        data: {
          data: {
            id: 10,
            attributes: {
              key: 'value'
            }
          }
        }
      })
    }
  })

  const request = {
    successActionType: 'DELETE_REQUEST_SUCCESS'
  }
  const dispatch = jest.fn()

  await deleteEndpoint(request)(dispatch)

  expect(dispatch).toHaveBeenCalledTimes(1)
  expect(dispatch).toHaveBeenCalledWith({
    type: 'DELETE_REQUEST_SUCCESS',
    payload: { id: 10, key: 'value' }
  })
})

test('it dispatches an errorActionType event if the request specifies one and the api response is not a 204', async () => {
  ApiClient.mockImplementation(() => {
    return {
      delete: () => Promise.resolve({
        status: 404,
        data: 'Not found'
      })
    }
  })

  const request = {
    errorActionType: 'DELETE_REQUEST_ERROR'
  }
  const dispatch = jest.fn()

  await deleteEndpoint(request)(dispatch)

  expect(dispatch).toHaveBeenCalledTimes(1)
  expect(dispatch).toHaveBeenCalledWith({
    type: 'DELETE_REQUEST_ERROR',
    payload: {
      error: {
        data: 'Not found',
        request: {
          errorActionType: 'DELETE_REQUEST_ERROR'
        }
      }
    }
  })
})

test('it dispatches an errorActionType event if the request specifies one and the request fails', async () => {
  ApiClient.mockImplementation(() => {
    return {
      delete: () => Promise.reject(new Error('oops!'))
    }
  })

  const request = {
    errorActionType: 'DELETE_REQUEST_ERROR'
  }
  const dispatch = jest.fn()

  await deleteEndpoint(request)(dispatch)

  expect(dispatch).toHaveBeenCalledTimes(1)
  expect(dispatch).toHaveBeenCalledWith({
    type: 'DELETE_REQUEST_ERROR',
    payload: {
      error: {
        data: new Error('oops!')
      }
    }
  })
})
