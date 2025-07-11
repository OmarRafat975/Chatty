const Avatar: React.FC<{
  userId: string;
  name: string;
  online?: boolean;
  noActiveInd?: boolean;
}> = ({ userId, name, noActiveInd, online }) => {
  const colors = [
    "bg-violet-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-red-200",
    "bg-purple-200",
    "bg-orange-200",
    "bg-yellow-200",
    "bg-teal-200",
  ];

  function stringToHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  const userUniqueColor = stringToHash(userId) % colors.length;

  return (
    <div
      className={`relative size-9 rounded-full text-center flex items-center justify-center ${colors[userUniqueColor]}`}
    >
      {online && !noActiveInd && (
        <div className="absolute size-3 rounded-full bg-green-400 bottom-0 right-0"></div>
      )}
      {!online && !noActiveInd && (
        <div className="absolute size-3 rounded-full bg-gray-400 bottom-0 right-0"></div>
      )}
      <div className=" text-xl font-serif opacity-50 font-semibold">
        {name[0].toUpperCase()}
      </div>
    </div>
  );
};

export default Avatar;
