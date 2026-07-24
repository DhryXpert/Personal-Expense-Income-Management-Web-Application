import React, { useContext, useState } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";
import { LuGithub, LuLinkedin, LuMail } from "react-icons/lu";
import Modal from "../Modal";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      setShowLogoutAlert(true);
      return;
    }

    navigate(route);
  };

  const handelLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20 flex flex-col justify-between">
      {/* Menu items */}
      <div>
        <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
          {user?.profileImageUrl ? (
            <img
              src={user?.profileImageUrl || ""}
              alt="Profile Image"
              className="w-20 h-20 bg-slate-400 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName || ""}
              width="w-20"
              height="h-20"
              fontSize="text-xl"
            />
          )}
          <h5 className="text-gray-950 font-medium leading-6">
            {user?.fullName || ""}
          </h5>
        </div>

        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu == item.label ? "text-white bg-primary" : ""
            } py-3 px-6 rounded-lg mb-3`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center text-center gap-2 pt-4">
        <hr className="w-full border-t border-gray-200/50 dark:border-gray-800/80 mb-1" />
        
        <p className="text-[13px] text-primary dark:text-purple-300 font-medium select-none transition-colors duration-200 hover:text-purple-700 dark:hover:text-purple-200">
          Every coin tracked is a step toward freedom 🪙
        </p>

        <div className="flex justify-center gap-4 my-1">
          <a
            href="https://github.com/DhryXpert/Zen_Wealth"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-purple-300 transition-all duration-200 hover:-translate-y-0.5"
          >
            <LuGithub size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/dhairya-khatri-kd0711"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-purple-300 transition-all duration-200 hover:-translate-y-0.5"
          >
            <LuLinkedin size={18} />
          </a>
          <a
            href="mailto:dhairyakhatri83@gmail.com"
            title="Email"
            className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-purple-300 transition-all duration-200 hover:-translate-y-0.5"
          >
            <LuMail size={18} />
          </a>
        </div>

        <p className="text-[12px] text-gray-400 dark:text-gray-500">
          Built with joy by <span className="font-semibold text-primary hover:underline transition-all duration-200 cursor-pointer">Dhairya</span>
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        title="Logout Confirmation"
      >
        <div className="p-1 text-left">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
            Are you sure you want to log out?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all cursor-pointer"
              onClick={() => setShowLogoutAlert(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-opacity-90 rounded-lg shadow-md transition-all cursor-pointer"
              onClick={() => {
                setShowLogoutAlert(false);
                handelLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SideMenu;
