import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { z } from "zod";

interface ChatMessage {
  user: string;
  message: string;
}

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

const messages: ChatMessage[] = [
  { user: "Kris", message: "Hello" },
  { user: "Nils", message: "hi" },
];

const appRouter = t.router({
  hello: t.procedure.query((req) => {
    return "Hello world I";
  }),
  getMessages: t.procedure.input(z.number().default(10)).query(({ input }) => {
    return messages.slice(-input);
  }),
  addMessage: t.procedure
    .input(z.object({ user: z.string(), message: z.string() }))
    .mutation(({ input }) => {
      messages.push(input);
    }),
});

export type AppRouter = typeof appRouter;

const app = express();
const port = 8080;

app.use(cors());
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(port, () => {
  console.log(`api-server listening at http://localhost:${port}`);
});
