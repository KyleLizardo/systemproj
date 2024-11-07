import React from "react";
import { useNavigate } from "react-router-dom";

const EditReports = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <form>
      <div>
        <h1>Hello</h1>
      </div>
      <div>
        <button
          className="PrevBtn"
          type="button" // Added type="button" to prevent form submission
          onClick={() => {
            localStorage.setItem("scrollToSection", "Report3"); // Set target section
            navigate("/homepage"); // Navigate to /homepage
          }}
        >
          Home
        </button>
      </div>
    </form>
  );
};

export default EditReports;
