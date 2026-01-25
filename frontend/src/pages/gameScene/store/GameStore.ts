import { makeAutoObservable } from "mobx";
import type { GameResponseDto } from "../../../../generated/api";

type GameStore = {
  game: GameResponseDto | null;
  setGame: (game: GameResponseDto) => void;
};
const gameStore = makeAutoObservable<GameStore>({
  game: null,
  setGame: (game: GameResponseDto) => {
    gameStore.game = game;
  },
});

export default gameStore;
