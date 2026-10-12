import { forwardRef, useEffect, useState } from "react";
import Photos from "../components/Photos";
import "./PhotoGallery.css";

interface PhotoData {
  _id?: string;
  title: string;
  date?: string;
  imageUrl?: string;
  link: string;
  driveFileId?: string;
  isArchived?: boolean;
}

const PhotoGallery = forwardRef<HTMLElement>((_, ref) => {
  const [currentPhotos, setCurrentPhotos] = useState<PhotoData[]>([]);
  const [archivePhotos, setArchivePhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/photos")
      .then(res => res.json())
      .then(data => {
        setCurrentPhotos(Array.isArray(data.current) ? data.current : []);
        setArchivePhotos(Array.isArray(data.archive) ? data.archive : []);
      })
      .catch(err => console.error("Error fetching photos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading photos...</p>;

  // Group current photos by year (based on `date`)
  const groupedByYear = currentPhotos.reduce((acc, photo) => {
    let year = "Unknown";
    if (photo.date) {
      const parsedYear = new Date(photo.date).getFullYear();
      if (!isNaN(parsedYear)) year = String(parsedYear);
    }
    acc[year] = acc[year] || [];
    acc[year].push(photo);
    return acc;
  }, {} as Record<string, PhotoData[]>);

  // Sort years descending (e.g., 2025, 2024)
  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main className="photos-root">
      <div>
        <h1>Photo Gallery</h1>
      </div>

      {/* Current Photos Section */}
      <h2>Current Photos</h2>
      <section ref={ref} className="current-photos-section">
        <div className="photo-years-grid">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2>{year}</h2>
              <div className="current-photos-list">
                {groupedByYear[year].map((photo) => (
                  <Photos
                    key={photo._id}
                    title={photo.title}
                    date={photo.date || ""}
                    image={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/image/${photo.driveFileId}`}
                    link={photo.link}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Archive Section */}
      <section ref={ref} className="past-photos-section">
        <h2>Photo Archive</h2>
        {archivePhotos.length > 0 ? (
          <ul className="archive-photo-list">
            {archivePhotos.map((photo) => (
              <li key={photo._id}>
                <a
                  href={photo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="past-photo-link"
                >
                  {photo.title}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No archived photos yet.</p>
        )}
      </section>
    </main>
  );
});

export default PhotoGallery;