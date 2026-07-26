// The Collatz conjecture: every positive integer reaches 1... probably.
#include <stdio.h>

int steps(unsigned long long n) {
    int count = 0;
    while (n != 1) {
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
        count++;
    }
    return count;
}

int main(void) {
    unsigned long long longest_n = 1;
    int longest = 0;
    for (unsigned long long n = 1; n <= 10000; n++) {
        int s = steps(n);
        if (s > longest) {
            longest = s;
            longest_n = n;
        }
    }
    printf("Longest Collatz chain below 10000:\n");
    printf("n = %llu takes %d steps to reach 1\n", longest_n, longest);
    return 0;
}
