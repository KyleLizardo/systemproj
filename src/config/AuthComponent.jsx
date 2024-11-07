import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase"; // Ensure Firestore is imported
import { doc, getDoc } from "firebase/firestore";
import PropTypes from "prop-types";

// Create the AuthContext with default values
export const AuthContext = createContext({
  user: null,
  isLoading: true,
});

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // to handle loading state

  // Use effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional user details from Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          // Set user details including Firestore data
          setUser({
            id: user.uid,
            name: userDoc.data().firstName + " " + userDoc.data().lastName,
            email: user.email,
            contact: userDoc.data().contact, // Fetch contact from Firestore
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Value passed to the provider's consumers
  const value = {
    user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Define PropTypes for prop validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
