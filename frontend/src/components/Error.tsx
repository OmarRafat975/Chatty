import React from "react";
import { DangerIcon } from "../assets/Icons";

const Error: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="text-red-500 text-center flex items-center justify-center gap-2">
      <DangerIcon />
      {error}
    </div>
  );
};

export default Error;
