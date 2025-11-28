export const INITIAL_TEST_DATA = {
  "user": {
    "id": "u_88231",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "isActive": true,
    "roles": ["admin", "editor"],
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  },
  "order": {
    "id": "ord_9920",
    "total": 150.50,
    "currency": "USD",
    "items": [
      { "sku": "A-123", "qty": 2, "price": 50.00 },
      { "sku": "B-456", "qty": 1, "price": 50.50 }
    ],
    "shippingAddress": null
  },
  "meta": {
    "timestamp": "2023-10-27T10:00:00Z",
    "environment": "production"
  }
};

export const INITIAL_TEMPLATE = `{
  "eventId": "{{#js}} 'evt_' + Math.random().toString(36).substr(2, 9) {{/js}}",
  "userId": "{{ user.id }}",
  "fullName": "{{ user.name }}",
  "firstName": "{{#js}} context.user.name.split(' ')[0] {{/js}}",
  "isActive": {{ user.isActive }},
  "orderSummary": {
    "orderId": "{{ order.id }}",
    "totalValue": {{ order.total }},
    "isHighValue": {{#js}} context.order.total > 100 {{/js}}
  },
  "tags": [
    {{#each user.roles}}
    "role:{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  ],
  "generatedAt": "{{ meta.timestamp }}"
}`;
