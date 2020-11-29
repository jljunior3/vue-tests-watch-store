import { mount } from '@vue/test-utils'
import CartItem from '@/components/CartItem'
import { makeServer } from '@/miragejs/server'

const mountCartItem = () => {
  const product = server.create('product', {
    title: 'Lindo relógio',
    price: '22.33',
  })
  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
  })

  return { product, wrapper }
}

describe('CartItem', () => {
  let server
  beforeEach(() => {
    server = makeServer({ environment: 'test' })
  })
  afterEach(() => {
    server.shutdown()
  })

  it('should mount the component', async () => {
    const { wrapper } = mountCartItem()
    expect(wrapper.vm).toBeDefined()
  })

  it('should display produtc info', async () => {
    const { wrapper, product } = mountCartItem()
    expect(wrapper.text()).toContain(product.title)
    expect(wrapper.text()).toContain(product.price)
  })

  it('should display quantity 1 when product is first displayed', async () => {
    const { wrapper } = mountCartItem()
    // procurar por um elemento html
    const quantity = wrapper.find('[data-testid="quantity"]')

    expect(quantity.text()).toContain('1')
  })

  it('should increase quantity when + button gets clicked', async () => {
    const { wrapper } = mountCartItem()
    const button = wrapper.find('[data-testid="+"]')
    const quantity = wrapper.find('[data-testid="quantity"]')

    await button.trigger('click')
    expect(quantity.text()).toContain('2')

    await button.trigger('click')
    expect(quantity.text()).toContain('3')

    await button.trigger('click')
    expect(quantity.text()).toContain('4')
  })

  it('should decrease quantity when - button gets clicked', async () => {
    const { wrapper } = mountCartItem()
    const button = wrapper.find('[data-testid="-"]')
    const quantity = wrapper.find('[data-testid="quantity"]')

    await button.trigger('click')
    expect(quantity.text()).toContain('0')
  })

  it('should not got below zero when button - is repeateldy clicked', async () => {
    const { wrapper } = mountCartItem()
    const button = wrapper.find('[data-testid="-"]')
    const quantity = wrapper.find('[data-testid="quantity"]')

    await button.trigger('click')
    expect(quantity.text()).toContain('0')

    await button.trigger('click')
    expect(quantity.text()).toContain('0')

    await button.trigger('click')
    expect(quantity.text()).toContain('0')
  })
})
