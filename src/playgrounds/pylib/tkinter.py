raise ImportError(
    "tkinter is not available in this sandbox; it needs Tcl/Tk "
    "and a display, and neither exists inside the WebAssembly sandbox.\n"
    "  * For turtle graphics: 'import turtle' works here (drawings render as "
    "an image below the output).\n"
    "  * For plots and charts: use matplotlib.\n"
    "  * For text-based interaction: print() and input() both work."
)
