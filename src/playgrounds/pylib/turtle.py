"""turtle — a browser-friendly stand-in for the standard library module.

CPython's ``turtle`` drives a Tk canvas, and Pyodide ships no Tcl/Tk, so
``import turtle`` normally fails with ModuleNotFoundError in the browser.
This module implements the same classic API in pure Python: instead of
animating a canvas it records every stroke and renders the finished picture
as an SVG image, which the playground displays beneath the program's output.

Differences from the standard module:
  * Drawing is not animated. The completed picture appears when the program
    finishes; ``speed()``, ``delay()``, ``tracer()`` and ``update()`` are
    accepted and ignored.
  * ``done()``, ``mainloop()`` and ``exitonclick()`` return immediately.
  * There is no event loop, so ``onkey``, ``onclick``, ``ontimer`` and
    friends accept their arguments and do nothing.
  * ``undo()`` is not supported (the stroke history is append-only).

Everything else — pen state, fills, ``circle()``, ``dot()``, ``stamp()``,
``write()``, multiple ``Turtle()`` instances, ``Screen()`` — behaves as you
would expect.
"""

import math
import re

__all__ = []  # populated at the bottom

# --------------------------------------------------------------------------
# Limits. A runaway loop can emit strokes far faster than anything can be
# displayed, so recording stops at a sane ceiling rather than growing until
# the tab runs out of memory.
# --------------------------------------------------------------------------
_MAX_ITEMS = 40_000

_DEFAULT_WIDTH = 600
_DEFAULT_HEIGHT = 450

# Classic turtle cursor outline, pointing east, in turtle units.
_CURSOR_SHAPE = ((0.0, 0.0), (-10.0, 5.0), (-7.0, 0.0), (-10.0, -5.0))

# --------------------------------------------------------------------------
# Colour handling
#
# Colours end up inside SVG attributes, so they are validated rather than
# interpolated blindly: a bare CSS colour name (letters only) or a #rrggbb /
# #rgb literal. Anything else falls back to black. That makes it impossible
# for a colour string to carry quotes, angle brackets or whitespace into the
# generated markup.
# --------------------------------------------------------------------------
_NAME_RE = re.compile(r"[a-z]{3,24}\Z")
_HEX_RE = re.compile(r"#(?:[0-9a-f]{3}|[0-9a-f]{6})\Z")


def _to_css_color(value, default="black"):
    """Normalise a turtle colour into something safe to put in SVG."""
    if value is None:
        return default
    if isinstance(value, (tuple, list)):
        if len(value) != 3:
            return default
        # colormode(1.0) uses floats in 0..1; colormode(255) uses ints.
        scale = 255.0 if _screen()._colormode == 1.0 else 1.0
        parts = []
        for component in value:
            try:
                n = int(round(float(component) * scale))
            except (TypeError, ValueError):
                return default
            parts.append(max(0, min(255, n)))
        return "#%02x%02x%02x" % tuple(parts)
    if not isinstance(value, str):
        return default
    text = value.strip().lower().replace(" ", "")
    if _HEX_RE.match(text) or _NAME_RE.match(text):
        return text
    return default


def _esc(text):
    """XML-escape text destined for the SVG document."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _num(value):
    """Format a coordinate compactly (SVG does not need full precision)."""
    rounded = round(float(value), 2)
    if rounded == int(rounded):
        return str(int(rounded))
    return str(rounded)


# --------------------------------------------------------------------------
# The recording canvas
# --------------------------------------------------------------------------
class _Canvas:
    """Collects drawing primitives in turtle coordinates (y grows upward)."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.width = _DEFAULT_WIDTH
        self.height = _DEFAULT_HEIGHT
        self.background = None
        self.items = []
        self.overflowed = False

    def add(self, item):
        if len(self.items) >= _MAX_ITEMS:
            self.overflowed = True
            return
        self.items.append(item)

    @property
    def empty(self):
        return not self.items and self.background is None


_canvas = _Canvas()


