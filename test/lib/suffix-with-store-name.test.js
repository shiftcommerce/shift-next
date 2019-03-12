import Config from '../../src/lib/config'
import { suffixWithStoreName } from '../../src/lib/suffix-with-store-name'

test('suffixWithStoreName() appends the store name set in the config to a string', () => {
  Config.set({ storeName: 'Shift' })
  expect(suffixWithStoreName('Homepage')).toEqual('Homepage - Shift')
})
