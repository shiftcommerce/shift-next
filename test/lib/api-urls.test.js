const { shiftPlatform } = require('../../src/lib/api-urls')

test('accountByIdUrl() returns a correct url', () => {
  expect(shiftPlatform.accountByIdUrl('23')).toEqual('test_tenant/v1/customer_accounts/23')
})
