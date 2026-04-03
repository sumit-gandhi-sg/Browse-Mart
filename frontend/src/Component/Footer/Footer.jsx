import React from "react";
import {
  FaFacebookF,
  FaPaperPlane,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";
const Footer = ({ userDetail }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-5 mobile:px-10 tablet:px-20 border-t-2">
      <div
        className={`max-w-7xl mx-auto grid grid-cols-1 small-device:grid-cols-2 tablet:grid-cols-3  ${
          userDetail?.userType === "seller"
            ? "laptop:grid-cols-5"
            : "laptop:grid-cols-4"
        } gap-8`}
      >
        {/* Browse Mart Section */}
        <div>
          <h2 className="text-white text-lg font-semibold">Browse Mart</h2>
          <p className="text-sm mt-2">
            Your one-stop shop for all things amazing.
          </p>
          <div className="flex space-x-4 mt-3">
            <FaFacebookF className="cursor-pointer hover:text-white" />
            <FaTwitter className="cursor-pointer hover:text-white" />
            <FaInstagram className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold">Quick Links</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">
              <Link to={"/seller-registration"}>Seller Registration</Link>
            </li>
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Shipping</li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-white text-lg font-semibold">Customer Service</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">
              {" "}
              <Link to={"/profile"}>My Account</Link>
            </li>
            <li className="hover:text-white cursor-pointer">
              <Link to={"/orders"}>View Orders</Link>
            </li>
            <li className="hover:text-white cursor-pointer">Track Order</li>
            <li className="hover:text-white cursor-pointer">Returns</li>
            <li className="hover:text-white cursor-pointer">Wishlist</li>
          </ul>
        </div>
        {userDetail?.userType === "seller" && (
          <div>
            <h3 className="text-white text-lg font-semibold">Seller Service</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">
                <Link to={"/seller"}>Seller DashBoard</Link>
              </li>
              <li className="hover:text-white cursor-pointer">Track Order</li>
              <li className="hover:text-white cursor-pointer">Returns</li>
              <li className="hover:text-white cursor-pointer">Wishlist</li>
            </ul>
          </div>
        )}

        {/* Newsletter */}
        <div>
          <h3 className="text-white text-lg font-semibold">Newsletter</h3>
          <p className="text-sm mt-2">
            Subscribe to get special offers and updates.
          </p>
          <div className="flex mt-3 bg-white rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 w-full text-black focus:outline-none"
            />
            <button className="bg-purple-600 p-2 flex items-center justify-center">
              <FaPaperPlane className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-sm text-gray-500 mt-10 border-t border-gray-700 pt-5">
        &copy; <span>{new Date().getFullYear()}</span> Browse Mart. All rights
        reserved.
      </div>
    </footer>
  );
};

export default Footer;
