"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [user, setUser] = useState({
        id: '',
        email: '',
        name: '',
        role: '',
        phone: '',
    });

    useEffect(() => {
        const userData = Cookies.get('tk_auth_details');
        if (userData !== null && userData !== undefined) {
            const parsedUserData = JSON.parse(userData);

            const data = async () => {
                const response = await fetch(`https://data.tripknock.in/user/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'admin': parsedUserData.email
                    },
                    body: JSON.stringify({
                        id: parsedUserData.id,
                        email: parsedUserData.email
                    })
                })

                const res = await response.json();
                if (res.status === false) {
                    setIsLoggedIn(false);
                    router.push('/login');
                    setUser({});
                } else {
                    setUser(res);
                    setIsLoggedIn(true);
                }
            }

            data();
        } else {
            setUser({});
            setIsLoggedIn(false);
            router.push('/login');
        }
    }, [pathname]);

    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AppContext.Provider value={{ user, isLoggedIn, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
