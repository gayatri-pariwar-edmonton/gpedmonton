import { FaMusic, FaVideo } from "react-icons/fa6";
import MusicCard from "../components/MusicCard";
import { forwardRef, useEffect, useState } from "react";
import "./Resources.css";

interface MediaData {
  _id: string;
  title: string;
  audioUrl?: string;
  videoLink?: string;
  type: "music" | "video";
  driveFileId?: string;
}

const Resources = forwardRef<HTMLElement>((_, ref) => {
  const [media, setMedia] = useState<{ music: MediaData[]; videos: MediaData[] }>({
    music: [],
    videos: [],
  });

  useEffect(() => {
    fetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/media")
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error("Error fetching media:", err));
  }, []);

  return (
    <main className="resources-root">
      {/* MUSIC SECTION */}
      <section className="resource-section">
        <FaMusic />
        <h2>Music / Mantra Recordings</h2>
        <div className="music-list">
          {media.music.length > 0 ? (
            media.music.map((item) => (
              <MusicCard
                key={item._id}
                name={item.title}
                audioUrl={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/audio/${item.driveFileId}`}
              />
            ))
          ) : (
            <p>We are sorry for the inconvenience. We are updating our music library.</p>
          )}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="resource-section" ref={ref}>
        <FaVideo />
        <h2>Videos</h2>
        <ul className="video-archive-list">
          {media.videos.length > 0 ? (
            media.videos.map((video) => (
              <li key={video._id}>
                <a
                  href={video.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-archive-link"
                >
                  {video.title}
                </a>
              </li>
            ))
          ) : (
            <p>We are sorry for the inconvenience. We are updating our video library.</p>
          )}
        </ul>
      </section>
    </main>
  );
});

export default Resources;