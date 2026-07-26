// Hello User!
// This is a simple JavaScript program that runs entirely in your browser, inside a
// QuickJS virtual machine compiled to WebAssembly, not in the page itself.
// You can edit this code, try an example above, or write your own JavaScript code here in the editor.

console.log("Hello from JavaScript running entirely in your browser!");

// The VM is the bare language. Every ECMAScript builtin is here, but there is
// no browser wrapped around it, so none of these exist:
console.log("typeof window:  ", typeof window);
console.log("typeof document:", typeof document);
console.log("typeof fetch:   ", typeof fetch);
