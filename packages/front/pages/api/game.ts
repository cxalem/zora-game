import { NextApiRequest, NextApiResponse } from "next";
import { createGame, getGame } from "transports/game.transport";
import { getPlayers } from "transports/player.transport";

import { Coordinate, isCoordinate } from "types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    res.status(201).json({});
  }

  if (req.method === "GET") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing id" });
    }
    const game = await getGame(id);
    const players = await getPlayers(id, game.players);
    const positions = Object.entries(players).reduce(
      (acc, [playerId, playerData]) => {
        acc[playerData.position] = playerId;
        return acc;
      },
      {} as Record<Coordinate, string>
    );

    res.status(200).json({
      game,
      players,
      positions,
    });
  }

  if (req.method === "POST") {
    const gameId = await createGame();
    res.status(200).json({ id: gameId });
  }

  if (req.method === "DELETE") {
    res.status(204).json({});
  }
}
