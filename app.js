
const $ = id => document.getElementById(id);

// FILMATRIX AI storage
const PROJECT_KEY = "filmatrix_projects";
const CREDIT_KEY = "filmatrix_daily_credits";
const DAILY_CREDITS = 16;

let imageData = "";

let savedProjects = JSON.parse(
  localStorage.getItem(PROJECT_KEY) ||
  localStorage.getItem("alphamen_projects") ||
  "[]"
);

// DAILY CREDIT SYSTEM
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCreditData() {
  let data;

  try {
    data = JSON.parse(localStorage.getItem(CREDIT_KEY) || "null");
  } catch {
    data = null;
  }

  if (!data || data.date !== todayKey()) {
    data = {
      date: todayKey(),
      balance: DAILY_CREDITS
    };
    localStorage.setItem(CREDIT_KEY, JSON.stringify(data));
  }

  return data;
}

function updateCredits() {
  const data = getCreditData();
  const display = $("creditBalance");

  if (display) {
    display.textContent = data.balance + " Credits";
  }

  return data.balance;
}

function spendCredits(amount) {
  updateCredits();
  return true;
}

function getVideoCreditCost(seconds) {
  return Number(seconds) > 300 ? 2 : 1;
}

function formatDuration(seconds) {
  seconds = Number(seconds);

  if (seconds < 60) return seconds + " seconds";
  if (seconds % 60 === 0) return (seconds / 60) + " minutes";

  return seconds + " seconds";
}

// SAVE PROJECTS
function saveProject(title, content) {
  savedProjects.unshift({
    title,
    content,
    date: new Date().toLocaleString()
  });

  savedProjects = savedProjects.slice(0, 15);

  localStorage.setItem(PROJECT_KEY, JSON.stringify(savedProjects));
  renderSaved();
}

function renderSaved() {
  const list = $("savedList");
  if (!list) return;

  if (!savedProjects.length) {
    list.textContent = "No projects saved yet.";
    return;
  }

  list.innerHTML = "";

  savedProjects.forEach((item, index) => {
    const div = document.createElement("div");
    div.style.padding = "12px";
    div.style.marginBottom = "10px";
    div.style.border = "1px solid #66502c";
    div.style.borderRadius = "8px";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date;

    const open = document.createElement("button");
    open.textContent = "OPEN";
    open.onclick = () => showBrief(item.content);

    const remove = document.createElement("button");
    remove.textContent = "DELETE";
    remove.style.marginLeft = "8px";

    remove.onclick = () => {
      savedProjects.splice(index, 1);
      localStorage.setItem(PROJECT_KEY, JSON.stringify(savedProjects));
      renderSaved();
    };

    div.append(title, date, open, remove);
    list.appendChild(div);
  });
}

function showBrief(content) {
  $("brief").textContent = content;
  $("result").classList.remove("hidden");
  $("result").scrollIntoView({ behavior: "smooth" });
}

function downloadText(filename, content) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// SCENE PROMPT PRESETS
document.querySelectorAll("#presets button").forEach(button => {
  button.addEventListener("click", () => {
    $("prompt").value = button.dataset.prompt || "";
  });
});

// REFERENCE IMAGE PREVIEW
$("imageInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Please choose an image under 5 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    imageData = reader.result;
    $("imagePreview").innerHTML = "";

    const img = document.createElement("img");
    img.src = imageData;
    img.alt = "Selected reference image";

    $("imagePreview").appendChild(img);
  };

  reader.readAsDataURL(file);
});

// VIDEO PROMPT BUILDER
$("buildBtn").addEventListener("click", () => {
  const prompt = $("prompt").value.trim();

  if (!prompt) {
    alert("Please describe your scene first.");
    $("prompt").focus();
    return;
  }

  const brief = `FILMATRIX AI - VIDEO GENERATION BRIEF

Scene prompt:
${prompt}

Creation mode: ${$("mode").value}
Aspect ratio: ${$("ratio").value}
Target quality: ${$("resolution").value}
Clip length: ${$("duration").value}
Voice-over: ${$("voice").value}
Visual style: ${$("style").value}

Reference image: ${imageData ? "Selected" : "Not selected"}

Production notes:
Keep character appearance consistent.
Use cinematic camera movement.
Use realistic lighting and smooth motion.

IMPORTANT:
This is a generation brief, not a rendered video.
Connect an AI video-generation service to render the clip.`;

  showBrief(brief);
  saveProject("Video Scene", brief);
});

