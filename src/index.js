//index.js
import './index.less';

class Animal {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}
console.log('aaaa')

const dog = new Animal('dog');