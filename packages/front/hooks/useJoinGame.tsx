import { fetchAPI } from "helpers/fetcher";
import { nanoid } from "nanoid";
import Cookies from "js-cookie";
import { useSWRConfig } from "swr";
import { positions, useGameInstance, usePlayerId } from "./GameContext";
import { randomFreeCoordinate } from "models/board";
import { Player } from "types/game";
import {
  DEFAULT_ACTION_POINTS,
  DEFAULT_LIVES,
  DEFAULT_RANGE,
} from "../constants";
import { useSnapshot } from "valtio";

export const useJoinGame = (id?: string) => {
  const { mutate } = useSWRConfig();
  const { id: gameId, order } = useGameInstance();
  const positionSnap = useSnapshot(positions);

  const { setPlayerId } = usePlayerId();
  const playerId = id || nanoid();

  return async () => {
    const position = randomFreeCoordinate(positionSnap);
    positions[position] = playerId;

    const player: Player = {
      position,
      id: playerId,
      lives: DEFAULT_LIVES,
      range: DEFAULT_RANGE,
      actionPoints: DEFAULT_ACTION_POINTS,
    };

    setPlayerId(playerId);

    fetchAPI(`/api/join?playerId=${playerId}&gameId=${gameId}`, {
      method: "POST",
      data: {
        ...player,
        order: [...order, playerId].sort(() => Math.random() - 0.5),
      },
    });

    Cookies.set(gameId, playerId);
    await mutate(`/api/game?id=${gameId}`);
    await mutate(`/api/player?playerId=${playerId}&gameId=${gameId}`);
  };
};
