import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const EmailVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRef = useRef([]);
  const navigate = useNavigate();

  const {verifyEmail, isLoading, error} = useAuthStore();


 const handleChange = (index, value) => {
  const newCode = [...code];
  
  if (value.length > 1) {
    // Handle pasted content
    const pastedCode = value.slice(0, 6).split("");
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedCode[i] || "";
    }
    setCode(newCode);
    // Focus on the next input field
    const nextIndex = pastedCode.length < 6 ? pastedCode.length : 5;
    inputRef.current[nextIndex]?.focus();
  } else {
    // Handle single character input
    newCode[index] = value;
    setCode(newCode);
    // Focus on the next input field if value is entered
    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    try {
      await verifyEmail(verificationCode);
      navigate('/login')
    } catch (error) {
      console.log(error)
    }
}

useEffect(() => {
    if(code.every(digit => digit !== '')) {
        handleSubmit(new Event('submit'))
    }
}, [code])

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  

  return (
    <div className="max-w-md w-full bg-gray-bg bg-opacity-50 backdrop-blur-xs backdrop:filter rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Corrected here
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xs rounded-xl shadow-xl overflow-hidden p-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-500 to-emerald-500 text-transparent bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRef.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-500 rounded-lg focus:border-green-500 focus:outline-none"
              />
            ))}
          </div>

          <motion.button
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:rinf-offset-2 focus:ring-offset-gray-900 transition duration-200"
            whileFocus={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin m-auto" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerification;