// Closures and classes: two ways to hold private state.

// 1. A counter via closure
function makeCounter() {
  let count = 0;
  return { next: () => ++count, peek: () => count };
}
const counter = makeCounter();
counter.next();
counter.next();
console.log("counter after two next():", counter.peek());

// 2. A bank account via class with #private fields
class Account {
  #balance = 0;
  deposit(amount) {
    if (amount <= 0) throw new Error("deposit must be positive");
    this.#balance += amount;
    return this;
  }
  get balance() {
    return this.#balance;
  }
}

const acct = new Account().deposit(50).deposit(25);
console.log("account balance:", acct.balance);
