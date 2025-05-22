function ErrorToast() {
  return (
    <div className="bg-red-200 relative border border-red-500 flex items-center justify-center gap-6 w-[20%] h-60 mt-20 rounded-lg">
      <div className="text-xl text-red-700">
        <AiFillCheckCircle />
      </div>
      <span className="text-red-700">{message}</span>
      <div className="absolute top-0 right-0 p-6 cursor-pointer text-red-700">
        <AiOutlineClose />
      </div>
    </div>
  );
}

export default ErrorToast;
