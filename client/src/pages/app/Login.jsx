import { useAppContext } from "@/contexts";
import { AiOutlineClose, AiFillWarning } from "react-icons/ai";

function Login() {
  const { showLogin, setShowLogin } = useAppContext();

  document.title = "TechShop | Đăng nhập";

  return (
    <div className="w-screen h-screen font-roboto bg-[rgba(0,0,0,0.05)] flex items-center justify-center backdrop-blur-sm fixed top-0 right-0 bottom-0 left-0">
      <div className="xl:w-[50%] lg:w-[60%] md:w-[70%] sm:w-[80%] w-[90%] bg-white rounded-lg">
        {/* Header */}
        <div className="border-b border-b-gray-200 rounded-t-lg flex justify-between items-center px-20 h-50">
          <h3 className="font-medium text-xl">Đăng nhập</h3>
          <div
            onClick={() => setShowLogin(!showLogin)}
            className="w-40 h-40 text-xl font-normal flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer"
          >
            <AiOutlineClose />
          </div>
        </div>

        {/* Body */}
        <form className="px-20">
          <div className="flex flex-col my-10">
            <label htmlFor="email" className="text-sm font-medium mb-4">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email"
              name="email"
              id="email"
              className="outline-none text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
            />
            <div className="flex items-center gap-2">
              <div className="text-red-500">
                <AiFillWarning />
              </div>
              <span className="text-sm mt-2 text-red-500">
                Email không đúng
              </span>
            </div>
          </div>
          <div className="flex flex-col mb-10">
            <label htmlFor="password" className="text-sm font-medium mb-4">
              Mật khẩu
            </label>
            <div className="rounded-md w-full">
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                name="password"
                id="password"
                className="outline-none w-full text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
              />
              <div></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-red-500">
                <AiFillWarning />
              </div>
              <span className="text-sm mt-2 text-red-500">
                Mật khẩu không đúng
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-sm text-primary font-medium cursor-pointer">
              Quên mật khẩu?
            </span>
          </div>
          <div className="mt-10 flex flex-col items-center">
            <button className="bg-primary w-full cursor-pointer hover:opacity-80 py-6 rounded-md text-white">
              Đăng nhập
            </button>
            <div className="my-10 flex items-center justify-center gap-8 w-full">
              <div className="w-[30%] border border-gray-200"></div>
              <span>Hoặc</span>
              <div className="w-[30%] border border-gray-200"></div>
            </div>
            <button className="w-full mb-30 cursor-pointer hover:opacity-80 py-6 rounded-md border border-gray-200">
              Đăng nhập với Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
