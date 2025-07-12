import {
  // ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Message, MessageData, User } from "../types/data";
import { useSelector } from "react-redux";
import { storeType } from "../types/store";
import {
  PaperClipIcon,
  RemoveIcon,
  SendIcon,
  UserIcon,
  AddIcon,
} from "../assets/Icons";
import ContactCard from "../components/ContactCard";
import MessagesBox from "../components/MessagesBox";
import axios from "axios";
import { logout } from "../store/authActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ActionCard from "../components/ActionCard";

const Chat = () => {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<{
    friends: User[];
    pending: User[];
    requests: User[];
  }>({ friends: [], pending: [], requests: [] });
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { user, name } = useSelector((state: storeType) => state.auth);
  const selectedContactRef = useRef<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    connectWS();
  }, []);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  function connectWS() {
    const host = import.meta.env.VITE_WebSocket_URL;
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    const connection = new WebSocket(`${protocol}://${host}`);

    setConnection(connection);
    connection?.addEventListener("message", handleMessage);
    connection?.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect...");
        connectWS();
      }, 1000);
    });
  }

  function showOnlineUsers(users: User[]) {
    const onlineUsers: User[] = Array.from(
      new Map(users?.map((user) => [JSON.stringify(user), user])).values()
    ).filter((onlineUser) => onlineUser.userId !== user);

    setOnlineUsers(onlineUsers);
  }

  function handleMessage(e: MessageEvent) {
    const messageData: MessageData = JSON.parse(e.data);
    if (messageData.online) {
      showOnlineUsers(messageData?.online);
    }
    if (messageData?.message) {
      if (messageData?.sender === selectedContactRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: messageData.id,
            message: messageData?.message as string,
            sender: messageData.sender,
          },
        ]);
      }
    }
  }

  useEffect(() => {
    async function getFriends() {
      try {
        const response = await axios.get("/users/friends");
        setFriends({
          friends: response.data.friends,
          pending: response.data.pending,
          requests: response.data.requests,
        });
      } catch (error) {
        console.log(error);
      }
    }
    getFriends();
  }, [onlineUsers]);

  function sendMessage(
    e: FormEvent | null,
    file: { name: string; data: string | ArrayBuffer | null } | null = null
  ) {
    if (e) e.preventDefault();
    connection?.send(
      JSON.stringify({
        recipient: selectedContact,
        message: newMessage,
        file,
      })
    );
    setMessages((prev) => [
      ...prev,
      {
        message: newMessage,
        recipient: selectedContact as string,
        sender: user,
        _id: Date.now() + "",
      },
    ]);
    if (file && selectedContact) {
      const getMessageHistory = async (id: string) => {
        try {
          const response = await axios.get(`messages/${id}`);
          setMessages(response.data);
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      };
      getMessageHistory(selectedContact);
    }
    setNewMessage("");
  }

  function handleLogout() {
    setConnection(null);
    dispatch(logout());
  }

  function sendFile() {
    // e: ChangeEvent<HTMLInputElement>
    alert("this feature isn't availble in production");
    // const reader = new FileReader();
    // const files = e.target.files;
    // if (files) {
    //   reader.readAsDataURL(files[0]);
    //   reader.onload = () => {
    //     sendMessage(null, {
    //       name: files[0].name,
    //       data: reader.result,
    //     });
    //   };
    // }
  }

  async function addFriend(id: string) {
    try {
      if (id === user) return;
      const response = await axios.get(`/users/friend/add/${id}`);
      setFriends((prev) => ({ ...prev, ...response.data.friends }));
    } catch (error) {
      console.log(error);
    }
  }

  async function removeRequest(id: string) {
    try {
      if (id === user) return;
      const response = await axios.get(`/users/friend/request/${id}`);
      setFriends((prev) => ({ ...prev, ...response.data.friends }));
    } catch (error) {
      console.log(error);
    }
  }

  async function removeSentRequest(id: string) {
    try {
      if (id === user) return;
      const response = await axios.get(`/users/friend/request/sent/${id}`);
      setFriends((prev) => ({ ...prev, ...response.data.friends }));
    } catch (error) {
      console.log(error);
    }
  }

  async function acceptRequest(id: string) {
    try {
      if (id === user) return;
      const response = await axios.get(`/users/friend/accept/${id}`);
      setFriends((prev) => ({ ...prev, ...response.data.friends }));
    } catch (error) {
      console.log(error);
    }
  }

  async function removeFriend(id: string) {
    try {
      if (id === user) return;
      const response = await axios.get(`/users/friend/remove/${id}`);
      setFriends((prev) => ({ ...prev, ...response.data.friends }));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="sm:flex h-screen">
      <div
        className={`bg-white pl-4 py-4 h-full flex-col ${
          selectedContact ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="flex-grow flex flex-col">
          <Header />
          <SearchBar addFriend={addFriend} friends={friends} />

          <div className="flex-grow">
            <h2 className="my-2 underline">Friends:</h2>
            {onlineUsers
              .filter((user) =>
                friends.friends.some((friend) => user.userId === friend.userId)
              )
              .map(({ userId, name }) => (
                <ContactCard
                  key={userId}
                  id={userId}
                  onClick={setSelectedContact}
                  name={name}
                  online={true}
                  selected={selectedContact === userId}
                  removeFriend={removeFriend}
                />
              ))}
            {friends.friends
              .filter(
                (friend) =>
                  !onlineUsers.some((user) => user.userId === friend.userId)
              )
              .map(({ userId, name }) => (
                <ContactCard
                  key={userId}
                  id={userId}
                  onClick={() => setSelectedContact(userId)}
                  name={name}
                  online={false}
                  selected={selectedContact === userId}
                />
              ))}
          </div>
          <div className="border-t">
            <h2 className="my-2 underline">Pending:</h2>
            {friends.pending.map(({ userId, name, email }) => (
              <ActionCard
                key={userId}
                id={userId}
                username={name}
                email={email ? email : ""}
                action={removeSentRequest}
                btnClass="  hover:bg-red-300 bg-red-200"
              >
                <RemoveIcon />
              </ActionCard>
            ))}
          </div>
          <div className="border-y">
            <h2 className="my-2 underline">Requests:</h2>
            {friends.requests.map(({ userId, name, email }) => (
              <ActionCard
                key={userId}
                id={userId}
                username={name}
                email={email ? email : ""}
                action={removeRequest}
                btnClass="hover:bg-red-300 bg-red-200"
                secBtn={<AddIcon />}
                secAction={acceptRequest}
              >
                <RemoveIcon />
              </ActionCard>
            ))}
          </div>
        </div>
        <div className="p-2 text-center flex items-center justify-center sm:justify-between gap-2 flex-wrap">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <UserIcon />
            <span className="text-lg text-gray-500 font-semibold">
              {name[0].toUpperCase() + name.slice(1)}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-emerald-50 hover:bg-emerald-200 text-gray-500 font-semibold text-sm py-1 px-2 duration-300 shadow rounded w-full sm:w-fit"
          >
            Logout
          </button>
        </div>
      </div>
      <div
        className={`flex-col bg-emerald-50 p-2 h-full flex-grow ${
          !selectedContact ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="flex-grow">
          {!selectedContact && (
            <div className="flex items-center justify-center h-full text-gray-400 font-semibold">
              &larr; No Selected Conversation
            </div>
          )}
          {!!selectedContact && (
            <>
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-normal px-2 flex items-center gap-1 rounded-md duration-300 text-white hover:bg-emerald-700 bg-emerald-500 border border-emerald-300 hover:border-emerald-500"
                >
                  X
                </button>
              </div>
              <MessagesBox
                messages={messages}
                setMessages={setMessages}
                selectedContact={selectedContact}
              />
            </>
          )}
        </div>
        {!!selectedContact && (
          <form className="flex gap-1" onSubmit={sendMessage}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type Your Message Here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-white w-full flex-grow border py-2 px-2 rounded-xl outline outline-transparent focus:border-transparent mr-1 focus:outline-emerald-500 text-xs sm:text-base"
              />
              <label
                htmlFor="attachment"
                className="absolute right-0 top-1/2 -translate-y-1/2 sm:text-normal px-2 rounded-xl text-gray-500 hover:text-emerald-700 duration-300 flex items-center justify-center"
              >
                <PaperClipIcon />
                <input
                  type="file"
                  name="attachment"
                  id="attachment"
                  className="hidden"
                  onChange={sendFile}
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-emerald-500 px-2 border rounded-xl text-white hover:bg-emerald-600 duration-300"
            >
              <SendIcon />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
