// A classic first program — plus a look at C's fixed-width types.
#include <stdio.h>
#include <stdint.h>

int main(void) {
    printf("Hello from C!\n\n");
    printf("sizeof(char)     = %zu byte\n", sizeof(char));
    printf("sizeof(int)      = %zu bytes\n", sizeof(int));
    printf("sizeof(long)     = %zu bytes\n", sizeof(long));
    printf("sizeof(double)   = %zu bytes\n", sizeof(double));
    printf("sizeof(int64_t)  = %zu bytes\n", sizeof(int64_t));
    printf("sizeof(void *)   = %zu bytes\n", sizeof(void *));
    return 0;
}
