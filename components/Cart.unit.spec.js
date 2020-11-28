import { mount } from '@vue/test-utils'
import Cart from '@/components/Cart'

describe('Cart', () => {
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
})
