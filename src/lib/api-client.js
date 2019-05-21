// Libraries
import qs from 'qs'
import axios from 'axios'

import Config from '../lib/config'

import { toggleLoading } from '../actions/global-actions'

// Check to see if dispatch is passed through,
// if so, dispatch `toggleLoading`, otherwise don't do anything.
// We need to pass dispatch through as apiClient isnt coupled to redux.
const shouldDispatch = (dispatch, value) => {
  dispatch ? dispatch(toggleLoading(value)) : null
}

class ApiClient {
  constructor (options = {}) {
    this.client = axios.create({
      baseURL: Config.get().apiHostProxy
    })
  }

  async read (endpoint, queryObject = {}, dispatch = null, options = {}) {
    const formattedEndpoint = this.encodeParams(endpoint, queryObject)

    try {
      shouldDispatch(dispatch, true)
      const response = await this.client.get(formattedEndpoint)
      shouldDispatch(dispatch, false)
      return { status: response.status, data: response.data }
    } catch (error) {
      shouldDispatch(dispatch, false)
      console.error('API CLIENT: Error while fetching data', error)
      return { status: error.response.status, data: error.response.data }
    }
  }

  async post(endpoint, body = {}, dispatch = null, options = {}) {
    try {
      shouldDispatch(dispatch, true)
      const response = await this.client.post(endpoint, body)
      shouldDispatch(dispatch, false)
      return { status: response.status, data: response.data }
    } catch (error) {
      shouldDispatch(dispatch, false)
      console.error('Error while posting data', error)
      return { status: error.response.status, data: error.response.data }
    }
  }

  async delete(endpoint, dispatch = null, options = {}) {
    try {
      shouldDispatch(dispatch, true)
      const response = await this.client.delete(endpoint)
      shouldDispatch(dispatch, false)
      return { status: response.status, data: response.data }
    } catch (error) {
      shouldDispatch(dispatch, false)
      console.error('Error during delete request', error)
      return { status: error.response.status, data: error.response.data }
    }
  }

  encodeParams (endpoint, queryObject = {}) {
    if (Object.keys(queryObject).length > 0) {
      const query = qs.stringify(queryObject)
      endpoint = `${endpoint}?${query}`
    }
    return endpoint
  }
}

export default ApiClient
