import React, { useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./trpc";

import "./index.scss";
import { httpBatchLink } from "@trpc/client";

const AppContent = () => {
  const [inputValue, setInputValue] = useState({
    user: "",
    message: "",
  });

  const handleChange = (evt: any) => {
    const value = evt.target.value;
    setInputValue({
      ...inputValue,
      [evt.target.name]: value,
    });
  };

  const clearInputState = () => {
    setInputValue({ user: "", message: "" });
  };

  const hello = trpc.hello.useQuery();
  const getMessages = trpc.getMessages.useQuery();

  const addMessage = trpc.addMessage.useMutation();
  const onAdd = () => {
    addMessage.mutate(
      {
        message: inputValue.message,
        user: inputValue.user,
      },
      {
        onSuccess: () => {
          getMessages.refetch();
        },
      }
    );
    clearInputState();
  };

  return (
    <div className="flex flex-col space-y-4 mt-10 text-2xl mx-auto max-w-6xl ">
      <div>{JSON.stringify(hello.data)}</div>

      {getMessages.data &&
        getMessages.data.map((row) => (
          <div
            className="overflow-hidden leading-normal rounded-lg"
            role="alert"
          >
            <p className="px-4 py-3 font-bold text-purple-100 bg-purple-800">
              {row.user}
            </p>
            <p className="px-4 py-3 text-purple-700 bg-purple-100 ">
              {row.message}
            </p>
          </div>
        ))}
      <form onSubmit={() => onAdd} className="flex flex-col space-y-3">
        <input
          onChange={handleChange}
          value={inputValue.user}
          name="user"
          placeholder="username"
          type="text"
          className="px-4 py-3"
        />
        <input
          onChange={handleChange}
          value={inputValue.message}
          name="message"
          placeholder="message"
          type="text"
          className="px-4 py-3"
        />
      </form>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        disabled={addMessage.isLoading}
        onClick={onAdd}
      >
        Add message
      </button>
      {addMessage.error && (
        <p>Something went wrong! {addMessage.error.message}</p>
      )}
    </div>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "http://localhost:8080/trpc" })],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));
