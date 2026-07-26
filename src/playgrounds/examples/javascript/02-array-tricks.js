// Modern array methods, no loops required.
const nums = Array.from({ length: 20 }, (_, i) => i + 1);

console.log("numbers:", nums.join(" "));
console.log("evens:  ", nums.filter((n) => n % 2 === 0).join(" "));
console.log("squares:", nums.map((n) => n * n).join(" "));
console.log("sum:    ", nums.reduce((a, b) => a + b, 0));

// Group words by first letter with a plain reduce:
const words = ["apple", "avocado", "banana", "blueberry", "cherry"];
const grouped = words.reduce((acc, w) => {
  (acc[w[0]] ??= []).push(w);
  return acc;
}, {});
console.log("grouped:", JSON.stringify(grouped, null, 2));
