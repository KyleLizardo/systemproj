import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs"; // Import bcrypt
import "../styling/login.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Generate a UUID for the new user
      const userId = uuidv4();

      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Raw SQL to insert the user data into the 'userinfo' table
      const sql = `
        INSERT INTO userinfo (id, firstName, lastName, email, contact, password, is_admin)
        VALUES ('${userId}', '${firstName}', '${lastName}', '${email}', '${contact}', '${hashedPassword}', false);
      `;

      const { error: insertError } = await supabase.rpc("execute_sql", { sql });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccessMessage("Account created successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after success
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  };
  return (
    <div className="signup-container">
      <h1>LOST AND FOUND</h1>
      <div className="buttons">
        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "none",
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
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
          Register
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <label id="signup">Create a new Account</label>
        <div className="names">
          <input
            type="text"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Contact Number"
            maxLength={11}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div className="emails">
          <input
            type="email"
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
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit">Sign Up</button>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "#15bc11" }}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
