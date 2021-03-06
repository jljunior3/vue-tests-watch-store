import { mount } from '@vue/test-utils'
import Cart from '@/components/Cart'
import CartItem from '@/components/CartItem'
import { makeServer } from '@/miragejs/server'
import { CartManager } from '@/managers/CartManager'

describe('Cart', () => {
  let server

  beforeEach(() => {
    server = makeServer({ environment: 'test' }) // levanta um serviço de teste do mirage
  })

  afterEach(() => {
    server.shutdown()
  })

  it('should mount the component', async () => {
    const wrapper = mount(Cart)
    expect(wrapper.vm).toBeDefined()
  })

  it('should emit close event when button gets clicked', async () => {
    const wrapper = mount(Cart)
    const button = wrapper.find('[data-testid="close-button"]')

    await button.trigger('click')

    // verifica se é diferente de null, undefined, vazio e etc
    expect(wrapper.emitted().close).toBeTruthy()
    expect(wrapper.emitted().close).toHaveLength(1)
  })

  it('should hide the cart when no prop isOpen is passed', async () => {
    const wrapper = mount(Cart)
    // retorna um array com todas as classes do componente
    expect(wrapper.classes()).toContain('hidden')
  })

  it('should display the cart when no prop isOpen is passed', async () => {
    const wrapper = mount(Cart, {
      propsData: {
        isOpen: true,
      },
    })
    // retorna um array com todas as classes do componente
    // neste caso a classe hidden não deve constar
    expect(wrapper.classes()).not.toContain('hidden')
  })

  it('should display "Cart is empty" when there are no products', async () => {
    const wrapper = mount(Cart)
    // pesquisa se existe esta string no componente
    expect(wrapper.text()).toContain('Cart is empty')
  })

  it('should display 2 instances of CartItem when 2 products are provided', () => {
    const products = server.createList('product', 2)
    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
    })
    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2)
    expect(wrapper.text()).not.toContain('Cart is empty')
  })

  it('should display a button to clear cart', () => {
    const products = server.createList('product', 2)
    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
    })
    const button = wrapper.find('[data-testid="clear-cart-button"]')

    expect(button.exists()).toBe(true)
  })

  it('should call cart manager clearProducts() wheren button gets clicked', async () => {
    const cartManager = new CartManager()

    const product = server.create('product')
    const wrapper = mount(Cart, {
      propsData: {
        product,
      },
      mocks: {
        $cart: cartManager,
      },
    })
    const spy = jest.spyOn(cartManager, 'clearProducts')
    await wrapper.find('[data-testid="clear-cart-button"]').trigger('click')

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
