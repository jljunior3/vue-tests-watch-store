import { mount } from '@vue/test-utils'
import axios from 'axios'
import { makeServer } from '@/miragejs/server'
import Vue from 'vue'
import ProductCard from '@/components/ProductCard'
import Search from '@/components/Search'
import ProductList from '.'

// mock axios do jest
jest.mock('axios', () => ({
  get: jest.fn(), // get retorna uma function do jest...
}))

describe('ProductList - integration', () => {
  let server

  beforeEach(() => {
    server = makeServer({ environment: 'test' }) // levanta um serviço de teste do mirage
  })

  afterEach(() => {
    server.shutdown()
  })

  const getProducts = async (quantity = 10, overrides = []) => {
    let overridesList = []

    if (overrides.length > 0) {
      overridesList = overrides.map((override) =>
        server.create('product', override)
      )
    }

    const products = [
      ...server.createList('product', quantity),
      ...overridesList,
    ]

    return products
  }

  const mountProductList = async (
    quantity = 10,
    overrides = [],
    shouldReject = false
  ) => {
    // se vc colocar fit roda somente este
    // monta o component
    const products = await getProducts(quantity, overrides)

    // faz a chamada ajax mock
    if (shouldReject) {
      axios.get.mockReturnValue(Promise.reject(new Error('')))
    } else {
      axios.get.mockReturnValue(Promise.resolve({ data: { products } }))
    }

    // instancia o compomente
    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    })

    // isso faz aguardar até o que vue tenha terminado suas mudanças....este é o mesmo conceito para o await do button
    // https://vue-test-utils.vuejs.org/guides/#testing-asynchronous-behavior
    await Vue.nextTick()

    return { wrapper, products }
  }

  it('should mount the component', () => {
    const wrapper = mount(ProductList)

    expect(wrapper.exists()).toBe(true) // verifica se o component existe
    expect(wrapper.vm).toBeDefined() // verifica se o component esta definido
  })

  it('should mount the search component', () => {
    const wrapper = mount(ProductList)
    expect(wrapper.findComponent(Search)).toBeDefined() // Verifica o componente pai tem este filho Search
  })

  it('should call axios.get on component mount', () => {
    mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    })

    expect(axios.get).toHaveBeenCalledTimes(1) // verifica se o componente tem uma dependencia do axios
    expect(axios.get).toHaveBeenCalledWith('/api/products')
    /* Verifica se a chamada do axios foi feita
    Neste caso o expect é um mock do jest...com a simulação da função get(escrita acima) e ela é comparada 
    com o que de fato é passado pelo component jestaxios.get === compoment.$axios.get */
  })

  it('should mount the ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList()

    const cards = wrapper.findAllComponents(ProductCard) // Verifica o componente pai tem este filho ProductCard
    expect(cards).toHaveLength(10)
  })

  it('should display the error message when Promise rejects', async () => {
    // faz a chamada ajax mock
    axios.get.mockReturnValue(Promise.reject(new Error(''))) // rejeitando a promise (endpoint com erro)

    // instancia o compomente
    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    })

    await Vue.nextTick()

    // esta é a mensagem aprensentada quando se tem erro
    expect(wrapper.text()).toContain('Problemas ao carregar a lista!')
  })

  it('should filter the product list when a search is performed', async () => {
    // Arrange
    const { wrapper } = await mountProductList(
      10,
      [
        {
          title: 'Meu relógio amado',
        },
        {
          title: 'Meu outro relógio estimado',
        },
      ],
      false
    )

    // Act
    // pesquisa o componente search dentro do component ProductList(Pai)
    const search = wrapper.findComponent(Search)
    // buscou o input search e colocou um valor nele
    search.find('input[type="search"]').setValue('relógio')
    // busca o formo e faz um gatilho de submit nele
    await search.find('form').trigger('submit')

    // Assert
    const cards = wrapper.findAllComponents(ProductCard)
    expect(wrapper.vm.searchTerm).toEqual('relógio')
    expect(cards).toHaveLength(2)
  })

  it('should filter the product list when a search is cleanned', async () => {
    // Arrange
    const { wrapper } = await mountProductList(
      10,
      [
        {
          title: 'Meu relógio amado',
        },
      ],
      false
    )

    // Act
    const search = wrapper.findComponent(Search)
    search.find('input[type="search"]').setValue('relógio')
    await search.find('form').trigger('submit')
    search.find('input[type="search"]').setValue('')
    await search.find('form').trigger('submit')

    // Assert
    const cards = wrapper.findAllComponents(ProductCard)
    expect(wrapper.vm.searchTerm).toEqual('')
    expect(cards).toHaveLength(11)
  })
})
