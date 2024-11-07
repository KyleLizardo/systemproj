import { useContext } from 'react';
import { AuthContext } from '../config/AuthComponent';

export const useAuth = () => {
  return useContext(AuthContext);
};

/**  instead of using useContext(AuthContext)
 *  directly in each component where you need authentication data, 
 * you can simply call useAuth(). 
 * 
*/

/**  (useContext)Contexts in React are used to pass data through the component tree 
 * without having to pass props down manually at every level. **/
