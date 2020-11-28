import { mount } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard'
import { makeServer } from '@/miragejs/server'

describe('ProductCard - unit', () => {
  let server

  const mountProductCard = () => {
    // cria um produto mockado no mirage
    const product = server.create('product', {
      title: 'Relógio bonito',
      price: '23.00',
      image:
        'https://images.unsplash.com/photo-1532667449560-72a95c8d381b?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
    })

    return {
      wrapper: mount(ProductCard, {
        propsData: {
          // desta forma passa a props para o component
          product,
        },
      }),
      product,
    }
  }

  beforeEach(() => {
    server = makeServer({ environment: 'test' }) // levanta um serviço de teste do mirage
  })

  afterEach(() => {
    server.shutdown()
  })

  it('should match the snapshot', () => {
    const { wrapper } = mountProductCard()
    expect(wrapper.element).toMatchSnapshot() // verifica se é igual a "foto" tirada do compomente
  })

  it('should mount the component', () => {
    const { wrapper } = mountProductCard()

    expect(wrapper.vm).toBeDefined()
    expect(wrapper.text()).toContain('Relógio bonito') // verifica se contem este texto
    expect(wrapper.text()).toContain('23.00') // verifica se contem este texto
  })

  it('should emit the event addToCart with product object when button gets clicked', async () => {
    const { wrapper, product } = mountProductCard()
    await wrapper.find('button').trigger('click') // procura o primeiro botão e dá um gatilho de click nele

    expect(wrapper.emitted().addToCart).toBeTruthy() // verifica se foi emitido um evento do vue
    expect(wrapper.emitted().addToCart.length).toBe(1) // verifica o tamanho do evento emitido (é um array)
    expect(wrapper.emitted().addToCart[0]).toEqual([{ product }]) // verificar se o payload do evento esta correto
  })
})
