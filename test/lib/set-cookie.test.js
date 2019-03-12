import { setCookie } from '../../src/lib/set-cookie'
import Cookies from 'js-cookie'

test('setCookie() sets a signedIn cookie valid for 30 days', () => {
  const cookiesSpy = jest.spyOn(Cookies, 'set')
  const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => new Date('2019-01-01').getTime())

  setCookie()

  expect(cookiesSpy).toHaveBeenCalledWith('signedIn', true, {
    expires: new Date('2019-01-31')
  })

  cookiesSpy.mockRestore()
  dateSpy.mockRestore()
})
