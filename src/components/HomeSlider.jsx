import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const HomeSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch active sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getActiveSliders,
      });
      const { data: responseData } = response;

      if (responseData.success && responseData.data.length > 0) {
        setSliders(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (sliders.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [sliders, currentSlide]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 animate-pulse rounded">
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Loading slider...
        </div>
      </div>
    );
  }

  if (sliders.length === 0) {
    return null; // Hide slider section if no sliders are available
  }

  return (
    <div className="relative overflow-hidden rounded shadow-lg h-64 md:h-96">
      {sliders.map((slide, index) => {
        const SlideContent = () => (
          <Link href={slide.url} className="">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4">
              <h2 className="text-xl md:text-2xl font-bold">{slide.title}</h2>
              {slide.description && (
                <p className="text-sm md:text-base mt-1">{slide.description}</p>
              )}
            </div> */}
          </Link>
        );

        return (
          <div
            key={slide._id}
            className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.url ? (
              <Link to={slide.url} className="block w-full h-full">
                <SlideContent />
              </Link>
            ) : (
              <SlideContent />
            )}
          </div>
        );
      })}

      {/* Only show navigation controls if there's more than one slide */}
      {sliders.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-20"
            onClick={prevSlide}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-20"
            onClick={nextSlide}
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {sliders.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-gray-400'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeSlider;
