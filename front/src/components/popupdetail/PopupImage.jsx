import { useState } from "react";

const PopupImage = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const showBtn = images.length > 1;

    return (
        <div className="popupStore-detail photo-slider">
            {showBtn && (
                <button onClick={prevImage} className="arrow left">{'<'}</button>
            )}
            <img
                className="popup-image"
                src={`http://localhost:8080/images?type=popup&id=${images[currentIndex]}`}
                alt={`slide ${currentIndex}`}
            />
            {showBtn && (
                <button onClick={nextImage} className="arrow right">{'>'}</button>
            )}
        </div>
    );
};

export default PopupImage;
