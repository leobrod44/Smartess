import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';

  
const ImageCarousel = ({ files }: { files: { name: string; url: string }[] }) => (
  <Swiper spaceBetween={10} slidesPerView={1}>
    {files.map((file, index) => (
      <SwiperSlide key={index}>
        <img src={file.url} alt={file.name} className="w-full object-contain" />
      </SwiperSlide>
    ))}
  </Swiper>
);

export default ImageCarousel;
