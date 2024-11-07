import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs"; // Import bcrypt
import "../styling/login.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Use navigate hook for redirection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      // Step 1: Retrieve the user data from the database based on the email
      const { data, error } = await supabase
        .from("userinfo") // Make sure 'userinfo' is the correct table name
        .select("*")
        .eq("email", email) // Make sure the 'email' column exists in the table
        .single(); // Retrieves only one record that matches

      if (error || !data) {
        setError("User not found");
        return;
      }

      // Step 2: Compare the entered password with the hashed password stored in the database
      const passwordMatch = await bcrypt.compare(password, data.password);

      if (!passwordMatch) {
        setError("Invalid password");
        return;
      }

      // Log user data for debugging
      console.log("User data from Supabase:", data);

      // Step 3: Save the user data to sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data)); // Save to sessionStorage
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (user) {
        console.log("Logged-in user data:", user);
      } else {
        console.log("No user logged in");
      }

      // Step 4: Check the "is_admin" field and navigate accordingly
      if (data.is_admin) {
        navigate("/adminpage"); // Redirect to admin page if user is an admin
      } else {
        navigate("/homepage"); // Redirect to homepage if user is not an admin
      }
    } catch (err) {
      setError("An error occurred during login");
      console.log("Error logging in:", err);
    }
  };

  const goToRegister = () => {
    navigate("/"); // Navigate to ./register route
  };

  return (
    <div className="signup-container">
      <h1>LOST AND FOUND</h1>
      <div className="buttons">
        <button
          style={{
            backgroundColor: "white",
            color: "#36408e",
            border: "none",
            opacity: 1, // Keep opacity consistent
            cursor: "not-allowed", // Change cursor to indicate disabled state
            pointerEvents: "none", // Disable interaction
          }}
        >
          Login
        </button>
        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "none",
          }}
          id="register"
          onClick={goToRegister}
        >
          Register
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <label id="signxup">Log in with your Account</label>
        <div className="emails">
          <input
            type="text"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="passwords">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit">Sign In</button> <br />
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      </form>
    </div>
  );
};

export default Login;
