module.exports = {
  "create_time":"2019-03-25T15:58:41Z",
  "id":"9B29180392286445Y",
  "intent":"AUTHORIZE",
  "status":"APPROVED",
  "payer":{
    "email_address":"testbuyer@flexcommerce.com",
    "payer_id":"KDW6SJUJWEW3E",
    "address":{
      "address_line_1":"1 Main Terrace",
      "admin_area_2":"Wolverhampton",
      "admin_area_1":"West Midlands",
      "postal_code":"W12 4LQ",
      "country_code":"GB"
    },
    "name":{
      "given_name":"test",
      "surname":"buyer"
    },
    "phone":{
      "phone_type":"HOME",
      "phone_number":{
        "national_number":"0352878596"
      }
    }
  },
  "purchase_units":[
    {
      "reference_id":"default",
      "amount":{
        "value":"14.49",
        "currency_code":"GBP"
      },
      "payee":{
        "email_address":"barco.03-facilitator@gmail.com",
        "merchant_id":"YQZCHTGHUK5P8"
      },
      "shipping":{
        "name":{
        "full_name":"Test Example"
        },
        "address":{
        "address_line_1":"Shift Commerce Ltd, Old School Boar",
        "address_line_2":"Calverley Street",
        "admin_area_2":"Leeds",
        "admin_area_1":"N/A",
        "postal_code":"LS1 3ED",
        "country_code":"GB"
        }
      }
    }
  ],
  "links":[
    {
      "href":"https://api.sandbox.paypal.com/v2/checkout/orders/9B29180392286445Y",
      "rel":"self",
      "method":"GET",
      "title":"GET"
    },
    {
      "href":"https://api.sandbox.paypal.com/v2/checkout/orders/9B29180392286445Y/authorize",
      "rel":"authorize",
      "method":"POST",
      "title":"POST"
    }
  ]
}
