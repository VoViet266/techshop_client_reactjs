import { useAppContext } from '@contexts';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function LoadingToast() {
  const { message } = useAppContext();

  return (
    <div className="fixed z-20 top-0 right-0 left-0 bottom-0 flex justify-center">
      <div className="bg-gray-200 border border-gray-500 flex items-center justify-center gap-6 w-[20%] h-60 mt-20 rounded-lg">
        <div className="text-xl animate-spin text-gray-700">
          <AiOutlineLoading3Quarters />
        </div>
        <span className="text-gray-700">{message}</span>
      </div>
    </div>
  );
}

export default LoadingToast;
