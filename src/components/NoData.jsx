import React from 'react'
import noDataImage from '../assets/nothing here yet.webp'
import { useCountry } from '../context/CountryContext'

const NoData = () => {
  const { t } = useCountry();
  return (
    <div className='flex flex-col items-center justify-center p-4 gap-2'>
      <img
        src={noDataImage}
        alt={t('shop.noResultsAlt')}
        className='w-36' 
      />
      <p className='text-neutral-500'>{t('shop.noDataFound')}</p>
    </div>
  )
}

export default NoData
