# Dataclasses + sorting: a tiny leaderboard.
from dataclasses import dataclass, field


@dataclass
class Player:
    name: str
    score: int
    badges: list[str] = field(default_factory=list)

    def __str__(self):
        tags = f" [{', '.join(self.badges)}]" if self.badges else ""
        return f"{self.name:<10} {self.score:>5}{tags}"


players = [
    Player("Ada", 3120, ["pioneer"]),
    Player("Grace", 2890, ["debugger"]),
    Player("Linus", 2440),
    Player("Guido", 3050, ["BDFL"]),
]

print("=== Leaderboard ===")
for rank, p in enumerate(sorted(players, key=lambda p: -p.score), start=1):
    print(f"{rank}. {p}")
