// A classic first program — with iterators doing the work.
fn main() {
    println!("Hello from Rust!\n");

    let sum_of_squares: u32 = (1..=10).map(|n| n * n).sum();
    println!("1² + 2² + … + 10² = {sum_of_squares}");

    let words = ["safe", "fast", "fearless"];
    let sentence = words.join(", ");
    println!("Rust is: {sentence}");
}
