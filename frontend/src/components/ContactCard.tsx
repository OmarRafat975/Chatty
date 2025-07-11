import { FC } from "react";
import Avatar from "./Avatar";
import { RemoveIcon } from "../assets/Icons";

interface CardType {
  id: string;
  onClick: (id: string) => void;
  selected: boolean;
  name: string;
  online: boolean;
  removeFriend?: (id: string) => void;
}

const ContactCard: FC<CardType> = ({
  id,
  onClick,
  selected,
  name,
  online,
  removeFriend,
}) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={`border-b border-b-gray-100 py-2 pl-2 mb-2 border-l-4 flex items-center gap-2 cursor-pointer hover:bg-emerald-50 rounded-l-xl duration-300 ${
        selected
          ? "bg-emerald-50 border-l-emerald-500"
          : " border-l-transparent "
      }`}
    >
      <Avatar userId={id} name={name} online={online} />
      <div className="flex items-center w-full px-4">
        <span className="text-gray-800 flex-grow">{name}</span>
        <button
          className="text-gray-800 px-2 py-1 flex items-center gap-1 rounded-md duration-300 hover:bg-red-200 bg-red-100 hover:text-gray-900"
          onClick={() => removeFriend && removeFriend(id)}
        >
          <RemoveIcon />
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
