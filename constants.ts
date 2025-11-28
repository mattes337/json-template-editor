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
  "meta": {
    "requestId": "{{#js}} 'req_' + Math.random().toString(36).substr(2, 9) {{/js}}",
    "timestamp": "{{ meta.timestamp }}",
    "apiVersion": "v2",
    "isProduction": {{#js}} context.meta.environment === 'production' {{/js}}
  },
  "userInfo": {
    "id": "{{ user.id }}",
    "displayName": "{{ user.name }}",
    "email": "{{ user.email }}",
    "status": "{{#if user.isActive}}Active{{else}}Inactive{{/if}}",
    "roles": [
      {{#each user.roles}}
      "{{ uppercase this }}"{{#unless @last}},{{/unless}}
      {{/each}}
    ],
    "preferences": {
      {{#each user.preferences}}
      "{{ @key }}": "{{ this }}"{{#unless @last}},{{/unless}}
      {{/each}}
    }
  },
  "order": {
    "id": "{{ order.id }}",
    "currency": "{{ order.currency }}",
    "shipping": {
      "method": "{{#if order.shippingAddress}}Delivery{{else}}Pickup{{/if}}",
      "address": "{{#if order.shippingAddress}}{{ order.shippingAddress }}{{else}}N/A{{/if}}"
    },
    "items": [
      {{#each order.items}}
      {
        "sku": "{{ this.sku }}",
        "qty": {{ this.qty }},
        "unitPrice": {{ this.price }},
        "lineTotal": {{#js}} (scope.qty * scope.price).toFixed(2) {{/js}},
        "highValue": {{#js}} (scope.qty * scope.price) > 60 {{/js}}
      }{{#unless @last}},{{/unless}}
      {{/each}}
    ],
    "totals": {
      "subtotal": {{ order.total }},
      "tax": {{#js}} (context.order.total * 0.1).toFixed(2) {{/js}},
      "grandTotal": {{#js}} (context.order.total * 1.1).toFixed(2) {{/js}},
      "formatted": "{{ formatCurrency order.total order.currency }}"
    }
  }
}`;

export const INITIAL_FUNCTIONS = [
  {
    id: 'fn_1',
    name: 'formatCurrency',
    args: ['amount', 'currency'],
    body: "return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);"
  },
  {
    id: 'fn_2',
    name: 'uppercase',
    args: ['str'],
    body: "return str ? String(str).toUpperCase() : '';"
  }
];