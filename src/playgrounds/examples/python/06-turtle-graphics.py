# turtle works here! It is a pure-Python implementation that renders your
# drawing as an image below the output instead of animating a window.
# (The real turtle needs tkinter, which cannot exist inside the browser.)
import turtle

t = turtle.Turtle()
t.speed(0)          # accepted and ignored — there is no animation to speed up
t.pensize(2)

colors = ["crimson", "orange", "gold", "seagreen", "steelblue", "purple"]

# A spirograph: 60 squares, each rotated a little further around.
for i in range(60):
    t.pencolor(colors[i % len(colors)])
    for _ in range(4):
        t.forward(120)
        t.right(90)
    t.right(6)

t.penup()
t.goto(0, -170)
t.pencolor("black")
t.write("Hello from turtle", align="center", font=("Arial", 16, "bold"))
t.hideturtle()

print("Drew", 60 * 4, "line segments.")
