// Hello!
// This is a simple C++ program. No C++ compiler runs inside a browser, so this code is
// sent over HTTPS to the Compiler Explorer sandbox (godbolt.org), compiled there
// with G++ using -std=c++23, and only the text output comes back. Nothing runs on your machine.
// Because the code does leave your machine, DO NOT PASTE ANYTHING PRIVATE IN HERE.
// You can edit this code, try an example above, or create your own C++ code here in the editor.
#include <iostream>

int main() {
    std::cout << "Hello from C++, compiled on a remote sandbox!\n";
    std::cout << "Compiler: G++ " << __GNUC__ << '.' << __GNUC_MINOR__ << '.'
              << __GNUC_PATCHLEVEL__ << '\n';
    std::cout << "C++ standard: " << __cplusplus << '\n';
    return 0;
}
