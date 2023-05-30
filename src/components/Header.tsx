import { useEffect, useRef, useState } from 'react';
import emptyUserAvatar from '../assets/images/empty-user-avatar.jpeg';
import {  IUser, useLazyFetchUsersQuery } from '../slices/apiSlice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setActiveChatByUser } from '../slices/chatSlice';
import { selectCurrentUser } from '../slices/authSlice';
import { setUserMap } from '../slices/userSlice';

const Header = () => {
    const debounce = 500;
    const [getUsers, { isLoading, data: users }] = useLazyFetchUsersQuery();
    const [isShowResult, setShowResult] = useState(false);
    const [keyword, setKeyword] = useState('');
    const refSearchBox = useRef<HTMLInputElement>(null);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();

    const doSearch = async (search: string) => {
        getUsers({ search, limit: 0});
    }

    const handleInputKeywordBlur = (event: any) => {
        if (refSearchBox?.current !== event.target && !refSearchBox?.current?.contains(event.target)) {
            setShowResult(false);
        }
    }

    const handleUserClick = (user: IUser) => {
        dispatch(setUserMap([user]));
        dispatch(setActiveChatByUser(user));
        setShowResult(false);
    }

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            doSearch(keyword.trim())
        }, debounce);

        return () => {
            clearTimeout(searchTimeout);
        }
    }, [keyword])

    useEffect(() => {
        window.addEventListener('click', handleInputKeywordBlur);
        return () => {
            window.removeEventListener('click', handleInputKeywordBlur);
        }
    }, [])

    return(
        <div className="bg-indigo-700 flex items-center px-4 py-3">
            <div className="w-80 text-white">
                Left header
            </div>
            <div className="flex-grow max-w-3xl mr-6 relative">
                <div className="w-full" ref={refSearchBox}>
                    <input 
                        type="text" 
                        onFocus={(e) => setShowResult(true)}
                        placeholder="Search"
                        onChange={ (event) => setKeyword(event.target.value) }
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    { isShowResult ? (
                        <div className="z-40 absolute left-0 right-0 top-10">
                            <div className="w-full bg-white border p-4 rounded-md drop-shadow-md flex flex-col gap-2">
                                { users?.map((item) => 
                                    <button 
                                        key={item._id}
                                        className="flex items-center gap-2 hover:bg-indigo-200 w-full p-1.5 rounded-md"
                                        onClick={() => handleUserClick(item)}
                                    >
                                        <img
                                            src={item.avatar || emptyUserAvatar}
                                            className="w-8 h-8 rounded-full mr-2"
                                            onError={({ currentTarget }) => {
                                                currentTarget.onerror = null; // prevents looping
                                                currentTarget.src = emptyUserAvatar;
                                            }}
                                        />
                                        <div>
                                            { item.name }
                                            { currentUser?._id == item._id ? ' (You)' : '' }
                                        </div>
                                    </button>
                                )}
                            </div>    
                        </div>
                    ) : null }
                </div>
            </div>
            <div className="w-72 text-white ml-auto flex justify-end">
                <button 
                    className="flex items-center gap-2"
                >
                    <img
                        src={currentUser?.avatar || emptyUserAvatar}
                        className="w-8 h-8 rounded-full mr-2"
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = emptyUserAvatar;
                        }}
                    />
                    <div>
                        { currentUser?.name }
                    </div>
                </button>
            </div>
        </div>
    )
}
export default Header;