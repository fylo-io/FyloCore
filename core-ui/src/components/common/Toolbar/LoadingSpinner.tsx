import { FC } from "react";

const LoadingSpinner: FC = () => (
  <div className="flex justify-center items-center">
    <div className="w-5 h-5 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;
