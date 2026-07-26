#[derive(Debug)]
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
}

fn area(shape: &Shape) -> f64 {
    // `match` must handle every variant.
    match shape {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle { radius: 1.5 },
        Shape::Rectangle { width: 3.0, height: 4.0 },
    ];

    for shape in &shapes {
        println!("{shape:?} has area {:.2}", area(shape));
    }

    let total: f64 = shapes.iter().map(area).sum();
    println!("total area: {total:.2}");
}
