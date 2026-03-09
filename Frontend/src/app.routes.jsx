import {createBrowserRouter} from 'react-router'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Protected from './features/auth/components/Protected'
<<<<<<< HEAD
import Home from './features/interview/pages/Home'
=======
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742


export const router=createBrowserRouter([
    {path:'/login', element:<Login/>},
    {path:'/register', element:<Register/>},
<<<<<<< HEAD
    {path:'/', element:<Protected><Home/></Protected>}
=======
    {path:'/', element:<Protected><h1>Home Page</h1></Protected>}
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
])