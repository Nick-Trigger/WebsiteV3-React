// A classic first program — with a bit of modern C++.
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::cout << "Hello from C++!\n\n";

    const std::vector<std::string> features = {
        "auto type deduction", "range-based for", "lambdas", "structured bindings",
    };
    for (const auto& f : features) {
        std::cout << " - " << f << '\n';
    }

    auto square = [](int x) { return x * x; };
    std::cout << "\nsquare(12) = " << square(12) << '\n';
    return 0;
}
