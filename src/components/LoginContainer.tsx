import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../slices/apiSlice';
import { useAppDispatch } from '../hooks/hooks';
import { setCredentials } from '../slices/authSlice';
import { socket } from '../socket';
import { toast } from 'react-toastify';
import Spinner from './general/Spinner';
import { ILoginResponse } from '../models/user';

const LoginContainer: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [doLogin, { isLoading }] = useLoginMutation();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const user = await doLogin({ username, password }).unwrap();
            saveLoginSession(user);
        } catch (error) {
            toast.error('Login failed');
        }
    };

    const saveLoginSession = (user: ILoginResponse) => {
        dispatch(setCredentials(user));

        // save login session
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user.user));

        navigate('/');

        socket.auth = {
            token: user.token
        };
        socket.connect();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-md">
                <h2 className="text-3xl font-semibold mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full flex justify-center items-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none"
                    >
                        { isLoading ?
                            <Spinner className="h-5 w-5 fill-indigo-100 text-indigo-500 mr-2" /> : null
                        }
                        Login
                    </button>
                </form>
                <div className="text-center mt-4">
                    <Link 
                        to="/register"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Register for an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginContainer;