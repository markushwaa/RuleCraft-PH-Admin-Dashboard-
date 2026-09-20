import logo from "../assets/logo/rulecraft-logo.png";

import { useState } from "react";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { sanitizeEmail } from "../utils/security";

import {
  useNavigate,
} from "react-router-dom";


function Login() {


  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  const { signIn } = useAuth();



  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);


    try {

      await signIn(sanitizeEmail(email), password);


      navigate("/dashboard");


    } catch (loginError) {

      setError(
        loginError.message === "This account does not have active administrator access."
          ? loginError.message
          : "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6">


      <div className="w-full max-w-6xl h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">



        {/* LEFT PANEL */}

        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-slate-900 to-blue-950 px-12 py-10 text-white">


          <img
            src={logo}
            alt="RuleCraft PH"
            className="w-20 h-20 object-contain mb-6"
          />


          <h1 className="text-4xl font-bold">
            RuleCraft PH
          </h1>


          <p className="text-blue-200 mt-2 text-lg">
            Administrator Portal
          </p>


          <p className="mt-6 text-slate-300 text-sm leading-7">

            Manage users, monitor player progress,
            publish lessons, and analyze platform
            performance through one centralized dashboard.

          </p>



          <div className="mt-8 space-y-3">


            <div className="rounded-xl border border-slate-700 bg-white/5 p-4">

              <h3 className="font-semibold">
                User Management
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                Manage administrator and player accounts.
              </p>

            </div>



            <div className="rounded-xl border border-slate-700 bg-white/5 p-4">

              <h3 className="font-semibold">
                Progress Monitoring
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                Track lesson completion and performance.
              </p>

            </div>



            <div className="rounded-xl border border-slate-700 bg-white/5 p-4">

              <h3 className="font-semibold">
                Analytics
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                View engagement and leaderboard data.
              </p>

            </div>


          </div>


        </div>





        {/* RIGHT PANEL */}


        <div className="flex items-center justify-center px-10 py-8">


          <div className="w-full max-w-md">


            <img
              src={logo}
              alt="RuleCraft PH"
              className="w-16 h-16 mx-auto mb-6 lg:hidden"
            />



            <h2 className="text-3xl font-bold text-slate-800">
              Administrator Login
            </h2>


            <p className="text-gray-500 mt-2 mb-8">
              Sign in using your administrator credentials.
            </p>





            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >



              {/* EMAIL */}

              <div>

                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Email Address
                </label>


                <div className="relative">


                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


                  <input

                    type="email"

                    value={email}

                    onChange={(e)=>setEmail(e.target.value)}

                    placeholder="admin@rulecraftph.com"

                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

                  />


                </div>


              </div>





              {/* PASSWORD */}


              <div>


                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Password
                </label>


                <div className="relative">


                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />


                  <input

                    type={
                      showPassword
                      ? "text"
                      : "password"
                    }

                    value={password}

                    onChange={(e)=>setPassword(e.target.value)}

                    placeholder="Enter your password"

                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

                  />



                  <button

                    type="button"

                    onClick={() =>
                      setShowPassword(!showPassword)
                    }

                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"

                  >

                    {
                      showPassword
                      ? <FaEyeSlash />
                      : <FaEye />
                    }


                  </button>


                </div>


              </div>





              {error && (

                <p className="text-sm text-red-500">
                  {error}
                </p>

              )}






              <div className="flex justify-between text-sm">


                <label className="flex items-center gap-2 text-gray-600">

                  <input type="checkbox" />

                  Remember me

                </label>



                <button
                  type="button"
                  className="text-blue-600"
                >

                  Forgot Password?

                </button>


              </div>





              <button

                type="submit"

                disabled={loading}

                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"

              >

                {
                  loading
                  ? "Signing in..."
                  : "Sign In"
                }

              </button>



            </form>





            <div className="mt-8 border-t pt-5">


              <p className="text-center text-xs text-gray-400">
                © 2026 RuleCraft PH
              </p>


              <p className="text-center text-xs text-gray-400 mt-1">
                Administrator Portal • Version 1.0
              </p>


            </div>



          </div>


        </div>


      </div>


    </div>

  );

}


export default Login;