# --------------------------------------------------------------------------
# SVG rendering
# --------------------------------------------------------------------------
def _merge_lines(items):
    """Collapse runs of connected same-styled segments into polylines.

    A typical turtle program is one long continuous path, which would
    otherwise become thousands of individual <line> elements.
    """
    merged = []
    run = None  # [points, color, width]
    for item in items:
        if item[0] == "line":
            _, x1, y1, x2, y2, color, width = item
            if (
                run is not None
                and run[1] == color
                and run[2] == width
                and abs(run[0][-1][0] - x1) < 1e-9
                and abs(run[0][-1][1] - y1) < 1e-9
            ):
                run[0].append((x2, y2))
                continue
            if run is not None:
                merged.append(("path", run[0], run[1], run[2]))
            run = [[(x1, y1), (x2, y2)], color, width]
        else:
            if run is not None:
                merged.append(("path", run[0], run[1], run[2]))
                run = None
            merged.append(item)
    if run is not None:
        merged.append(("path", run[0], run[1], run[2]))
    return merged


def _bounds(items, width, height):
    """Viewport in SVG space, grown so nothing drawn is clipped away."""
    xs = [-width / 2.0, width / 2.0]
    ys = [-height / 2.0, height / 2.0]

    def note(x, y):
        xs.append(x)
        ys.append(-y)  # SVG y grows downward

    for item in items:
        kind = item[0]
        if kind == "path":
            for x, y in item[1]:
                note(x, y)
        elif kind == "poly":
            for x, y in item[1]:
                note(x, y)
        elif kind == "dot":
            _, x, y, radius, _ = item
            note(x + radius, y + radius)
            note(x - radius, y - radius)
        elif kind == "text":
            note(item[1], item[2])
    margin = 12.0
    min_x, max_x = min(xs) - margin, max(xs) + margin
    min_y, max_y = min(ys) - margin, max(ys) + margin
    return min_x, min_y, max(1.0, max_x - min_x), max(1.0, max_y - min_y)


def _render_svg():
    """Render everything recorded so far into a standalone SVG document."""
    items = _merge_lines(_canvas.items)
    min_x, min_y, box_w, box_h = _bounds(items, _canvas.width, _canvas.height)

    out = [
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'viewBox="%s %s %s %s" width="%s" height="%s">'
        % (
            _num(min_x),
            _num(min_y),
            _num(box_w),
            _num(box_h),
            _num(box_w),
            _num(box_h),
        )
    ]
    background = _canvas.background or "white"
    out.append(
        '<rect x="%s" y="%s" width="%s" height="%s" fill="%s"/>'
        % (_num(min_x), _num(min_y), _num(box_w), _num(box_h), background)
    )

    for item in items:
        kind = item[0]
        if kind == "path":
            _, points, color, width = item
            coords = " ".join("%s,%s" % (_num(x), _num(-y)) for x, y in points)
            out.append(
                '<polyline points="%s" fill="none" stroke="%s" stroke-width="%s" '
                'stroke-linecap="round" stroke-linejoin="round"/>'
                % (coords, color, _num(width))
            )
        elif kind == "poly":
            _, points, fill, outline, width = item
            coords = " ".join("%s,%s" % (_num(x), _num(-y)) for x, y in points)
            stroke = (
                'stroke="%s" stroke-width="%s"' % (outline, _num(width))
                if outline
                else 'stroke="none"'
            )
            out.append('<polygon points="%s" fill="%s" %s/>' % (coords, fill, stroke))
        elif kind == "dot":
            _, x, y, radius, color = item
            out.append(
                '<circle cx="%s" cy="%s" r="%s" fill="%s"/>'
                % (_num(x), _num(-y), _num(radius), color)
            )
        elif kind == "text":
            _, x, y, text, color, anchor, size, family, weight, style = item
            out.append(
                '<text x="%s" y="%s" fill="%s" text-anchor="%s" '
                'font-family="%s" font-size="%s" font-weight="%s" font-style="%s">%s</text>'
                % (
                    _num(x),
                    _num(-y),
                    color,
                    anchor,
                    _esc(family),
                    _num(size),
                    weight,
                    style,
                    _esc(text),
                )
            )

    out.append("</svg>")
    return "".join(out)


