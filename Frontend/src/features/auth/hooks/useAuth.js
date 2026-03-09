import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import {register,login,logout,getme} from '../services/auth.api'


export const useAuth = () => {

    const context=useContext(AuthContext)
    console.log(context.loading);
    
    const {user,setUser,loading,setLoading}=context

    const handleLogin=async ({email,password})=>{
        setLoading(true)
        try {
            const data= await login({email,password})
            setUser(data.user)
        } catch (error) {
            console.log(error);
        }finally{
            setLoading(false)
        }

    }

    const handleRegister=async ({username,email,password})=>{
        setLoading(true)
        try{
            const data=await register({username,email,password})
            setUser(data.user)
        }catch(error){
            console.log(error);    
        }finally{
            setLoading(false)
        }
    }

    const handleLogout=async ()=>{
        setLoading(false)
        try {
            const data=await logout()
            setUser(null)
        } catch (error) {
            console.log(error); 
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser=async ()=>{
<<<<<<< HEAD
               try{
                 const data=await getme()
                setUser(data.user)
               }catch(err){}finally{
                   setLoading(false)

               }
=======
                const data=await getme()
                setUser(data.user)
                setLoading(false)
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
        }

        getAndSetUser()
    },[])

  return {user,loading,handleLogin,handleRegister,handleLogout}
}

