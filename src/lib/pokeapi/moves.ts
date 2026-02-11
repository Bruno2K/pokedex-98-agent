/** Um item de move na resposta da API. */
export interface RawMoveEntry {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
  }[];
}

const MAX_MAIN_MOVES = 8;
const PREFERRED_METHOD = "level-up";

/** Escolhe até 4–8 moves principais: level-up primeiro, ordenados por nível. */
export function pickMainMoves(moves: RawMoveEntry[]): RawMoveEntry[] {
  const byLevel = moves
    .filter((m) =>
      m.version_group_details.some((d) => d.move_learn_method.name === PREFERRED_METHOD)
    )
    .map((m) => {
      const levelDetail = m.version_group_details.find(
        (d) => d.move_learn_method.name === PREFERRED_METHOD
      );
      return { entry: m, level: levelDetail?.level_learned_at ?? 999 };
    })
    .sort((a, b) => a.level - b.level)
    .map((x) => x.entry);

  const rest = moves.filter(
    (m) => !m.version_group_details.some((d) => d.move_learn_method.name === PREFERRED_METHOD)
  );

  const combined = [...byLevel, ...rest];
  return combined.slice(0, MAX_MAIN_MOVES);
}
