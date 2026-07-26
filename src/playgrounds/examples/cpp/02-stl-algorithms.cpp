// The STL does the heavy lifting: sort, filter, and accumulate.
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> nums = {42, 7, 19, 73, 3, 56, 28, 91, 12, 64};

    std::sort(nums.begin(), nums.end());
    std::cout << "sorted:  ";
    for (int n : nums) std::cout << n << ' ';
    std::cout << '\n';

    const int sum = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "sum:     " << sum << '\n';

    const auto evens = std::count_if(nums.begin(), nums.end(),
                                     [](int n) { return n % 2 == 0; });
    std::cout << "evens:   " << evens << '\n';

    const auto big = std::find_if(nums.begin(), nums.end(),
                                  [](int n) { return n > 50; });
    std::cout << "first > 50: " << *big << '\n';
    return 0;
}
