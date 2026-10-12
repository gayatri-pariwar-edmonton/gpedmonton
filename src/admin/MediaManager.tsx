import React, { useEffect, useState } from "react";
import "./MediaManager.css";
import { adminFetch } from "../utils/adminAuth";

interface MediaData {
  _id?: string;
  title: string;
  audioUrl?: string; // for uploaded audio
  videoLink?: string; // for video links
  type: "music" | "video";
  driveFileId?: string;
}

const MediaManager: React.FC = () => {
  const [tab, setTab] = useState<"music" | "video">("music");
  const [media, setMedia] = useState<{ music: MediaData[]; videos: MediaData[] }>({
    music: [],
    videos: [],
  });
  const [newMedia, setNewMedia] = useState({ title: "", link: "" });
  const [file, setFile] = useState<File | null>(null);

  // Fetch music + videos on mount
  useEffect(() => {
    adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/media")
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error("Error fetching media:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMedia((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  /** Upload media depending on tab */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let res;
      if (tab === "music") {
        if (!file) {
          alert("Please upload an audio file.");
          return;
        }
        const formData = new FormData();
        formData.append("title", newMedia.title);
        formData.append("audio", file);

        res = await adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/media/music/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setMedia((prev) => ({ ...prev, music: [...prev.music, data] }));
      } else {
        res = await adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/media/video/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newMedia.title,
            link: newMedia.link,
          }),
        });

        const data = await res.json();
        setMedia((prev) => ({ ...prev, videos: [...prev.videos, data] }));
      }

      // Reset inputs
      setNewMedia({ title: "", link: "" });
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload media.");
    }
  };

  /** Delete a media item */
  const handleDelete = async (id?: string, type?: "music" | "video") => {
    if (!id || !type) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await adminFetch(`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/media/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete media");

      setMedia((prev) => ({
        ...prev,
        [type === "music" ? "music" : "videos"]: prev[
          type === "music" ? "music" : "videos"
        ].filter((m) => m._id !== id),
      }));
    } catch (err) {
      console.error("Error deleting media:", err);
      alert("Failed to delete media.");
    }
  };

  return (
    <div className="media-manager">
      <div className="media-tabs">
        <button
          onClick={() => setTab("music")}
          className={tab === "music" ? "active" : ""}
        >
          Music
        </button>
        <button
          onClick={() => setTab("video")}
          className={tab === "video" ? "active" : ""}
        >
          Videos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="media-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newMedia.title}
          onChange={handleChange}
          required
        />

        {tab === "music" ? (
          <>
            <label>Upload Audio File</label>
            <input type="file" accept="audio/*" onChange={handleFileChange} required />
          </>
        ) : (
          <>
            <input
              type="text"
              name="link"
              placeholder="YouTube / Video URL"
              value={newMedia.link}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">Upload</button>
      </form>

      <div className="media-list">
        {tab === "music"
          ? media.music.map((m) => (
              <div key={m._id} className="media-item">
                <h4>{m.title}</h4>
                {m.audioUrl && (
                  <audio controls>
                    <source src={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/audio/${m.driveFileId}`} type="audio/mpeg" />
                  </audio>
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(m._id, "music")}
                >
                  Delete
                </button>
              </div>
            ))
          : media.videos.map((v) => (
              <div key={v._id} className="media-item">
                <h4>{v.title}</h4>
                <a
                  href={v.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-link"
                >
                  Watch Video
                </a>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(v._id, "video")}
                >
                  Delete
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MediaManager;

