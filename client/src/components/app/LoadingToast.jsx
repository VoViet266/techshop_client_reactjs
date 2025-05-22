import { useAppContext } from "@contexts";
import { AiFillCheckCircle, AiOutlineClose } from "react-icons/ai";

function LoadingToast() {
  const { message } = useAppContext();

  return (
    <div className="fixed top-0 right-0 left-0 bottom-0 flex justify-center">
      <div className="bg-gray-200 relative border border-gray-500 flex items-center justify-center gap-6 w-[20%] h-60 mt-20 rounded-lg">
        <div className="text-xl text-gray-700">
          <AiFillCheckCircle />
        </div>
        <span className="text-gray-700">{message}</span>
        <div className="absolute top-0 right-0 p-6 cursor-pointer text-gray-700">
          <AiOutlineClose />
        </div>
      </div>
    </div>
  );
}

export default LoadingToast;
