// Hello!
// This is a simple C program. No C compiler runs inside a browser, so this code is
// sent over HTTPS to the Compiler Explorer sandbox (godbolt.org), compiled there
// with GCC, and only the text output comes back. Nothing runs on your machine.
// Because the code does leave your machine, DO NOT PASTE ANYTHING PRIVATE IN HERE.
// You can edit this code, try an example above, or write your own C code here in the editor.
#include <stdio.h>

int main(void) {
    printf("Hello from C, compiled on a remote sandbox!\n");
    printf("Compiler: GCC %d.%d.%d\n", __GNUC__, __GNUC_MINOR__, __GNUC_PATCHLEVEL__);
    printf("C standard: %ld\n", __STDC_VERSION__);
    return 0;
}
