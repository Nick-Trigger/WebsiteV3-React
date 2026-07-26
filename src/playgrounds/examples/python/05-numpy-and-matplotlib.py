# numpy and matplotlib are downloaded automatically on first use
# (from the Pyodide CDN the first run takes a few extra seconds).

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 4 * np.pi, 400)

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(x, np.sin(x), label="sin(x)")
ax.plot(x, np.sin(x) * np.exp(-x / 6), label="damped")
ax.set_title("Sine wave vs. damped sine wave")
ax.legend()
ax.grid(True, alpha=0.3)

print("numpy version:", np.__version__)
print("mean of sin(x):", float(np.mean(np.sin(x))))
