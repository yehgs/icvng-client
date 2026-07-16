//client
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Divider from './Divider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { logout } from '../store/userSlice';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import {
  HiOutlineExternalLink,
} from 'react-icons/hi';

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout,
      });
      console.log('logout', response);
      if (response.data.success) {
        if (close) {
          close();
        }
        dispatch(logout());
        localStorage.clear();
        toast.success(response.data.message);
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
    }
  };

  const handleClose = () => {
    if (close) {
      close();
    }
  };

  const userMenuItems = [
    { path: '/dashboard/myorders', label: 'My Orders' },
    { path: '/dashboard/user-request', label: 'Your Requests' },
    { path: '/dashboard/address', label: 'Saved Addresses' },
    { path: '/dashboard/wishlist', label: 'Wishlist' },
    { path: '/dashboard/track', label: 'Track Your Shipment' },
  ];

  return (
    <div className="border rounded p-2 border-b-gray-500">
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-2">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile}{' '}
          <span className="text-medium text-red-600">
            {user.role === 'ADMIN' ? '(Admin)' : ''}
          </span>
        </span>
        <Link
          onClick={handleClose}
          to={'/dashboard/profile'}
          className="hover:text-primary-200"
        >
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm grid gap-1">
        <div className="font-medium text-xs text-gray-500 px-2 py-1">
          Personal
        </div>
        {userMenuItems.map((item) => (
          <Link
            key={item.path}
            onClick={handleClose}
            to={item.path}
            className="px-2 hover:bg-orange-200 py-1"
          >
            {item.label}
          </Link>
        ))}

        <Divider />
        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-red-100 hover:text-red-700 py-1 font-medium"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
