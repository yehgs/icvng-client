//client
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import { useBulkEntityTranslation } from "../hooks/useBulkEntityTranslation.js";

const HomeSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Translate slider titles/descriptions for the active language
  const translatedSliders = useBulkEntityTranslation("slider", sliders);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await Axios({ ...SummaryApi.getActiveSliders });
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

  // Auto-advance
  useEffect(() => {
    if (translatedSliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === translatedSliders.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders, currentSlide]);

  // Navigation functions
  const nextSlide = () =>
    setCurrentSlide((prev) =>
      prev === translatedSliders.length - 1 ? 0 : prev + 1,
    );
  const prevSlide = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? translatedSliders.length - 1 : prev - 1,
    );
  const goToSlide = (index) => setCurrentSlide(index);

  if (translatedSliders.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded shadow-lg h-64 md:h-96">
      {translatedSliders.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {slide.url ? (
            // Use <a> so full external URLs and internal paths both work correctly
            <a
              href={slide.url}
              target={slide.url.startsWith("http") ? "_blank" : "_self"}
              rel="noreferrer"
              className="block w-full h-full"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </a>
          ) : (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}

      {translatedSliders.length > 1 && (
        <>
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

          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {translatedSliders.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-gray-400"}`}
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
