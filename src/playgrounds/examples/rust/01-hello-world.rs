// Hello User!
// This is a simple Rust program. No Rust compiler runs inside a browser, so this code
// is sent over HTTPS to the Compiler Explorer sandbox (godbolt.org), compiled there
// with rustc, and only the text output comes back, nothing runs on your machine.
// Because the code does leave your machine, DO NOT PASTE ANYTHING PRIVATE IN HERE.
// You can edit this code, try an example above, or write your own Rust code in the editor below.

fn main() {
    println!("Hello from Rust, compiled on a remote sandbox!");
    println!("Architecture: {}", std::env::consts::ARCH);
    println!("Operating system: {}", std::env::consts::OS);

    // Iterators are the idiomatic way to work with sequences:
    let squares: Vec<u32> = (1..=5).map(|n| n * n).collect();
    println!("Squares: {squares:?}");
}
