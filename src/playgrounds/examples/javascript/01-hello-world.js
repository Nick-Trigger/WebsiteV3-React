// Your code runs inside QuickJS — a separate JavaScript VM compiled to
// WebAssembly. It has no access to this page, the DOM, or the network.
console.log("Hello from a sandboxed JavaScript VM!");

const facts = ["no DOM", "no fetch", "no cookies", "just the language"];
console.log("In here there is:", facts.join(", "));
