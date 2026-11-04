(() => {
  const $ = (id) => document.getElementById(id);
  const imageInput = $("freeSceneImage");
  const createButton = $("freeCreateVideo");
  if (!imageInput || !createButton) return;

  const status = $("freeVideoStatus");
  const preview = $("freeVideoPreview");
  const download = $("freeVideoDownload");

  createButton.addEventListener("click", async () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      status.textContent = "Please choose an image first.";
      return;
    }
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      status.textContent = "Video export is not supported in this browser. Try an updated Chrome browser.";
      return;
    }

    const duration = Number($("freeVideoDuration").value);
    const motion = $("freeCameraMotion").value;
    if (![5, 10].includes(duration)) {
      status.textContent = "Choose 5 or 10 seconds.";
      return;
    }

    createButton.disabled = true;
    preview.style.display = "none";
    download.style.display = "none";
    status.textContent = "Loading image...";

    let stream;
    let imageUrl;
    try {
      const image = new Image();
      imageUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Image could not be opened."));
        image.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable.");

      const mimeType = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm"
      ].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error("This browser cannot export WebM video.");

      stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = event => {
        if (event.data && event.data.size) chunks.push(event.data);
      };

      const finished = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = () => reject(new Error("Recording failed."));
      });

      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.max(width / image.width, height / image.height);
      const baseW = image.width * scale;
      const baseH = image.height * scale;
      const frames = duration * 30;
      let frame = 0;

      function render() {
        const p = Math.min(frame / frames, 1);
        const eased = p * p * (3 - 2 * p);
        const zoom = motion === "pull" ? 1.14 - 0.14 * eased
          : motion === "zoom" ? 1 + 0.14 * eased : 1.08;
        const drawW = baseW * zoom;
        const drawH = baseH * zoom;
        let offsetX = 0;
        if (motion === "pan") offsetX = (drawW - width) * eased;
        const x = (width - drawW) / 2 - offsetX;
        const y = (height - drawH) / 2;

        ctx.fillStyle = "#080808";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, x, y, drawW, drawH);

        const shade = ctx.createLinearGradient(0, 0, 0, height);
        shade.addColorStop(0, "rgba(0,0,0,0.12)");
        shade.addColorStop(0.55, "rgba(0,0,0,0)");
        shade.addColorStop(1, "rgba(0,0,0,0.28)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, width, height);

        frame += 1;
        status.textContent = `Rendering in your browser: ${Math.min(100, Math.round(frame / frames * 100))}%`;
        if (frame <= frames) requestAnimationFrame(render);
        else if (recorder.state === "recording") recorder.stop();
      }

      recorder.start(250);
      render();
      await finished;

      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) throw new Error("The exported video is empty.");
      const videoUrl = URL.createObjectURL(blob);
      preview.src = videoUrl;
      preview.style.display = "block";
      preview.load();
      download.href = videoUrl;
      download.download = "filmatrix-cinematic-scene.webm";
      download.style.display = "inline-block";
      status.textContent = "Your cinematic clip is ready. Preview it and tap Download video.";
    } catch (error) {
      status.textContent = "Could not create video: " + error.message;
    } finally {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      createButton.disabled = false;
    }
  });
})();
