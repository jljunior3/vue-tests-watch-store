import { mount } from '@vue/test-utils'
import CartItem from '@/components/CartItem'
import { makeServer } from '@/miragejs/server'
import { CartManager } from '@/managers/CartManager'

const mountCartItem = () => {
  const cartManager = new CartManager()
  const product = server.create('product', {
    title: 'Lindo relógio',
    price: '22.33',
  })
  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  })

  return { product, wrapper, cartManager }
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

  it('should display a button to remove item from cart', async () => {
    const { wrapper, cartManager } = mountCartItem()
    const button = wrapper.find('[data-testid="remove-button"]')
    const spy = jest.spyOn(cartManager, 'removeProduct')

    expect(button.exists()).toBe(true)
  })

  it('should call cart manager removeProduct() when button gets clicked', async () => {
    const { wrapper, cartManager, product } = mountCartItem()
    const spy = jest.spyOn(cartManager, 'removeProduct')
    await wrapper.find('[data-testid="remove-button"]').trigger('click')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(product.id)
  })
})