# --------------------------------------------------------------------------
# Turtle
# --------------------------------------------------------------------------
class TurtleGraphicsError(Exception):
    """Standard turtle error type (kept for API compatibility)."""


class Turtle:
    """A pen that draws onto the shared canvas."""

    def __init__(self, shape="classic", undobuffersize=1000, visible=True):
        self._shape = shape
        self._visible = visible
        self.reset()

    # -- internal helpers --------------------------------------------------
    def _record(self, item):
        _canvas.add(item)

    def _goto(self, x, y):
        if self._down and self._pencolor:
            self._record(
                ("line", self._x, self._y, x, y, self._pencolor, self._pensize)
            )
        if self._filling:
            self._fillpath.append((x, y))
        self._x, self._y = x, y

    def _angle_to_radians(self, angle):
        return angle * math.tau / self._fullcircle

    # -- state -------------------------------------------------------------
    def reset(self):
        """Clear this turtle's drawing and send it home."""
        self.clear()
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0
        self._down = True
        self._pensize = 1
        self._pencolor = "black"
        self._fillcolor = "black"
        self._filling = False
        self._fillpath = []
        self._fullcircle = 360.0
        self._visible = True
        self._stretch = (1.0, 1.0)

    def clear(self):
        """Erase everything drawn so far (all turtles share one canvas)."""
        _canvas.items = []
        _canvas.overflowed = False

    # -- movement ----------------------------------------------------------
    def forward(self, distance):
        angle = self._angle_to_radians(self._heading)
        self._goto(
            self._x + distance * math.cos(angle), self._y + distance * math.sin(angle)
        )

    def backward(self, distance):
        self.forward(-distance)

    def right(self, angle):
        self._heading = (self._heading - angle) % self._fullcircle

    def left(self, angle):
        self._heading = (self._heading + angle) % self._fullcircle

    def goto(self, x, y=None):
        if y is None:
            x, y = x
        self._goto(float(x), float(y))

    def setx(self, x):
        self._goto(float(x), self._y)

    def sety(self, y):
        self._goto(self._x, float(y))

    def setheading(self, angle):
        self._heading = float(angle) % self._fullcircle

    def home(self):
        self.goto(0, 0)
        self.setheading(0)

    def circle(self, radius, extent=None, steps=None):
        """Draw a circular arc, matching the standard module's algorithm."""
        if extent is None:
            extent = self._fullcircle
        if steps is None:
            frac = abs(extent) / self._fullcircle
            steps = 1 + int(min(11 + abs(radius) / 6.0, 59.0) * frac)
        w = 1.0 * extent / steps
        w2 = 0.5 * w
        length = 2.0 * radius * math.sin(w2 * math.pi / 180.0 * (360.0 / self._fullcircle))
        if radius < 0:
            length, w, w2 = -length, -w, -w2
        self.left(w2)
        for _ in range(steps):
            self.forward(length)
            self.left(w)
        self.right(w2)

    def dot(self, size=None, *color):
        if size is None:
            size = max(self._pensize + 4, 2 * self._pensize)
        fill = self._pencolor
        if color:
            fill = _to_css_color(color[0] if len(color) == 1 else tuple(color))
        self._record(("dot", self._x, self._y, size / 2.0, fill))

    def stamp(self):
        """Leave an impression of the turtle at the current position."""
        self._record(
            (
                "poly",
                self._cursor_points(),
                self._fillcolor,
                self._pencolor,
                1,
            )
        )
        return None

    def undo(self):  # pragma: no cover - documented as unsupported
        raise TurtleGraphicsError(
            "undo() is not supported in the browser playground; the drawing "
            "history is append-only. Use reset() to start over."
        )

    # -- pen ---------------------------------------------------------------
    def penup(self):
        self._down = False

    def pendown(self):
        self._down = True

    def isdown(self):
        return self._down

    def pensize(self, width=None):
        if width is None:
            return self._pensize
        self._pensize = max(0.1, float(width))
        return None

    def pen(self, pen=None, **kwargs):
        settings = dict(pen or {})
        settings.update(kwargs)
        if not settings:
            return {
                "shown": self._visible,
                "pendown": self._down,
                "pencolor": self._pencolor,
                "fillcolor": self._fillcolor,
                "pensize": self._pensize,
            }
        if "pendown" in settings:
            self._down = bool(settings["pendown"])
        if "shown" in settings:
            self._visible = bool(settings["shown"])
        if "pensize" in settings:
            self.pensize(settings["pensize"])
        if "pencolor" in settings:
            self.pencolor(settings["pencolor"])
        if "fillcolor" in settings:
            self.fillcolor(settings["fillcolor"])
        return None

    # -- colour ------------------------------------------------------------
    def pencolor(self, *args):
        if not args:
            return self._pencolor
        self._pencolor = _to_css_color(args[0] if len(args) == 1 else tuple(args))
        return None

    def fillcolor(self, *args):
        if not args:
            return self._fillcolor
        self._fillcolor = _to_css_color(args[0] if len(args) == 1 else tuple(args))
        return None

    def color(self, *args):
        if not args:
            return self._pencolor, self._fillcolor
        if len(args) == 1:
            self._pencolor = self._fillcolor = _to_css_color(args[0])
        elif len(args) == 2:
            self._pencolor = _to_css_color(args[0])
            self._fillcolor = _to_css_color(args[1])
        else:
            self._pencolor = self._fillcolor = _to_css_color(tuple(args))
        return None

    def begin_fill(self):
        self._filling = True
        self._fillpath = [(self._x, self._y)]

    def end_fill(self):
        if self._filling and len(self._fillpath) > 2:
            self._record(("poly", list(self._fillpath), self._fillcolor, None, 0))
        self._filling = False
        self._fillpath = []

    def filling(self):
        return self._filling

    # -- text --------------------------------------------------------------
    def write(self, arg, move=False, align="left", font=("Arial", 8, "normal")):
        family, size, styles = "Arial", 8, ""
        if isinstance(font, (tuple, list)):
            if len(font) > 0:
                family = str(font[0])
            if len(font) > 1:
                try:
                    size = float(font[1])
                except (TypeError, ValueError):
                    size = 8
            if len(font) > 2:
                styles = str(font[2]).lower()
        # Only letters survive into the SVG font-family attribute.
        family = re.sub(r"[^A-Za-z ]", "", family) or "Arial"
        weight = "bold" if "bold" in styles else "normal"
        style = "italic" if "italic" in styles else "normal"
        anchor = {"left": "start", "center": "middle", "right": "end"}.get(
            str(align).lower(), "start"
        )
        text = str(arg)
        self._record(
            (
                "text",
                self._x,
                self._y,
                text,
                self._pencolor,
                anchor,
                size,
                family,
                weight,
                style,
            )
        )
        if move:
            # Approximate the advance width; the real module measures the font.
            self._goto(self._x + len(text) * size * 0.6, self._y)

    # -- queries -----------------------------------------------------------
    def position(self):
        return (self._x, self._y)

    pos = position

    def xcor(self):
        return self._x

    def ycor(self):
        return self._y

    def heading(self):
        return self._heading

    def distance(self, x, y=None):
        if hasattr(x, "position"):
            x, y = x.position()
        elif y is None:
            x, y = x
        return math.hypot(x - self._x, y - self._y)

    def towards(self, x, y=None):
        if hasattr(x, "position"):
            x, y = x.position()
        elif y is None:
            x, y = x
        angle = math.atan2(y - self._y, x - self._x)
        return (angle / math.tau * self._fullcircle) % self._fullcircle

    # -- angle units -------------------------------------------------------
    def degrees(self, fullcircle=360.0):
        self._heading = self._heading * fullcircle / self._fullcircle
        self._fullcircle = float(fullcircle)

    def radians(self):
        self.degrees(math.tau)

    # -- appearance --------------------------------------------------------
    def hideturtle(self):
        self._visible = False

    def showturtle(self):
        self._visible = True

    def isvisible(self):
        return self._visible

    def shape(self, name=None):
        if name is None:
            return self._shape
        self._shape = name
        return None

    def shapesize(self, stretch_wid=None, stretch_len=None, outline=None):
        if stretch_wid is None and stretch_len is None:
            return self._stretch + (1,)
        if stretch_wid is not None and stretch_len is None:
            stretch_len = stretch_wid
        self._stretch = (float(stretch_wid or 1.0), float(stretch_len or 1.0))
        return None

    turtlesize = shapesize

    def tilt(self, angle):
        self.left(0)  # tilt only affects the cursor drawing, which we ignore

    def _cursor_points(self):
        angle = self._angle_to_radians(self._heading)
        cos_a, sin_a = math.cos(angle), math.sin(angle)
        sw, sl = self._stretch
        points = []
        for px, py in _CURSOR_SHAPE:
            px, py = px * sl, py * sw
            points.append(
                (self._x + px * cos_a - py * sin_a, self._y + px * sin_a + py * cos_a)
            )
        return points

    # -- ignored animation controls ---------------------------------------
    def speed(self, value=None):
        return 0 if value is None else None

    def delay(self, value=None):
        return 0 if value is None else None

    def getscreen(self):
        return _screen()

    def getturtle(self):
        return self

    getpen = getturtle


