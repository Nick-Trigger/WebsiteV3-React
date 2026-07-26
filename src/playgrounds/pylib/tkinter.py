"""tkinter — unavailable in the browser sandbox.

Pyodide has no Tcl/Tk build and a Web Worker has no display, so the real
tkinter cannot work here. This stub exists only so that ``import tkinter``
explains the situation instead of raising a bare ModuleNotFoundError.

If you are here because of turtle graphics: ``import turtle`` *does* work in
this playground. It is a pure-Python implementation that renders your drawing
as an image below the output rather than animating a window.
"""

raise ImportError(
    "tkinter is not available in this browser playground — it needs Tcl/Tk "
    "and a display, and neither exists inside the WebAssembly sandbox.\n"
    "  * For turtle graphics: 'import turtle' works here (drawings render as "
    "an image below the output).\n"
    "  * For plots and charts: use matplotlib.\n"
    "  * For text-based interaction: print() and input() both work."
)
