import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useEffect, useRef } from "react";
import {
  AiFillEye,
  AiFillWarning,
  AiOutlineClose,
  AiFillEyeInvisible,
} from "react-icons/ai";
import Users from "@services/users";
import Address from "@services/address";
import { useAppContext } from "@contexts";

function Signup() {
  useEffect(() => {
    document.title = "TechShop | Đăng ký";
  }, []);

  const genderDropdownRef = useRef(null);
  const addressDropdownRef = useRef(null);
  const [user, setUser] = useState({
    phone: "",
    email: "",
    gender: "",
    address: "",
    fullName: "",
    password: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    async function fetchProvinces() {
      const provinces = await Address.getAllProvinces();
      setProvinces(provinces);
    }

    fetchProvinces();
  }, []);

  useEffect(() => {
    async function fetchDistricts() {
      const districts = await Address.getDistricts(selectedProvince.code);
      setDistricts(districts);
    }

    if (selectedProvince !== "") {
      fetchDistricts();
    }
  }, [selectedProvince]);

  useEffect(() => {
    async function fetchWards() {
      const wards = await Address.getWards(selectedDistrict.code);
      setWards(wards);
    }

    if (selectedDistrict !== "") {
      fetchWards();
    }
  }, [selectedDistrict]);

  const genders = ["Nam", "Nữ", "Khác"];
  const {
    setShowSignup,
    setLoadingSuccess,
    setShowLogin,
    setToastLoading,
    setMessage,
  } = useAppContext();
  const places = ["Tỉnh/Thành phố", "Quận/Huyện", "Xã/Phường"];

  const [userError, setUserError] = useState({
    emailError: false,
    phoneError: false,
    genderError: false,
    addressError: false,
    fullNameError: false,
    passwordError: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState("Tỉnh/Thành phố");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setShowGenderDropdown(false);
      }

      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target)
      ) {
        setShowAddressDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-screen h-screen font-roboto bg-[rgba(0,0,0,0.05)] flex items-center justify-center backdrop-blur-sm z-20 fixed top-0 right-0 bottom-0 left-0">
      <div className="xl:w-[50%] lg:w-[60%] md:w-[70%] sm:w-[80%] w-[90%] bg-white rounded-lg">
        <div className="border-b border-b-gray-200 rounded-t-lg flex justify-between items-center px-20 h-50">
          <h3 className="font-medium text-xl">Đăng ký</h3>
          <div
            onClick={() => setShowSignup(false)}
            className="w-40 h-40 text-xl font-light flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer"
          >
            <AiOutlineClose />
          </div>
        </div>
        <form className="px-20">
          <div className="flex flex-col my-10">
            <label htmlFor="fullName" className="text-sm font-medium mb-4">
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên"
              onChange={(event) => {
                const fieldName = event.target.name;
                setUser({ ...user, [fieldName]: event.target.value });
              }}
              className="outline-none text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
            />
            {userError.fullNameError && (
              <div className="flex items-center gap-2">
                <div className="text-red-500">
                  <AiFillWarning />
                </div>
                <span className="text-sm mt-2 text-red-500">
                  Họ và tên không được để trống hoặc bao gồm số
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col my-10 relative">
            <label htmlFor="address" className="text-sm font-medium mb-4">
              Địa chỉ
            </label>
            <input
              readOnly
              id="address"
              name="address"
              value={user.address}
              placeholder="Chọn địa chỉ"
              onClick={() => setShowAddressDropdown(!showAddressDropdown)}
              className="outline-none cursor-pointer text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
            />

            {showAddressDropdown && (
              <div
                ref={addressDropdownRef}
                className="bg-white absolute z-1 top-full mt-4 overflow-hidden left-0 right-0 rounded-md border border-gray-200"
              >
                <div className="flex justify-center gap-8 border-b border-gray-200">
                  {places.map((place, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPlace(place)}
                      className={`w-[33%] cursor-pointer py-6 text-center ${""}  ${selectedPlace === place ? "border-b border-b-primary text-primary" : ""}`}
                    >
                      {place}
                    </div>
                  ))}
                </div>

                <div className="overflow-y-auto h-200 z-1 p-6 cursor-pointer">
                  {selectedPlace === "Tỉnh/Thành phố" &&
                    provinces.map((province, index) => (
                      <div
                        key={index}
                        onClick={(event) => {
                          setUser({
                            ...user,
                            address: event.target.textContent,
                          });
                          setSelectedProvince(province);
                          setSelectedPlace("Quận/Huyện");
                        }}
                        className={`py-4 my-4 px-6 hover:bg-gray-200 rounded-md ${selectedProvince.name === province.name && "bg-gray-200"}`}
                      >
                        {province.name || <Skeleton count={5} />}
                      </div>
                    ))}

                  {selectedPlace === "Quận/Huyện" &&
                    districts.map((district, index) => (
                      <div
                        key={index}
                        onClick={(event) => {
                          setUser({
                            ...user,
                            address:
                              selectedDistrict === ""
                                ? user.address + ", " + event.target.textContent
                                : selectedProvince.name +
                                  ", " +
                                  event.target.textContent,
                          });
                          setSelectedDistrict(district);
                          setSelectedPlace("Xã/Phường");
                        }}
                        className={`py-4 my-4 px-6 hover:bg-gray-200 rounded-md ${selectedDistrict.name === district.name && "bg-gray-200"}`}
                      >
                        {district.name || <Skeleton count={5} />}
                      </div>
                    ))}

                  {selectedPlace === "Xã/Phường" &&
                    wards.map((ward, index) => (
                      <div
                        key={index}
                        onClick={(event) => {
                          setUser({
                            ...user,
                            address:
                              selectedWard === ""
                                ? user.address + ", " + event.target.textContent
                                : selectedProvince.name +
                                  ", " +
                                  selectedDistrict.name +
                                  ", " +
                                  event.target.textContent,
                          });
                          setSelectedWard(ward);
                          setShowAddressDropdown(false);
                        }}
                        className={`py-4 my-4 px-6 hover:bg-gray-200 rounded-md ${selectedWard.name === ward.name && "bg-gray-200"}`}
                      >
                        {ward.name || <Skeleton count={5} />}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {userError.addressError && (
              <div className="flex items-center gap-2">
                <div className="text-red-500">
                  <AiFillWarning />
                </div>
                <span className="text-sm mt-2 text-red-500">
                  Vui lòng chọn địa chỉ
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-10 my-10">
            <div className="flex flex-col w-[70%]">
              <label htmlFor="phone" className="text-sm font-medium mb-4">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="Nhập số điện thoại"
                onChange={(event) => {
                  const fieldName = event.target.name;
                  setUser({ ...user, [fieldName]: event.target.value });
                }}
                className="outline-none text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
              />
              {userError.phoneError && (
                <div className="flex items-center gap-2">
                  <div className="text-red-500">
                    <AiFillWarning />
                  </div>
                  <span className="text-sm mt-2 text-red-500">
                    Số điện thoại không hợp lệ
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col relative">
              <label htmlFor="gender" className="text-sm font-medium mb-4">
                Giới tính
              </label>
              <input
                readOnly
                id="gender"
                value={user.gender}
                name="gender"
                placeholder="Chọn giới tính"
                onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                className="outline-none text-base placeholder:text-sm cursor-pointer rounded-md px-12 py-8 bg-gray-100"
              />

              {showGenderDropdown && (
                <ul
                  ref={genderDropdownRef}
                  className="absolute left-0 right-0 z-1 top-full rounded-md mt-4 p-6 bg-white border border-gray-200"
                >
                  {genders.map((gender, index) => (
                    <li
                      key={index}
                      onClick={(event) => {
                        setUser({ ...user, gender: event.target.textContent });
                        setShowGenderDropdown(false);
                      }}
                      className={`px-8 my-2 py-4 rounded-sm hover:bg-gray-200 cursor-pointer ${user.gender === gender ? "bg-gray-200" : ""}`}
                    >
                      {gender}
                    </li>
                  ))}
                </ul>
              )}

              {userError.genderError && (
                <div className="flex items-center gap-2">
                  <div className="text-red-500">
                    <AiFillWarning />
                  </div>
                  <span className="text-sm mt-2 text-red-500">
                    Vui lòng chọn giới tính
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col my-10">
            <label htmlFor="email" className="text-sm font-medium mb-4">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Nhập email"
              onChange={(event) => {
                const fieldName = event.target.name;
                setUser({ ...user, [fieldName]: event.target.value });
              }}
              className="outline-none text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
            />
            {userError.emailError && (
              <div className="flex items-center gap-2">
                <div className="text-red-500">
                  <AiFillWarning />
                </div>
                <span className="text-sm mt-2 text-red-500">
                  Email không đúng
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col mb-10">
            <label htmlFor="password" className="text-sm font-medium mb-4">
              Mật khẩu
            </label>
            <div className="rounded-md w-full relative">
              <input
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                type={showPassword ? "text" : "password"}
                onChange={(event) => {
                  const fieldName = event.target.name;
                  setUser({ ...user, [fieldName]: event.target.value });
                }}
                className="outline-none w-full text-base placeholder:text-sm rounded-md px-12 py-8 bg-gray-100"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-10 top-[50%] -translate-y-[50%]"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </div>
            </div>
            {userError.passwordError && (
              <div className="flex items-center gap-2">
                <div className="text-red-500">
                  <AiFillWarning />
                </div>
                <span className="text-sm mt-2 text-red-500">
                  Mật khẩu tối thiểu 8 ký tự và không được chứa khoảng trắng
                </span>
              </div>
            )}
          </div>
          <div className="my-30 flex flex-col items-center">
            <button
              onClick={async (event) => {
                event.preventDefault();
                setToastLoading(true);
                setMessage("Đang đăng ký");
                await Users.signup(user, userError, setUserError);
                setToastLoading(false);
                setLoadingSuccess(true);
                setMessage("Đăng ký thành công");
                setShowSignup(false);
                setShowLogin(true);
              }}
              className="bg-primary w-full cursor-pointer hover:opacity-80 py-6 rounded-md text-white"
            >
              Đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
