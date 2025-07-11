import { FC, useEffect, useRef } from "react";
import { Message } from "../types/data";
import { useSelector } from "react-redux";
import { storeType } from "../types/store";
import axios from "axios";
import { PaperClipIcon } from "../assets/Icons";

interface MessagesBox {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  selectedContact: string;
}

const MessagesBox: FC<MessagesBox> = ({
  messages,
  setMessages,
  selectedContact,
}) => {
  const { user } = useSelector((state: storeType) => state.auth);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const getMessageHistory = async (id: string) => {
      try {
        const response = await axios.get(`messages/${id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    if (selectedContact) {
      getMessageHistory(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    const div = lastMessageRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="relative h-full">
      <div className="w-full overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
        {messages.length === 0 && (
          <div className="text-center bg-gray-300 shadow-xl rounded py-1 text-emerald-600">
            Send A message to start your conversation
          </div>
        )}
        {Array.from(
          new Map(
            messages?.map((message) => [JSON.stringify(message), message])
          ).values()
        ).map((message) => (
          <div
            key={message.message + message._id}
            className={`w-full my-2 ${
              message.sender === user ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[70%] p-2 rounded-md text-sm font-medium ${
                message.sender === user
                  ? "text-right bg-emerald-600 text-white"
                  : "bg-indigo-100 text-gray-950"
              }`}
            >
              {message.message}
              {message.file && (
                <div>
                  <a
                    target="_blank"
                    href={axios.defaults.baseURL + "/uploads/" + message.file}
                    className="flex items-center border-b gap-1"
                  >
                    <PaperClipIcon className={"size-4"} />
                    {message.file}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={lastMessageRef}></div>
      </div>
    </div>
  );
};

export default MessagesBox;
