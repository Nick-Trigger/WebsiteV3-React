# Generators make lazy infinite sequences easy.
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print("First 15 Fibonacci numbers:")
print(", ".join(str(next(fib)) for _ in range(15)))

# The golden ratio falls out of the sequence:
import itertools
pairs = list(itertools.islice(fibonacci(), 30, 32))
print(f"\nGolden ratio approximation: {pairs[1] / pairs[0]:.10f}")
s