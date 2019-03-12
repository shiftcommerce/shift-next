class InputFieldValidator {
  constructor (name, value, rules = {}) {
    this.name = name
    this.value = value
    this.rules = rules
  }

  validate (state) {
    let validationMessage = ''
    Object.keys(this.rules).map((rule) => {
      if (validationMessage === '') {
        validationMessage = this[rule](rule, state)
      }
    })
    return validationMessage
  }

  required () {
    const present = (this.value.toString().trim().length !== 0)
    return (present ? '' : `${this.formattedFieldName()} is required.`)
  }

  // This rule can be used where we don't want to hassle the user with validation
  // messages before they've started entering text
  requiredButIgnoreEmpty () {
    if (this.value.toString().trim().length > 0) {
      return this.required()
    } else {
      // no-op
    }
  }

  email () {
    const regex = /.+@.+\..+/i
    const validEmail = (regex.test(this.value))
    return (validEmail ? '' : `${this.value || this.formattedFieldName()} is not valid.`)
  }

  compareField (rule, state) {
    const fieldForComparison = this.rules[rule]
    const validComparison = this.value === state[fieldForComparison]
    return (validComparison ? '' : `Must match ${fieldForComparison}`)
  }

  maxLength (rule) {
    const maxLength = this.rules[rule]
    const validMaxLength = (this.inputValueLength() <= maxLength)
    return (validMaxLength ? '' : `Please enter no more than ${maxLength} characters.`)
  }

  minLength (rule) {
    const minLength = this.rules[rule]
    const validMinLength = (this.inputValueLength() >= minLength)
    return (validMinLength ? '' : `Please enter more than ${minLength} characters.`)
  }

  phone () {
    const regex = /^(\+?44\s?\d{3,4}|\(?\d{4,5}\)?)\s?\d{3}\s?\d{3}$/
    const validPhoneNumber = (this.value.match(regex))
    return (validPhoneNumber ? '' : `${this.value} - is not a valid ${this.formattedFieldName()}.`)
  }

  postcode () {
    const regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i
    const validPostcode = (regex.test(this.value))
    return (validPostcode ? '' : `${this.value} - is not a valid ${this.formattedFieldName()}.`)
  }

  formattedFieldName () {
    return this.name.replace(/_/g, ' ')
  }

  inputValueLength () {
    return this.value.toString().trim().length
  }
}

export default InputFieldValidator
