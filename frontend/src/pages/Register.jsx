import {
  MdOutlineAccountBalanceWallet,
  MdOutlinePerson,
  MdOutlineEmail,
  MdOutlineCall,
  MdLockOutline,
  MdArrowForward,
  MdOutlineArrowForward,
} from "react-icons/md";

const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <>
      <div className="topbar flex items-center justify-between px-10 py-3 bg-surface border border-border">
        <div className="brandname flex items-center gap-3">
          <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10">
            <MdOutlineAccountBalanceWallet size={24} color="#1152d4" />
          </div>
          <h3 className="text-xl font-inter  font-bold">SmartInvest</h3>
        </div>
        <div className="bg-primary flex items-center justify-center rounded-btn w-22 h-10">
          <a href="" className="text-t-inverse font-semibold ">
            Log In
          </a>
        </div>
      </div>
      <div class="bg-linear-to-br from-base to-primary/5 min-h-screen  flex flex-col font-inter">
        <div className="main flex flex-col gap-8 w-lg h-fit mx-auto mt-5 bg-white rounded-xl shadow-xl py-8 px-12 text-center border border-border">
          <div className="top flex flex-col gap-2 w-full">
            <h3 className="text-3xl font-bold">Create your account</h3>
            <p className="text-t-secondary">
              Join 50,000+ investors securing their future.
            </p>
          </div>
          <div className="form flex flex-col items-start w-full h-fit gap-5">
            <div className="name w-full flex flex-col items-start gap-1">
              <label htmlFor="full-name" className="text-sm text-slate-700 font-semibold">
                Full Name
              </label>
              <div className="relative flex items-center gap-1 w-full">
                <MdOutlinePerson size={22} color="#90a1b9" className="absolute left-4" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg text-t-primary bg-white focus:ring focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder "
                  type="text"
                  placeholder="Enter your full name"
                ></input>
              </div>
            </div>

            <div className="mail w-full flex flex-col items-start gap-1">
              <label htmlFor="email" className="text-sm text-slate-700 font-semibold">
                Email Address
              </label>
              <div className="relative flex items-center gap-1 w-full">
                <MdOutlineEmail size={22} color="#90a1b9" className="absolute left-4" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg text-t-primary bg-white focus:ring focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder "
                  type="email"
                  placeholder="name@mail.com"
                ></input>
              </div>
            </div>

            <div className="number w-full flex flex-col items-start gap-1">
              <label
                htmlFor="mobile_number"
                className="text-sm text-slate-700 font-semibold"
              >
                Phone Number
              </label>
              <div className="relative flex items-center gap-1 w-full">
                <MdOutlineCall size={22} color="#90a1b9" className="absolute left-4" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg text-t-primary bg-white focus:ring focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder "
                  type="number"
                  placeholder="+91 98765 43210"
                ></input>
              </div>
            </div>

            <div className="password w-full flex flex-col items-start gap-1">
              <label htmlFor="password" className="text-sm text-slate-700 font-semibold">
                Password
              </label>
              <div className="relative flex items-center gap-1 w-full">
                <MdLockOutline size={22} color="#90a1b9" className="absolute left-4" />
                <input
                  className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg text-t-primary bg-white focus:ring focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-t-placeholder "
                  type="password"
                  placeholder="••••••••"
                ></input>
              </div>
            </div>

            <div className="flex justify-center items-center w-full pt-4">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-t-inverse font-bold text-center py-4 px-6 border-none rounded-btn"
              >
                Create account
              </button>
            </div>
            <div className="w-full text-center flex items-center justify-center gap-1">
              <p className="text-sm text-t-secondary">Already have an account?</p>
              <p className="text-sm text-primary font-semibold hover:underline cursor-pointer">
                {" "}
                Log in here
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
