import React, { useState } from 'react';
import { validateEmail, validatePassword } from '../utilities/validation'
import { Link } from 'react-router-dom'
import { registerApi } from '../apis/register'
import { useNavigate } from 'react-router-dom'

const initialErrorsState = {
    email: '',
    password: '',
    api: ''
}

const Register = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passconf, setPassconf] = useState('')
    const [errors, setErrors] = useState(initialErrorsState)

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const handlePassconfChange = (e) => {
        setPassconf(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors ={}
        console.log("name:",name)
        console.log("email:"  ,email)
        console.log("password:", password)
        console.log("passconf:",passconf)
        

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
        const [result,error] = await registerApi({
            user: {
                name: name,
                email: email,
                password: password,
                password_confirmation: passconf
            }
        })
        console.log("result:",result)
        console.log("error:",error)
        if(error !== ''){
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
            <h3 className='text-2xl font-bold'>Register</h3>

            <form onSubmit={handleSubmit} className='mt-10 max-w-96 flex flex-col gap-8'>

                <input
                name="name"
                type="name"
                className='py-2 border border-gray-600 rounded px-3'
                placeholder='Enter username'
                value={name}
                onChange={handleNameChange}
                />
                
                <input
                name="email"
                type="email"
                className='py-2 border border-gray-600 rounded px-3'
                placeholder='Enter email'
                value={email}
                onChange={handleEmailChange}
                />
                {errors.email && <p className='text-sm text-medium text-red-500'>{errors.email}</p>}

                <input
                name="password"
                type="password"
                className='py-2 border border-gray-600 rounded px-3'
                placeholder='Enter Password'
                value={password}
                onChange={handlePasswordChange}
                />
                {errors.password && <p className='text-sm text-medium text-red-500'>{errors.password}</p>} 

                <input
                name="passconf"
                type="passconf"
                className='py-2 border border-gray-600 rounded px-3'
                placeholder='Confirm Password '
                value={passconf}
                onChange={handlePassconfChange}
                />

                <button 
                type="submit"
                className='bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded'>
                    Register
                </button>
                {errors.api && <p className='text-sm text-medium text-red-500'>{errors.api}</p>}
            </form>
            <p className='mt-1'>Already have an Account?
                <Link to= '/login'
                className='ms-1 underline'>
                Log in
                </Link>
            </p>
        </div>
    </div>
  )
};

export default Register;