# Pen is the historical alias for Turtle.
Pen = Turtle
RawTurtle = Turtle
RawPen = Turtle


# --------------------------------------------------------------------------
# Screen
# --------------------------------------------------------------------------
class _Screen:
    """The drawing surface. A single shared instance, as in the real module."""

    def __init__(self):
        self._colormode = 1.0

    # -- geometry ----------------------------------------------------------
    def setup(self, width=None, height=None, startx=None, starty=None):
        if isinstance(width, (int, float)) and width > 1:
            _canvas.width = float(width)
        if isinstance(height, (int, float)) and height > 1:
            _canvas.height = float(height)

    def screensize(self, canvwidth=None, canvheight=None, bg=None):
        if canvwidth is None and canvheight is None and bg is None:
            return (_canvas.width, _canvas.height)
        if canvwidth:
            _canvas.width = float(canvwidth)
        if canvheight:
            _canvas.height = float(canvheight)
        if bg:
            self.bgcolor(bg)
        return None

    def window_width(self):
        return _canvas.width

    def window_height(self):
        return _canvas.height

    def bgcolor(self, *args):
        if not args:
            return _canvas.background or "white"
        _canvas.background = _to_css_color(
            args[0] if len(args) == 1 else tuple(args), default="white"
        )
        return None

    def colormode(self, cmode=None):
        if cmode is None:
            return self._colormode
        if cmode in (1, 1.0, 255):
            self._colormode = 1.0 if cmode != 255 else 255
        return None

    def mode(self, mode=None):
        return "standard" if mode is None else None

    def clear(self):
        _canvas.reset()

    clearscreen = clear

    def reset(self):
        _canvas.reset()
        _default_turtle().reset()

    resetscreen = reset

    def title(self, title_string=""):
        return None

    # -- no-ops: there is no event loop or animation in the sandbox --------
    def tracer(self, n=None, delay=None):
        return 0 if n is None else None

    def update(self):
        return None

    def delay(self, delay=None):
        return 0 if delay is None else None

    def listen(self, *args, **kwargs):
        return None

    def onkey(self, fun=None, key=None):
        return None

    onkeypress = onkey
    onkeyrelease = onkey

    def onclick(self, fun=None, btn=1, add=None):
        return None

    onscreenclick = onclick

    def ontimer(self, fun=None, t=0):
        return None

    def textinput(self, title, prompt):
        return None

    def numinput(self, title, prompt, default=None, minval=None, maxval=None):
        return default

    def mainloop(self):
        return None

    done = mainloop

    def exitonclick(self):
        return None

    def bye(self):
        return None

    def register_shape(self, name, shape=None):
        return None

    addshape = register_shape

    def turtles(self):
        return [_default_turtle()]


