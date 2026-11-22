import { useCallback, useEffect, useRef, useState, type TouchEvent, type UIEvent } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import Modal from "../Modal/Modal";
import styles from "./StayGallery.module.scss";

interface StayGalleryProps {
  title: string;
  images: { url: string; alt: string }[];
}

const SWIPE_THRESHOLD = 40;

export default function StayGallery({ title, images }: StayGalleryProps) {
  const [activePreview, setActivePreview] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const open = viewerIndex !== null;
  const selectedIndex = Math.min(viewerIndex ?? 0, Math.max(0, images.length - 1));
  const currentImage = images[selectedIndex];
  const closeViewer = useCallback(() => setViewerIndex(null), []);
  const movePhoto = useCallback((direction: number) => {
    setViewerIndex((current) => current === null || images.length === 0
      ? current
      : (current + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    const handleArrow = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      movePhoto(event.key === "ArrowRight" ? 1 : -1);
    };

    document.addEventListener("keydown", handleArrow);
    return () => document.removeEventListener("keydown", handleArrow);
  }, [open, movePhoto]);

  const handlePreviewScroll = (event: UIEvent<HTMLDivElement>) => {
    const { clientWidth, scrollLeft } = event.currentTarget;
    if (clientWidth === 0) return;
    setActivePreview(Math.min(images.length - 1, Math.max(0, Math.round(scrollLeft / clientWidth))));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStart.current = null;
    if (event.touches.length !== 1 || (event.target as Element).closest("button")) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const horizontal = touch.clientX - start.x;
    const vertical = touch.clientY - start.y;
    if (Math.abs(horizontal) < SWIPE_THRESHOLD || Math.abs(horizontal) <= Math.abs(vertical)) return;
    movePhoto(horizontal < 0 ? 1 : -1);
  };

  if (!images.length) return null;

  return (
    <section className={styles.gallery} aria-label={`${title} photo gallery`}>
      <div className={styles.previews} role="group" aria-label="Photo previews" onScroll={handlePreviewScroll}>
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            className={styles.preview}
            aria-label={`Open photo ${index + 1} of ${images.length}: ${image.alt}`}
            onClick={() => setViewerIndex(index)}
          >
            <img src={image.url} alt={image.alt} loading={index === 0 ? "eager" : "lazy"} />
          </button>
        ))}
      </div>
      <div className={styles.previewTools}>
        <span className={styles.counter} aria-label="Current photo" aria-live="polite">
          {Math.min(activePreview + 1, images.length)} / {images.length}
        </span>
        <button type="button" className={styles.allPhotos} onClick={() => setViewerIndex(activePreview)}>
          <Images size={17} aria-hidden="true" />
          All photos
        </button>
      </div>

      <Modal open={open} onClose={closeViewer} title={`${title} photos`} variant="fullscreen">
        {currentImage && (
          <div className={styles.viewer}>
            <div
              className={styles.stage}
              role="group"
              aria-label="Full-size photo"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={() => { touchStart.current = null; }}
            >
              <button
                type="button"
                className={styles.viewerArrow}
                aria-label="Previous photo"
                disabled={images.length < 2}
                onClick={() => movePhoto(-1)}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <div className={styles.imageFrame}>
                <img key={currentImage.url} className={styles.fullImage} src={currentImage.url} alt={currentImage.alt} />
              </div>
              <button
                type="button"
                className={styles.viewerArrow}
                aria-label="Next photo"
                disabled={images.length < 2}
                onClick={() => movePhoto(1)}
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.viewerMeta}>
              <p>{currentImage.alt}</p>
              <span role="status" aria-live="polite">Photo {selectedIndex + 1} of {images.length}</span>
            </div>
            <div className={styles.thumbnails} role="group" aria-label="Choose a photo">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image.url}-${index}`}
                  className={styles.thumbnail}
                  aria-label={`Show photo ${index + 1} of ${images.length}`}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => setViewerIndex(index)}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
