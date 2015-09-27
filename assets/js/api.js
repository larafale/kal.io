var Api = {

  account: new Apy({
    base: '/api/',
    collection: 'accounts'
  }),

  user: new Apy({
    base: '/api/',
    collection: 'users'
  }),

  resource: new Apy({
    base: '/api/',
    collection: 'resources'
  }),

  block: new Apy({
    base: '/api/',
    collection: 'blocks'
  })
}