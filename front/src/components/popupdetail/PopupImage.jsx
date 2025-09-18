import {useState} from "react";
import '../../style/popupImage.css';

const PopupImage = ({images})=>{
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return(
        <div className="photo-slider">
            <button onClick={prevImage} className="arrow left">{'<'}</button>
            <img className={"popup-image"}
                src={`http://localhost:8080/images?type=popup&id=${images[currentIndex]}`}
                alt={`slide ${currentIndex}`}
            />
            <button onClick={nextImage} className="arrow right">{'>'}</button>
        </div>
    )
}

export default PopupImage;