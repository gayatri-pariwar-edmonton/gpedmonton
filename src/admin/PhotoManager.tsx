import React, { useEffect, useState } from "react";
import "./PhotoManager.css";
import { adminFetch } from "../utils/adminAuth";

interface PhotoData {
  _id?: string;
  title: string;
  link: string;
  date?: string;
  imageUrl?: string;
  driveFileId?: string;
}

const PhotoManager: React.FC = () => {
  const [tab, setTab] = useState<"current" | "archive">("current");
  const [photos, setPhotos] = useState<{ current: PhotoData[]; archive: PhotoData[] }>({
    current: [],
    archive: [],
  });
  const [newPhoto, setNewPhoto] = useState({ title: "", link: "", date: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/photos")
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error("Error fetching photos:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPhoto(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let res;
      if (tab === "current") {
        if (!imageFile) {
          alert("Please upload an image");
          return;
        }

        const formData = new FormData();
        formData.append("title", newPhoto.title);
        formData.append("link", newPhoto.link);
        formData.append("date", newPhoto.date);
        formData.append("image", imageFile);

        res = await adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setPhotos(prev => ({ ...prev, current: [...prev.current, data] }));
      } else {
        res = await adminFetch("https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/photos/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newPhoto.title,
            link: newPhoto.link,
          }),
        });

        const data = await res.json();
        setPhotos(prev => ({ ...prev, archive: [...prev.archive, data] }));
      }

      setNewPhoto({ title: "", link: "", date: "" });
      setImageFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload photo. Check console for details.");
    }
  };

  /** 🗑 Delete photo (current or archive) */
  const handleDelete = async (id?: string, type?: "current" | "archive") => {
    if (!id || !type) return;

    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      const res = await adminFetch(`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete photo");

      // Optimistically remove from UI
      setPhotos(prev => ({
        ...prev,
        [type]: prev[type].filter(p => p._id !== id),
      }));
    } catch (err) {
      console.error("Error deleting photo:", err);
      alert("Failed to delete photo.");
    }
  };

  return (
    <div className="photo-manager">
      <div className="photo-tabs">
        <button onClick={() => setTab("current")} className={tab === "current" ? "active" : ""}>
          Current Photos
        </button>
        <button onClick={() => setTab("archive")} className={tab === "archive" ? "active" : ""}>
          Archive Photos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="photo-form">
        <input
          type="text"
          name="title"
          placeholder="Album Title"
          value={newPhoto.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="link"
          placeholder="Google Photos / Album Link (optional)"
          value={newPhoto.link}
          onChange={handleChange}
        />

        {tab === "current" && (
          <>
            <input
              type="date"
              name="date"
              value={newPhoto.date}
              onChange={handleChange}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} required />
          </>
        )}

        <button type="submit">Upload</button>
      </form>

      <div className="photo-list">
        {tab === "current"
          ? photos.current.map(p => (
              <div key={p._id} className="photo-item">
                {p.imageUrl && (
                  <img src={`https://gpedmonton-api.gpedmonton-cloudflare.workers.dev/api/proxy/image/${p.driveFileId}`} alt={p.title} />
                )}
                <h4>{p.title}</h4>
                <a href={p.link} target="_blank" rel="noopener noreferrer">View Album</a>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p._id, "current")}
                >
                  Delete
                </button>
              </div>
            ))
          : photos.archive.map(p => (
              <div key={p._id} className="photo-item">
                <h4>{p.title}</h4>
                <a href={p.link} target="_blank" rel="noopener noreferrer">View Album</a>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p._id, "archive")}
                >
                  Delete
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default PhotoManager;