_screen_instance = _Screen()
_default_turtle_instance = None


def _screen():
    return _screen_instance


def _default_turtle():
    global _default_turtle_instance
    if _default_turtle_instance is None:
        _default_turtle_instance = Turtle()
    return _default_turtle_instance


def Screen():
    """Return the singleton screen, as the standard module does."""
    return _screen_instance


def getscreen():
    return _screen_instance


def getturtle():
    return _default_turtle()


getpen = getturtle


# --------------------------------------------------------------------------
# Module-level API
#
# The standard module exposes every Turtle method as a bare function that
# operates on one implicit turtle, plus the Screen methods. Those wrappers
# are generated here rather than written out one by one.
# --------------------------------------------------------------------------
_TURTLE_METHODS = (
    "forward fd backward bk back right rt left lt goto setpos setposition setx sety "
    "setheading seth home circle dot stamp undo penup pu up pendown pd down isdown "
    "pensize width pen pencolor fillcolor color begin_fill end_fill filling write "
    "position pos xcor ycor heading distance towards degrees radians hideturtle ht "
    "showturtle st isvisible shape shapesize turtlesize tilt speed clear reset"
).split()

_TURTLE_ALIASES = {
    "fd": "forward",
    "bk": "backward",
    "back": "backward",
    "rt": "right",
    "lt": "left",
    "setpos": "goto",
    "setposition": "goto",
    "seth": "setheading",
    "pu": "penup",
    "up": "penup",
    "pd": "pendown",
    "down": "pendown",
    "width": "pensize",
    "pos": "position",
    "ht": "hideturtle",
    "st": "showturtle",
    "turtlesize": "shapesize",
}

