import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as SocketServer } from "socket.io";

import { SocketIoApiResponse } from "@/types/app";

const ioHandler = (req: NextApiRequest, res: SocketIoApiResponse) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketServer(httpServer, {
      path: path,
      // @ts-ignore
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
