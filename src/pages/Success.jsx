import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation.js'

const Success = () => {
  const { t } = useTranslation();
  const location = useLocation()
    
    console.log("location",)  
  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-green-800 font-bold text-lg text-center'>{t("checkout.paymentSuccessfully", { text: Boolean(location?.state?.text) ? location?.state?.text : t("checkout.paymentDefault") })}</p>
        <Link to="/" className="border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1">{t("checkout.goToHome")}</Link>
    </div>
  )
}

export default Success
