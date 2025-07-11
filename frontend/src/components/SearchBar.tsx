import { FC, FormEvent, useEffect, useState } from "react";
import { SearchIcon, UserPlusIcon } from "../assets/Icons";
import { SearchUser, User } from "../types/data";
import { useSelector } from "react-redux";
import { storeType } from "../types/store";
import ActionCard from "./ActionCard";
import { useFetch } from "../hooks/ApiHook";
import Loading from "./Loading";
import Error from "./Error";

const SearchBar: FC<{
  friends: {
    friends: User[];
    pending: User[];
    requests: User[];
  };
  addFriend: (id: string) => void;
}> = ({ friends, addFriend }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [showResults, setShowResutls] = useState<boolean>(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const { user } = useSelector((state: storeType) => state.auth);
  const { data, loading, error, fetchData } = useFetch<{
    users: SearchUser[];
  }>();

  function checkDisabled(Arr: User[], id: string) {
    return Arr.some((arrUser: User) => arrUser.userId === id);
  }

  async function searchFormSubmit(e: FormEvent | null) {
    e?.preventDefault();
    fetchData("/users/find?searchText=" + searchText);
    setShowResutls(true);
  }

  useEffect(() => {
    if (data?.users) {
      const filtered = data.users.filter((userFound) => userFound._id !== user);
      setUsers(filtered);
    }
  }, [data, user]);

  return (
    <div className="p-2 flex flex-col items-center">
      <form onSubmit={searchFormSubmit} className="w-full flex items-center">
        <label
          htmlFor="UserSearch"
          className="relative flex items-center w-full"
        >
          <input
            value={searchText}
            name="UserSearch"
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="search"
            className="border w-full bg-white flex-grow py-2 px-2 rounded-xl outline outline-transparent focus:border-transparent focus:outline-emerald-500"
          />
          <button className=" px-2 text-gray-400 hover:text-gray-900 duration-300 absolute top-1/2 -translate-y-1/2 right-2">
            <SearchIcon />
          </button>
        </label>
      </form>
      {showResults && (
        <div className="px-2 pb-2 pt-8 border-x border-b rounded -mt-3 w-full relative">
          {loading && <Loading />}
          {error && <Error error={error} />}
          {!loading &&
            users.map(({ _id, username, email }) => (
              <ActionCard
                key={_id}
                id={_id}
                username={username}
                email={email}
                action={addFriend}
                disabled={
                  checkDisabled(friends.pending, _id) ||
                  checkDisabled(friends.requests, _id)
                }
                btnClass="bg-emerald-100"
              >
                {checkDisabled(friends.pending, _id) ||
                checkDisabled(friends.requests, _id) ? (
                  "Pending"
                ) : (
                  <>
                    <UserPlusIcon />
                    {"Add Friend"}
                  </>
                )}
              </ActionCard>
            ))}
          <div
            className="flex items-center absolute top-4 right-3 justify-center"
            onClick={() => setShowResutls(false)}
          >
            <button className="text-xs px-2 flex items-center gap-1 rounded-md duration-300 hover:text-red-700 text-red-500 border border-transparent hover:border-red-200">
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
