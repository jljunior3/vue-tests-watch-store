import Vue from 'vue'

export default {
  install: (Vue) => {
    /* istanbul ignore next */
    Vue.prototype.$cart = new CartManager()
  },
}

const initialState = {
  open: false,
  items: [],
}

export class CartManager {
  constructor() {
    this.state = Vue.observable(initialState)
  }

  getState() {
    return this.state
  }

  open() {
    this.state.open = true
    return this.getState()
  }

  close() {
    this.state.open = false
    return this.getState()
  }

  productIsInTheCart(product) {
    return !!this.state.items.find(({ id }) => id === product.id)
  }

  hasProducts() {
    return !!this.state.items.length
  }

  addProduct(product) {
    if (this.productIsInTheCart(product)) {
      return this.getState()
    } else {
      this.state.items.push(product)
    }
  }

  removeProduct(productId) {
    this.state.items = [
      ...this.state.items.filter((product) => product.id !== productId),
    ]

    return this.getState()
  }

  clearProducts() {
    this.state.items = []
    return this.getState()
  }

  clearCart() {
    this.clearProducts()
    this.close()

    return this.getState()
  }
}
