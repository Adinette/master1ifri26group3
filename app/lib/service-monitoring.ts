export type ServiceDefinition = {
  name: string
  port: number
  path: string
  validStatuses: readonly number[]
}

export const serviceDefinitions: ServiceDefinition[] = [
  { name: 'Auth Service', port: 3001, path: '/api/verify', validStatuses: [200, 401] },
  { name: 'User Service', port: 3002, path: '/api/users', validStatuses: [200] },
  { name: 'Product Service', port: 3003, path: '/api/products', validStatuses: [200] },
  { name: 'Inventory Service', port: 3004, path: '/api/stock', validStatuses: [200] },
  { name: 'Order Service', port: 3005, path: '/api/orders', validStatuses: [200] },
  { name: 'Production Service', port: 3006, path: '/api/production', validStatuses: [200] },
  { name: 'Billing Service', port: 3007, path: '/api/invoices', validStatuses: [200] },
  { name: 'Notification Service', port: 3008, path: '/api/notifications', validStatuses: [200] },
  { name: 'Reporting Service', port: 3009, path: '/api/dashboard', validStatuses: [200] },
]