module.exports = {
  "name":"INVALID_REQUEST",
  "message":"Request is not well-formed, syntactically incorrect, or violates schema.",
  "debug_id":"a3123c522712d",
  "details":[
    {
      "field":"/value",
      "value":"",
      "location":"body",
      "issue":"INVALID_PARAMETER_SYNTAX",
      "description":"The value of a field does not conform to the expected format."
    }
  ],
  "links":[
    {
      "href":"https://developer.paypal.com/docs/api/orders/v2/#error-INVALID_PARAMETER_SYNTAX",
      "rel":"information_link",
      "encType":"application/json"
    }
  ]
}
