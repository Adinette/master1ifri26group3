export type ServiceDefinition = {
  name: string
  port: number
  path: string
  validStatuses: readonly number[]
}

export const serviceDefinitions: ServiceDefinition[] = [
  { name: 'Auth Service', port: 3001, path: '/health', validStatuses: [200] },
  { name: 'User Service', port: 3002, path: '/health', validStatuses: [200] },
  { name: 'Product Service', port: 3003, path: '/health', validStatuses: [200] },
  { name: 'Inventory Service', port: 3004, path: '/health', validStatuses: [200] },
  { name: 'Order Service', port: 3005, path: '/health', validStatuses: [200] },
  { name: 'Production Service', port: 3006, path: '/health', validStatuses: [200] },
  { name: 'Billing Service', port: 3007, path: '/health', validStatuses: [200] },
  { name: 'Notification Service', port: 3008, path: '/health', validStatuses: [200] },
  { name: 'Reporting Service', port: 3009, path: '/health', validStatuses: [200] },
]