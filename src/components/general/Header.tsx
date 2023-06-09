import { useEffect, useRef, useState, Fragment } from 'react';
import { useLazyFetchUsersQuery, useChangeUserStatusMutation } from '../../slices/apiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { setActiveChatByUser } from '../../slices/chatSlice';
import { selectCurrentUser, setCredentials } from '../../slices/authSlice';
import { setUserMap } from '../../slices/userSlice';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/solid';
import Avatar from './Avatar';
import { IUser } from '../../models/user';

const Header = () => {
    const debounce = 500;
    const [getUsers, { isLoading, data: users }] = useLazyFetchUsersQuery();
    const [isShowResult, setShowResult] = useState(false);
    const [keyword, setKeyword] = useState('');
    const refSearchBox = useRef<HTMLInputElement>(null);
    const currentUserId = useAppSelector(state => state.auth.user?._id);
    const dispatch = useAppDispatch();

    const doSearch = async (search: string) => {
        getUsers({ search });
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
            if (keyword.trim()) {
                doSearch(keyword.trim());
            }
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
        <div className="bg-indigo-800 flex items-center">
            <div className="p-3 hidden sm:hidden">
                <button className='text-white p-1'>
                    <Bars3Icon className="w-4 h-4" />
                </button>
            </div>
            <div className="w-80 sm:w-16 mr-8 sm:mr-0 text-white px-4 py-3 flex-none">
                <span className="sm:hidden">Clone Teams</span>
                <span className="hidden sm:block">CT</span>
            </div>
            <div className="flex-grow max-w-3xl relative py-3">
                <div className="w-full" ref={refSearchBox}>
                    <input 
                        type="text" 
                        onFocus={(e) => setShowResult(true)}
                        placeholder="Search"
                        onChange={ (event) => setKeyword(event.target.value) }
                        className="bg-white bg-opacity-90 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                    { isShowResult ? (
                        <div className="z-30 absolute left-0 right-0 top-14">
                            <div className="w-full bg-white border p-4 rounded-md drop-shadow-md flex flex-col gap-2">
                                { users?.map((item) => 
                                    <button 
                                        key={item._id}
                                        className="flex items-center gap-2 hover:bg-indigo-200 w-full p-1.5 rounded-md"
                                        onClick={() => handleUserClick(item)}
                                    >
                                        <Avatar 
                                            src={item.avatar || ''}
                                        />
                                        <div className="text-left">
                                            { item.name }
                                            { currentUserId === item._id ? ' (You)' : '' }
                                        </div>
                                    </button>
                                )}
                            </div>    
                        </div>
                    ) : null }
                </div>
            </div>
            <div className="w-40 sm:w-32 ml-auto flex justify-end h-full">
                <CurrentUserAvatarMenu />
            </div>
        </div>
    )
}

export const CurrentUserAvatarMenu = () => {
    const currentUser = useAppSelector(selectCurrentUser);
    const userStatus = useAppSelector(state => state.users.userMap[currentUser?._id || '']);
    const [userUpdateStatus, result] = useChangeUserStatusMutation();

    const statusOptions: any = {
        available: 'Available',
        busy: 'Busy',
        dnd: 'Do not distrub',
        away: 'Away',
        offline: 'Appear offline',
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // dispatch(setCredentials({ user: null, token: ''}));
        window.location.href = '/login'
    }

    const handleChangeStatus = (status: string) => {
        userUpdateStatus({
            profileStatus: status
        });
    }

    return (
        <Menu as="div" className="relative h-full w-full md:w-auto">
            <Menu.Button  
                className="flex items-center gap-2 text-white hover:bg-indigo-700 h-full px-4 w-full overflow-hidden justify-end"
            >
                <Avatar
                    status={userStatus?.profileStatus}
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                />
                <div className="md:hidden truncate">
                    { currentUser?.name }
                </div>
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items 
                    className="absolute z-50 right-2 top-16 shadow-lg bg-white border w-72 rounded-md"
                >
                    <Menu.Item
                        as="div"
                        className="flex w-full p-4"
                    >
                        <Avatar 
                            src={currentUser?.avatar || ''}
                            hideStatus={true}
                        />
                        <div className="ml-3 leading-none">
                            <div>{ currentUser?.name }</div>
                            <div className="text-sm text-gray-600">
                                { currentUser?.email }
                            </div>
                            <div className="mt-1">
                                <Menu as="div" className="relative inline-block text-left text-gray-600 text-sm">
                                    <div>
                                        <Menu.Button className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md text-sm hover:bg-gray-50">
                                            { statusOptions?.[userStatus?.profileStatus || ''] || 'Change status'}
                                            <ChevronDownIcon className="-mr-1 h-3 w-3 text-gray-400" aria-hidden="true" />
                                        </Menu.Button>
                                    </div>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            { Object.keys(statusOptions).map((item) => 
                                                <Menu.Item key={item}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={ () => handleChangeStatus(item) }
                                                            className={
                                                                    'block w-full px-4 py-2 text-left text-sm ' +
                                                                    (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700')
                                                                }
                                                            >
                                                            { statusOptions[item] }
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            )}                                                    
                                        </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </Menu.Item>
                    <Menu.Item
                        as="div"
                        className="flex w-full py-2 border-t"
                    >
                        {({ active }) => (
                        <button
                            onClick={handleLogout}
                            className={
                                'block w-full px-4 py-2 text-left text-sm ' +
                                (active ? 'bg-gray-100 text-gray-900' : 'text-gray-700')
                            }
                        >
                            Sign out
                        </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default Header;