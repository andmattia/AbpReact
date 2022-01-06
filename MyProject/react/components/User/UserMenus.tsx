import React from "react";
import { useAuth } from "react-oidc-context";
import UserDropDown from "./UserDropDown";

interface Props {}

const UserMenus = (props: Props) => {
  var auth = useAuth();
  return (
    <div className="flex justify-center items-center">
      {auth.isAuthenticated ? (
        <UserDropDown />
      ) : (
        <div>
          <button className="mr-6 hover:bg-slate-300 p-3 rounded-3xl" onClick={() => auth.signinRedirect()}>
            Login
          </button>
          <button className="py-2 px-4 text-white bg-black rounded-3xl">
            Signup
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenus;