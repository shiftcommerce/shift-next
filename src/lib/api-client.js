// Libraries
import qs from 'qs'
import axios from 'axios'

import Config from '../lib/config'

class ApiClient {
  constructor (options = {}) {
    this.client = axios.create({
      baseURL: Config.get().apiHostProxy
    })
  }

  async read (endpoint, queryObject = {}, options = {}) {
    const formattedEndpoint = this.encodeParams(endpoint, queryObject)

    try {
      const response = await this.client.get(formattedEndpoint)
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error('API CLIENT: Error while fetching data', error)
      return { status: error.response.status, data: error.response.data }
    }
  }

  async post (endpoint, body = {}, options = {}) {
    try {
      const response = await this.client.post(endpoint, body)
      return { status: response.status, data: response.data }
    } catch (error) {
      console.error('Error while posting data', error)
      return { status: error.response.status, data: error.response.data }
    }
  }

  async delete (endpoint, options = {}) {
    try {
      const response = await this.client.delete(endpoint)
      return { status: response.status, data: response.data }
    } catch (error) {
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
