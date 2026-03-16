import React from "react";

const Register = () => {
  return (
    <>
      <div className="main flex flex-col w-lg h-[600px] mx-auto mt-5 bg-white rounded-xl shadow-xl px-6 py-8 text-center">
        <div className="top">
          <h3>Create your account</h3>
          <p>Join 50,000+ investors securing their future.</p>
        </div>
        <div className="form">
          <div className="name">
            <label htmlFor="first-name">First Name</label>
            <input type="text" placeholder="Enter your name"></input>
          </div>
          <div className="mail">
            <label htmlFor="email">Email Address</label>
            <input type="email" placeholder="name@mail.com"></input>
          </div>
          <div className="number">
            <label htmlFor="mobile_number">Phone Number</label>
            <input type="number" placeholder="+91 98765 43210"></input>
          </div>
          <div className="password">
            <label htmlFor="password">Password</label>
            <input type="password" placeholder=""></input>
          </div>
          <button type="submit">Create account</button>
        </div>
      </div>
    </>
  );
};

export default Register;
