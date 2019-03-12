// Libs
import { getSessionExpiryTime } from '../../src/lib/session'

const RealDate = Date

// Update Date.now() to return 2019-01-01
beforeAll(() => {
  global.Date = class extends Date {
    static now () {
      // 2019-01-01 00:00:00 in miliseconds
      return 1546300800000
    }
  }
})

afterAll(() => {
  global.Date = RealDate
  delete process.env.SESSSION_EXPIRY
})

describe('getSessionExpiryTime()', () => {
  test('uses defaultSessionExpiryTime if Config.sessionExpiryTime is undefined', () => {
    const mockExpiryTime = new Date(Date.now() + (30 * 24 * 60 * 60) * 1000).getTime() // 30 days
    const sessionExpiryDateTime = getSessionExpiryTime().getTime()

    expect(sessionExpiryDateTime).toEqual(mockExpiryTime)
  })

  test('uses value in Config.sessionExpiryTime if it is set', () => {
    const mockSessionExpirySeconds = 14 * 24 * 60 * 60 // 14 days
    process.env.SESSSION_EXPIRY = mockSessionExpirySeconds
    const mockExpiryTime = new Date(Date.now() + mockSessionExpirySeconds * 1000).getTime()

    const sessionExpiryDateTime = getSessionExpiryTime()

    expect(sessionExpiryDateTime.getTime()).toEqual(mockExpiryTime)

    // Check Date functions are working
    expect(sessionExpiryDateTime.getFullYear()).toEqual(2019)
    expect(sessionExpiryDateTime.getMonth()).toEqual(0) // January
    expect(sessionExpiryDateTime.getDate()).toEqual(15)

    // Check it's the right time
    const sessionExpiryTimeStamp = `${sessionExpiryDateTime.getHours().toString().padStart(2, '0')}:${sessionExpiryDateTime.getMinutes().toString().padStart(2, '0')}:${sessionExpiryDateTime.getSeconds().toString().padStart(2, '0')}`
    expect(sessionExpiryTimeStamp).toEqual('00:00:00')
  })
})