_SCREEN_METHODS = (
    "setup screensize window_width window_height bgcolor colormode mode clearscreen "
    "resetscreen title tracer update listen onkey onkeypress onkeyrelease onclick "
    "onscreenclick ontimer textinput numinput mainloop done exitonclick bye "
    "register_shape addshape turtles delay"
).split()


def _make_turtle_function(name):
    target = _TURTLE_ALIASES.get(name, name)

    def wrapper(*args, **kwargs):
        return getattr(_default_turtle(), target)(*args, **kwargs)

    wrapper.__name__ = name
    wrapper.__qualname__ = name
    wrapper.__doc__ = getattr(Turtle, target).__doc__
    return wrapper


def _make_screen_function(name):
    def wrapper(*args, **kwargs):
        return getattr(_screen_instance, name)(*args, **kwargs)

    wrapper.__name__ = name
    wrapper.__qualname__ = name
    wrapper.__doc__ = getattr(_Screen, name).__doc__
    return wrapper


for _name in _TURTLE_METHODS:
    globals()[_name] = _make_turtle_function(_name)
    __all__.append(_name)

for _name in _SCREEN_METHODS:
    if _name not in globals():
        globals()[_name] = _make_screen_function(_name)
        __all__.append(_name)

__all__ += [
    "Turtle",
    "Pen",
    "RawTurtle",
    "RawPen",
    "Screen",
    "getscreen",
    "getturtle",
    "getpen",
    "TurtleGraphicsError",
]

del _name


# --------------------------------------------------------------------------
# Playground integration
#
# The worker calls these between runs. They are deliberately prefixed so they
# never collide with the public turtle API.
# --------------------------------------------------------------------------
def _playground_reset():
    """Drop all recorded drawing state before a new run."""
    global _default_turtle_instance
    _canvas.reset()
    _screen_instance._colormode = 1.0
    _default_turtle_instance = None


def _playground_has_drawing():
    return not _canvas.empty


def _playground_render():
    """Return the finished drawing as an SVG document, cursor included."""
    turtle = _default_turtle_instance
    if turtle is not None and turtle.isvisible() and _canvas.items:
        _canvas.add(
            ("poly", turtle._cursor_points(), turtle._fillcolor, turtle._pencolor, 1)
        )
    svg = _render_svg()
    if _canvas.overflowed:
        print(
            "[turtle] drawing truncated after %d strokes" % _MAX_ITEMS,
        )
    return svg
