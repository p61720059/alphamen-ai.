
const $ = id => document.getElementById(id);

let imageData = "";
let savedProjects = JSON.parse(localStorage.getItem("alphamen_projects") || "[]");

function saveProject(title, content) {
  savedProjects.unshift({
    title,
    content,
    date: new Date().toLocaleString()
  });

  savedProjects = savedProjects.slice(0, 15);
  localStorage.setItem("alphamen_projects", JSON.stringify(savedProjects));
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
      localStorage.setItem("alphamen_projects", JSON.stringify(savedProjects));
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
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Scene prompt presets
document.querySelectorAll("#presets button").forEach(button => {
  button.addEventListener("click", () => {
    $("prompt").value = button.dataset.prompt || "";
  });
});

// Reference image preview
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

// Video prompt builder
$("buildBtn").addEventListener("click", () => {
  const prompt = $("prompt").value.trim();

  if (!prompt) {
    alert("Please describe your scene first.");
    $("prompt").focus();
    return;
  }

  const brief = `ALPHAMEN AI - VIDEO GENERATION BRIEF

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

// Story to scene breakdown
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

  const output = `ALPHAMEN AI MINI MOVIE PLAN

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

// Lip sync preparation
$("lipBtn").addEventListener("click", () => {
  const dialogue = $("dialogue").value.trim();
  const audio = $("lipAudio").files[0];
  const photo = $("lipImage").files[0];

  if (!dialogue && !audio) {
    alert("Enter dialogue or select an audio file.");
    return;
  }

  const report = `ALPHAMEN AI - LIP SYNC PROJECT

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

// Copy brief
$("copyBtn").addEventListener("click", async () => {
  const text = $("brief").textContent;

  try {
    await navigator.clipboard.writeText(text);
    alert("Brief copied successfully!");
  } catch {
    alert("Copy not supported. Please select and copy the text.");
  }
});

// Download brief
$("downloadBtn").addEventListener("click", () => {
  downloadText("alphamen-movie-brief.txt", $("brief").textContent);
});

renderSaved();

// IMAGE TO VIDEO - IMAGE PREVIEW
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
      videoStatus.textContent = "Image uploaded successfully. Enter your visual prompt.";
    };

    reader.readAsDataURL(file);
  });
}

// GENERATE VIDEO - BACKEND CONNECTION PENDING
if (generateVideoBtn) {
  generateVideoBtn.addEventListener("click", () => {
    const file = sceneImage?.files?.[0];
    const prompt = videoPrompt?.value.trim();

    if (!file) {
      alert("Please upload a scene image first.");
      return;
    }

    if (!prompt) {
      alert("Please enter a visual prompt.");
      videoPrompt.focus();
      return;
    }

    videoStatus.textContent =
      "Image and prompt are ready. Connect an AI video-generation backend to render your video.";

    const report = `ALPHAMEN AI - IMAGE TO VIDEO PROJECT

Image: ${file.name}
Visual Prompt:
${prompt}

Duration: ${$("videoDuration").value} seconds

Status: Ready for AI video rendering.
Backend connection is required to generate the actual video.`;

    showBrief(report);
    saveProject("Image to Video Scene", report);
  });
}

