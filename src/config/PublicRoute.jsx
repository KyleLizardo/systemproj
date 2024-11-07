import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  console.log(user);


  if (user) {
    return <Navigate to='/' replace={true} />;
  }

  return children;
};

export default PublicRoute;
/** PublicRoute  is used to control access to specific routes 
 * in your application
 *  based on the authentication status of the user. */

/**Access Control: This component ensures that only unauthenticated users 
 * can access certain routes (like a login or signup page). 
 * If a user is authenticated (i.e., logged in), 
 * they are redirected away from these routes. */