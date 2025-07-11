import ChatIcon from "../assets/chatIcon.svg";

const Header = () => {
  return (
    <div className="text-emerald-700 font-bold text-2xl flex items-center gap-2 mb-4">
      <img src={ChatIcon} alt="Chat Logo" className="size-6" />
      Chatty
    </div>
  );
};

export default Header;
