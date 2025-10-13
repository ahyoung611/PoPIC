import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function PopupImage({ images = [] }) {
  if (!images || images.length === 0) {
    return <div>이미지가 없습니다…</div>;
  }

  const urlOf = (id) =>
    `http://localhost:8080/images?type=popup&id=${id}`;

  return (
    <div className="popupStore-detail">
      {/* 슬라이드 */}
      <Swiper
        className="popupStore-Swiper"
        modules={[Autoplay, Pagination]}
        loop
        speed={800}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        pagination={{ el: ".popupStore-progress", type: "progressbar" }}
      >
        {images.map((id, i) => (
          <SwiperSlide
            key={id ?? i}
            style={{ "--bg": `url('${urlOf(id)}')` }}
          >
            <img className="slide-img" src={urlOf(id)} alt={`popup slide ${i + 1}`} />
          </SwiperSlide>
        ))}

        {/* 진행바 */}
        <div className="swiper-pagination popupStore-progress" />
      </Swiper>
    </div>
  );
}