// STORY TO SCENE BREAKDOWN
$("storyBtn").addEventListener("click", () => {
  const name = $("movieName").value.trim() || "Untitled Movie";
  const story = $("story").value.trim();

  if (!story) {
    alert("Please enter your movie story.");
    $("story").focus();
    return;
  }

  const sentences = story
    .split(/(?<=[.!?।])\s+|\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  const scenes = sentences.map((sentence, index) => {
    return `SCENE ${index + 1}

Story:
${sentence}

VISUAL PROMPT:
Cinematic 3D realistic movie scene.
${sentence}
Professional movie lighting, detailed environment,
smooth camera movement, consistent characters.

VOICE-OVER:
${sentence}

`;
  }).join("\n");

  const output = `FILMATRIX AI MINI MOVIE PLAN

Movie: ${name}
Duration: ${$("movieDuration").value}
Language: ${$("movieLanguage").value}

TOTAL SCENES: ${sentences.length}

${scenes}

NEXT PRODUCTION STEPS:
1. Generate scene images.
2. Animate each scene using an AI video model.
3. Create Telugu voice-over.
4. Add character lip sync.
5. Join scenes in the movie editor.
6. Add music, effects and subtitles.
7. Export the final movie.`;

  $("sceneOutput").textContent = output;
  showBrief(output);
  saveProject(name, output);
});

// LIP SYNC PREPARATION
$("lipBtn").addEventListener("click", () => {
  const dialogue = $("dialogue").value.trim();
  const audio = $("lipAudio").files[0];
  const photo = $("lipImage").files[0];

  if (!dialogue && !audio) {
    alert("Enter dialogue or select an audio file.");
    return;
  }

  const report = `FILMATRIX AI - LIP SYNC PROJECT

Dialogue:
${dialogue || "Use selected audio"}

Audio file:
${audio ? audio.name : "Not selected"}

Character photo:
${photo ? photo.name : "Not selected"}

Language: Telugu
Task: Synchronize character mouth movement with speech.

RENDERING:
A compatible AI lip-sync model and backend are required.
This brief does not render a talking video by itself.`;

  showBrief(report);
  saveProject("Lip Sync Project", report);
});

// COPY BRIEF
$("copyBtn").addEventListener("click", async () => {
  const text = $("brief").textContent;

  try {
    await navigator.clipboard.writeText(text);
    alert("Brief copied successfully!");
  } catch {
    alert("Copy not supported. Please select and copy the text.");
  }
});

// DOWNLOAD BRIEF
$("downloadBtn").addEventListener("click", () => {
  downloadText("filmatrix-movie-brief.txt", $("brief").textContent);
});

// IMAGE TO VIDEO PREVIEW
const sceneImage = $("sceneImage");
const scenePreview = $("scenePreview");
const videoPrompt = $("videoPrompt");
const videoStatus = $("videoStatus");
const generateVideoBtn = $("generateVideoBtn");

if (sceneImage && scenePreview) {
  sceneImage.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      sceneImage.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image under 10 MB.");
      sceneImage.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      scenePreview.src = reader.result;
      scenePreview.style.display = "block";
      videoStatus.textContent =
        "Image uploaded successfully. Enter your visual prompt.";
    };

    reader.readAsDataURL(file);
  });
}

// IMAGE TO VIDEO + CREDIT CHECK

// IMAGE TO VIDEO - MAGIC HOUR BACKEND
const WORKER_URL = "https://patient-mode-be97.prem181295.workers.dev";

if (generateVideoBtn) {
  generateVideoBtn.addEventListener("click", async () => {
    const file = sceneImage?.files?.[0];
    const prompt = videoPrompt?.value.trim();
    const duration = Number($("videoDuration").value);

    if (!file) {
      alert("Please upload a scene image first.");
      return;
    }

    if (!prompt) {
      alert("Please enter a visual prompt.");
      videoPrompt.focus();
      return;
    }

    if (![3, 4, 5].includes(duration)) {
      alert("Choose a duration of 3, 4, or 5 seconds.");
      return;
    }

    generateVideoBtn.disabled = true;
    videoStatus.textContent = "Uploading image to Magic Hour...";

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("prompt", prompt);
      form.append("duration", String(duration));

      const accessCode = prompt("Enter FILMATRIX Access Code:");

if (!accessCode) {
  videoStatus.textContent = "Access code required.";
  return;
}

const response = await fetch(`${WORKER_URL}/generate`, {
  method: "POST",
  headers: {
    "X-FILMATRIX-ACCESS-CODE": accessCode
  },
  body: form
});

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Video request failed.");
      }

      const project = result.project || {};
      const projectId =
        project.id || project.project_id || project.video_project_id;

      if (!projectId) {
        throw new Error("Project ID was not returned by the video service.");
      }

      videoStatus.textContent = "Video is rendering...";

      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const statusResponse = await fetch(
  `${WORKER_URL}/status?id=${encodeURIComponent(projectId)}`,
  {
    headers: {
      "X-FILMATRIX-ACCESS-CODE": accessCode
    }
  }
);
        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(statusData.error || "Could not check video status.");
        }

        const state = String(statusData.status || "").toLowerCase();

        if (state === "complete") {
          const downloads = statusData.downloads || [];
          const videoUrl =
            statusData.download_url ||
            statusData.video_url ||
            (Array.isArray(downloads)
              ? downloads[0]?.url
              : downloads?.url);

          if (!videoUrl) {
            videoStatus.textContent =
              "Video completed. Download link was not found in the response.";
            return;
          }

          videoStatus.textContent = "Video ready!";

          const link = document.createElement("a");
          link.href = videoUrl;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = "DOWNLOAD YOUR VIDEO";
          link.style.display = "block";
          link.style.marginTop = "12px";

          videoStatus.appendChild(document.createElement("br"));
          videoStatus.appendChild(link);
          return;
        }

        if (["error", "canceled"].includes(state)) {
          throw new Error("Video rendering failed: " + state);
        }

        videoStatus.textContent = `Video rendering: ${state || "processing"}...`;
      }

      videoStatus.textContent =
        "Rendering is taking longer. Check again later.";

    } catch (error) {
      videoStatus.textContent = "Error: " + error.message;
    } finally {
      generateVideoBtn.disabled = false;
    }
  });
}

}

// STARTUP
renderSaved();
updateCredits();
