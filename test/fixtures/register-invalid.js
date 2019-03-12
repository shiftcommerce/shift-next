module.exports = {
  errors: [
    {
      title: 'is too short (minimum is 8 characters)',
      detail: 'password - is too short (minimum is 8 characters)',
      code: '100',
      source: {
        pointer: '/data/attributes/password'
      },
      status: '422'
    }
  ],
  meta: {
    warnings: [
      {
        title: 'Param not allowed',
        detail: 'email_confirmation is not allowed.',
        code: '105'
      },
      {
        title: 'Param not allowed',
        detail: 'password_confirmation is not allowed.',
        code: '105'
      }
    ]
  },
  links: {
    self: '/integration/v1/customer_accounts'
  }
}
