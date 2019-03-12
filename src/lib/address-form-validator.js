export default function (address) {
  const requiredFields = ['line_1', 'zipcode', 'city', 'primary_phone', 'email']

  const requiredFieldsPresent = requiredFields.every(key => address[key])
  const noFormErrorsPresent = (Object.values(address.errors).filter(String).length === 0)

  return requiredFieldsPresent && noFormErrorsPresent
}
