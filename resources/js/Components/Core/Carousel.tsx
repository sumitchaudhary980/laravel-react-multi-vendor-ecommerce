import {
  useEffect,
  useState,
} from 'react';

import { Image } from '@/types';

function Carousel({ images }: { images: Image[] }) {
        const [selectedImage, setSelectedImage] = useState<Image>(images[0]);
        const [touchStartX, setTouchStartX] = useState<number | null>(null);

        useEffect(() => {
            if (images.length > 0) {
                setSelectedImage(images[0]);
            }
        }, [images]); // Pass `images` as a dependency array.

        // Function to handle swipe gestures
        const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
            setTouchStartX(e.touches[0].clientX);
        };

        const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
            if (touchStartX === null) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchDifference = touchStartX - touchEndX;

            // Determine swipe direction
            if (touchDifference > 50) {
                // Swipe left - Show next image
                const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                const nextIndex = (currentIndex + 1) % images.length;
                setSelectedImage(images[nextIndex]);
            } else if (touchDifference < -50) {
                // Swipe right - Show previous image
                const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                const prevIndex = (currentIndex - 1 + images.length) % images.length;
                setSelectedImage(images[prevIndex]);
            }

            setTouchStartX(null);
        };

        return (
            <>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
                    <div className="flex md:flex-col items-center gap-2 py-2">
                        {images.map((image: Image, i: number) => (
                            <button
                                onClick={() => setSelectedImage(image)}
                                className={
                                    'border-2 ' +
                                    (selectedImage.id === image.id
                                        ? 'border-blue-500'
                                        : 'hover:border-blue-500')
                                }
                                key={image.id}
                            >
                                <img
                                    src={image.thumb}
                                    alt=""
                                    className="w-[50px]"
                                />
                            </button>
                        ))}
                    </div>
                    <div
                        className="carousel w-full"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="carousel-item w-full">
                            <img
                                src={selectedImage.large}
                                alt=""
                                className="w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    export default Carousel;
