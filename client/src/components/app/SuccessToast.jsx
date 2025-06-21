import { useEffect } from 'react';
import { useAppContext } from '@contexts';
import { AiFillCheckCircle, AiOutlineClose } from 'react-icons/ai';

function SuccessToast() {
  const { message, loadingSuccess, setLoadingSuccess } = useAppContext();
  useEffect(() => {
    const id = setTimeout(() => {
      setLoadingSuccess(false);
    }, 3000);

    return () => {
      clearTimeout(id);
    };
  }, []);

  return (
    <div className="bg-green-200 z-20 absolute top-0 left-[50%] -translate-x-[50%] border border-green-500 flex items-center justify-center gap-6 w-[20%] h-60 mt-20 rounded-lg">
      <div className="text-xl text-green-700">
        <AiFillCheckCircle />
      </div>
      <span className="text-green-700">{message}</span>
      <div
        onClick={() => {
          setLoadingSuccess(false);
        }}
        className="absolute top-0 right-0 p-6 cursor-pointer text-green-700"
      >
        <AiOutlineClose />
      </div>
    </div>
  );
}

export default SuccessToast;
