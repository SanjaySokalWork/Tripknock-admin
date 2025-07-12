'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dashboard,
  LocationOn,
  DirectionsBus,
  People,
  Settings,
  Home,
  List,
  ExpandMore,
  ExpandLess,
  BeachAccess,
  Category,
  Public,
  Article,
  TagSharp,
  Star,
  RateReview,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const [tourSubmenuOpen, setTourSubmenuOpen] = useState(false);
  const [destinationSubmenuOpen, setDestinationSubmenuOpen] = useState(false);
  const [blogSubmenuOpen, setBlogSubmenuOpen] = useState(false);
  const [reviewsSubmenuOpen, setReviewsSubmenuOpen] = useState(false);

  const { user } = useAppContext();

  const menuItems = [
    { name: 'Dashboard', icon: Dashboard, path: '/' },
    { name: 'Homepage', icon: Home, path: '/homepage' },
    {
      name: 'Destinations',
      icon: LocationOn,
      path: '/destinations',
      submenu: [
        { name: 'All Destinations', icon: LocationOn, path: '/destinations' },
        { name: 'Theme Pages', icon: Category, path: '/themes' },
        { name: 'Countries', icon: Public, path: '/countries' },
      ],
    },
    {
      name: 'Tours',
      icon: DirectionsBus,
      path: '/tours',
      submenu: [
        { name: 'All Tours', icon: List, path: '/tours' },
        { name: 'Seasons', icon: BeachAccess, path: '/tour-seasons' },
        { name: 'Themes', icon: Category, path: '/tour-themes' },
        { name: 'Tour Includes', icon: List, path: '/tour-includes' },
      ],
    },
    {
      name: 'Blogs',
      icon: Article,
      path: '/blog/blogs',
      submenu: [
        { name: 'All Blogs', icon: Article, path: '/blog/blogs' },
        { name: 'Categories', icon: Public, path: '/blog/categories' },
        { name: 'Tags', icon: TagSharp, path: '/blog/tags' },
        { name: 'Comments', icon: List, path: '/blog/comments' },
      ],
    },
    { name: 'Reviews', icon: Star, path: '/reviews' },
    { name: 'Users', icon: People, path: '/users' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const isTourSection = pathname.includes('/tour-') || pathname === '/tours';
    const isDestinationSection = pathname.includes('/destination') || pathname === '/countries';
    const isBlogSection = pathname.includes('/blog');
    const isReviewSection = pathname.includes('/review');

    setTourSubmenuOpen(isTourSection);
    setDestinationSubmenuOpen(isDestinationSection);
    setBlogSubmenuOpen(isBlogSection);
    setReviewsSubmenuOpen(isReviewSection);
  }, [pathname]);

  return (
    <aside
      className={`${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-64 lg:translate-x-0'
        } fixed lg:relative z-30 transition-all flex flex-col duration-300 ease-in-out h-screen bg-white border-r border-gray-200`}
    >
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary-600">TripKnock</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => {
                      if (item.name === 'Tours') setTourSubmenuOpen(!tourSubmenuOpen);
                      if (item.name === 'Destinations') setDestinationSubmenuOpen(!destinationSubmenuOpen);
                      if (item.name === 'Blogs') setBlogSubmenuOpen(!blogSubmenuOpen);
                      if (item.name === 'Reviews') setReviewsSubmenuOpen(!reviewsSubmenuOpen);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isActive(item.path) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {(
                      (item.name === 'Tours' && tourSubmenuOpen) ||
                      (item.name === 'Destinations' && destinationSubmenuOpen) ||
                      (item.name === 'Blogs' && blogSubmenuOpen) ||
                      (item.name === 'Reviews' && reviewsSubmenuOpen)
                    ) ? (
                      <ExpandLess className="w-5 h-5" />
                    ) : (
                      <ExpandMore className="w-5 h-5" />
                    )}
                  </button>
                  {((item.name === 'Tours' && tourSubmenuOpen) ||
                    (item.name === 'Destinations' && destinationSubmenuOpen) ||
                    (item.name === 'Blogs' && blogSubmenuOpen) ||
                    (item.name === 'Reviews' && reviewsSubmenuOpen)) && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              href={subItem.path}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(subItem.path)
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <subItem.icon className="w-5 h-5" />
                              <span className="font-medium">{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-2 border-t mt-auto border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium">{user?.role?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{user?.role.charAt(0).toUpperCase() + "" + user?.role.substring(1)}</div>
            {/* <div className="text-xs text-gray-500">{user?.email}</div> */}
          </div>
        </div>
      </div>
    </aside>
  );
}
