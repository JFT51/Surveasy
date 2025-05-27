import React, { useState } from 'react';

function FileUploader() {
  const [cv, setCv] = useState(null);
  const [audio, setAudio] = useState(null);

  const handleCvChange = (e) => setCv(e.target.files[0]);
  const handleAudioChange = (e) => setAudio(e.target.files[0]);

  const handleUpload = () => {
    if (cv && audio) {
      alert(`Uploaded: ${cv.name} and ${audio.name}`);
    } else {
      alert('Please upload both files.');
    }
  };

  return (
    <div>
      <h2>Upload CV en Interview Audio</h2>
      <input type="file" accept=".pdf" onChange={handleCvChange} />
      <input type="file" accept="audio/*" onChange={handleAudioChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default FileUploader;
