import { FC, ReactNode } from "react";
import Avatar from "./Avatar";

interface CardProps {
  children: ReactNode;
  username: string;
  id: string;
  email: string;
  action: (id: string) => void;
  secAction?: (id: string) => void;
  disabled?: boolean;
  btnClass?: string;
  secBtn?: string | ReactNode;
}

const ActionCard: FC<CardProps> = ({
  children,
  id,
  username,
  email,
  action,
  secAction,
  disabled,
  btnClass,
  secBtn,
}) => {
  return (
    <div className="flex items-center justify-start duration-300 p-2 hover:bg-gray-100 rounded-md">
      <div className="flex-grow flex items-center gap-2 ">
        <Avatar userId={id} name={username} noActiveInd={true} />
        <div className="flex items-start flex-col">
          <span className="text-gray-950">
            {username[0].toUpperCase() + username.slice(1)}
          </span>
          <span className="text-[10px] text-gray-500">{email}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {secBtn && (
          <button
            className="text-gray-800 px-2 py-1 flex items-center gap-1 rounded-md duration-300 hover:bg-emerald-200 bg-emerald-100 hover:text-gray-900"
            onClick={() => secAction && secAction(id)}
          >
            {secBtn}
          </button>
        )}
        <button
          disabled={disabled}
          onClick={() => action(id)}
          className={`text-gray-800 px-2 py-1 flex items-center gap-1 rounded-md   duration-300 ${
            disabled
              ? "opacity-50 bg-emerald-200"
              : " hover:bg-emerald-200  hover:text-gray-900"
          } ${btnClass}`}
        >
          {children}
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
