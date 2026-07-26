# No graphics needed — draw with math and characters.
import math

WIDTH, HEIGHT = 60, 22

print("A sine wave:\n")
for row in range(HEIGHT):
    y = 1 - 2 * row / (HEIGHT - 1)  # +1 (top) .. -1 (bottom)
    line = ""
    for col in range(WIDTH):
        x = 4 * math.pi * col / (WIDTH - 1)
        line += "#" if abs(math.sin(x) - y) < 0.12 else " "
    print(line)
