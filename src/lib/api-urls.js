module.exports = {
  shiftPlatform: {
    accountByIdUrl: accountId => `${process.env.API_TENANT}/v1/customer_accounts/${accountId}`
  }
}
