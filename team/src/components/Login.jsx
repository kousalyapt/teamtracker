import React, { useState } from 'react'
import { validateEmail, validatePassword } from '../utilities/validation'
import { Link } from 'react-router-dom'
import { loginApi } from '../apis/login'
import { useNavigate } from 'react-router-dom'

const initialErrorsState = {
    email: '',
    password: '',
    api: ''
}



function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState(initialErrorsState)

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors ={}

        console.log("email:"  ,email)
        console.log("password:", password)
        if (!validateEmail(email)){
            newErrors = {
                ...newErrors,
                email: 'Invalid email'
            }
            
        }
        if(!validatePassword(password)){
            newErrors = {
                ...newErrors,
                password: 'Password should be atleast 6 characters long'
            }
            
        }
        setErrors(newErrors)

        const hasErrors = Object.values(newErrors).some(error => error !== '');
        if (hasErrors){
            return
        }
        const [result,error] = await loginApi({
            user: {
                email: email,
                password: password
            }
        })
        console.log("result:",result)
        console.log("error:",error)
        if(error){
            setErrors({
                ...error,
                api: error
            })
            
        }else{
            const message = result.message;
            const user = result.data;

            navigate('/')
        }
    
    }
  return (
    <div className='bg-white'>
        <div className='max-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-12'>
            <h3 className='text-2xl font-bold'>Login</h3>

            <form onSubmit={handleSubmit} className='mt-10 max-w-96 flex flex-col gap-8'>
                <div>
                    <input
                    name="email"
                    type="email"
                    className='py-2 w-full border border-gray-600 rounded px-3'
                    placeholder='Enter email'
                    value={email}
                    onChange={handleEmailChange}
                    />
                    {errors.email && <p className='text-sm text-medium text-red-500'>{errors.email}</p>}

                </div>
                
                <div>
                    <input
                    name="password"
                    type="password"
                    className='py-2 w-full border border-gray-600 rounded px-3'
                    placeholder='Enter Password'
                    value={password}
                    onChange={handlePasswordChange}
                    />       

                    {errors.password && <p className='text-sm text-medium text-red-500'>{errors.password}</p>}            
                </div>

                <button 
                type="submit"
                className='bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded'>
                    Login
                </button>
                {errors.api && <p className='text-sm text-medium text-red-500'>{errors.api}</p>}
            </form>
            <p className='mt-1'>New to Team Tracker?
                <Link to= '/register'
                className='ms-1 underline'>
                Create Account
                </Link>
            </p>
        </div>
    </div>
  )
}

export default Login