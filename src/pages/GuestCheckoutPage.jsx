// Redirects to /checkout (logged in) or /login?redirect=checkout (guest)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function GuestCheckoutPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  useEffect(() => {
    if (user?._id) navigate('/checkout', { replace: true });
    else navigate('/login?redirect=checkout', { replace: true });
  }, [user, navigate]);
  return null;
}
