import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ImageCarousel = ({
  files,
}: {
  files: { name: string; url: string }[];
}) => {
  if (!files || files.length === 0) return null;

  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      navigation
      modules={[Navigation]}
      className="w-full"
    >
      {files.map((file, index) => (
        <SwiperSlide
          key={index}
          className="flex justify-center items-center"
        >
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-auto max-h-[400px] rounded-lg object-contain"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageCarousel;
