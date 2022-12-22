import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

const appRouter = t.router({
  hello: t.procedure.query((req) => {
    return "Hello world";
  }),
});

const app = express();
const port = 8080;

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
