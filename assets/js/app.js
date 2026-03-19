/* ══════════════════════════════════════
   APP.JS — Core Logic
   ══════════════════════════════════════ */

// ── Init Lucide icons ─────────────────────────────────────────────────────
lucide.createIcons();

// ── DOM refs ──────────────────────────────────────────────────────────────
const el = {
  status: document.getElementById("status"),
  video: document.getElementById("video"),
  apiKey: document.getElementById("apiKey"),
  cloudName: document.getElementById("cloudName"),
  uploadPreset: document.getElementById("uploadPreset"),
  button: document.getElementById("uploadWidget"),
  toggleKey: document.getElementById("toggleKey"),
  statusContainer: document.getElementById("statusContainer"),
  statusCard: document.getElementById("statusCard"),
  statusTitle: document.getElementById("statusTitle"),
  statusDesc: document.getElementById("statusDesc"),
  statusIcon: document.getElementById("statusIcon"),
  spinnerIcon: document.getElementById("spinnerIcon"),
  progressBar: document.getElementById("progressBar"),
  loadingDots: document.getElementById("loadingDots"),
  errorContainer: document.getElementById("errorContainer"),
  errorMsg: document.getElementById("errorMsg"),
  resultCard: document.getElementById("resultCard"),
  downloadBtn: document.getElementById("downloadBtn"),
  navbar: document.getElementById("navbar"),
};

// ── Restore saved credentials from localStorage ───────────────────────────
(function restoreCredentials() {
  const savedCloud = localStorage.getItem("clipmaker_cloud_name");
  const savedPreset = localStorage.getItem("clipmaker_upload_preset");
  const savedKey = localStorage.getItem("clipmaker_api_key");
  if (savedCloud) el.cloudName.value = savedCloud;
  if (savedPreset) el.uploadPreset.value = savedPreset;
  if (savedKey) el.apiKey.value = savedKey;
})();

// ── Persist credentials on change ────────────────────────────────────────
el.cloudName.addEventListener("change", () =>
  localStorage.setItem("clipmaker_cloud_name", el.cloudName.value.trim()),
);
el.uploadPreset.addEventListener("change", () =>
  localStorage.setItem("clipmaker_upload_preset", el.uploadPreset.value.trim()),
);
el.apiKey.addEventListener("change", () =>
  localStorage.setItem("clipmaker_api_key", el.apiKey.value.trim()),
);

// ── Toggle API key visibility ─────────────────────────────────────────────
el.toggleKey.addEventListener("click", () => {
  const isPassword = el.apiKey.type === "password";
  el.apiKey.type = isPassword ? "text" : "password";
  el.toggleKey.innerHTML = `<i data-lucide="${isPassword ? "eye-off" : "eye"}" class="w-4 h-4"></i>`;
  lucide.createIcons();
});

// ── Navbar scroll glass effect ────────────────────────────────────────────
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    el.navbar.style.cssText =
      "background: rgba(6,6,10,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);";
  } else {
    el.navbar.style.cssText = "";
  }
});

// ── UI helpers ────────────────────────────────────────────────────────────
function setStatus(title, desc, phase = "loading") {
  el.errorContainer.classList.add("hidden");
  el.statusContainer.classList.remove("hidden");
  el.statusTitle.textContent = title;
  el.statusDesc.textContent = desc;

  if (phase === "success") {
    el.spinnerIcon.className = "w-4 h-4 text-brand-400";
    el.spinnerIcon.setAttribute("data-lucide", "check");
    el.loadingDots.classList.add("hidden");
    el.progressBar.classList.add("hidden");
    lucide.createIcons({ nodes: [el.spinnerIcon] });
  } else {
    el.spinnerIcon.setAttribute("data-lucide", "loader-2");
    el.spinnerIcon.className = "w-4 h-4 text-brand-400 animate-spin";
    el.loadingDots.classList.remove("hidden");
    el.progressBar.classList.remove("hidden");
    lucide.createIcons({ nodes: [el.spinnerIcon] });
  }
}

function setError(msg) {
  el.statusContainer.classList.add("hidden");
  el.errorContainer.classList.remove("hidden");
  el.errorMsg.textContent = msg;
}

function showResult(videoURL) {
  el.statusContainer.classList.add("hidden");
  el.resultCard.classList.remove("hidden");

  el.video.preload = "metadata";
  el.video.src = videoURL + "#t=0.001";

  el.downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = videoURL;
    a.download = "clipmaker-viral-clip.mp4";
    a.click();
  };

  setTimeout(() => {
    el.resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
}

// ── App logic ─────────────────────────────────────────────────────────────
const app = {
  transcriptionURL: "",
  public_id: "",

  waitForTranscription: async () => {
    const maxAttempts = 30;
    const delay = 2000;
    const cloudName = el.cloudName.value.trim();

    for (let i = 1; i <= maxAttempts; i++) {
      const url = `https://res.cloudinary.com/${cloudName}/raw/upload/v${Date.now()}/${app.public_id}.transcript`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          app.transcriptionURL = url;
          return url;
        }
      } catch (_) {}

      setStatus(
        "Transcrevendo seu vídeo…",
        `Tentativa ${i}/${maxAttempts} — O Cloudinary está processando o áudio.`,
      );

      if (i < maxAttempts) await new Promise((r) => setTimeout(r, delay));
    }
    return null;
  },

  getTranscription: async () => {
    const res = await fetch(app.transcriptionURL);
    return res.text();
  },

  getViralMoment: async () => {
    const transcription = await app.getTranscription();
    const model = "gemini-3-flash-preview";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const prompt = `
Role: You are a professional video editor specializing in viral content.
Task: Analyze the transcription below and identify the most engaging, funny, or surprising segment.
Constraints:
1. Duration: Minimum 30 seconds, Maximum 60 seconds.
2. Format: Return ONLY the start and end string for Cloudinary. Format: so_<start_seconds>,eo_<end_seconds>
3. Examples: "so_10,eo_20" or "so_12.5,eo_45.2"
4. CRITICAL: Do not use markdown, do not use quotes, do not explain. Return ONLY the raw string.
Transcription:
${transcription}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": el.apiKey.value,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!raw)
      throw new Error(
        "O Gemini retornou uma resposta vazia. Verifique sua chave de API.",
      );

    return raw;
  },

  getViralMomentWithRetry: async () => {
    const maxAttempts = 3;
    const delay = 2000;

    for (let i = 1; i <= maxAttempts; i++) {
      try {
        return await app.getViralMoment();
      } catch (err) {
        if (i < maxAttempts) await new Promise((r) => setTimeout(r, delay));
        else throw err;
      }
    }
  },
};

// ── Upload button click ───────────────────────────────────────────────────
el.button.addEventListener("click", () => {
  const cloudName = el.cloudName.value.trim();
  const uploadPreset = el.uploadPreset.value.trim();
  const apiKey = el.apiKey.value.trim();

  // Validate all three fields
  const highlight = (input) => {
    input.style.borderColor = "rgba(239,68,68,0.6)";
    input.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)";
    input.focus();
    setTimeout(() => {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    }, 2000);
  };

  if (!cloudName) {
    highlight(el.cloudName);
    return;
  }
  if (!uploadPreset) {
    highlight(el.uploadPreset);
    return;
  }
  if (!apiKey) {
    highlight(el.apiKey);
    return;
  }

  // Reset previous state
  el.errorContainer.classList.add("hidden");
  el.resultCard.classList.add("hidden");

  // Build widget on demand with user credentials
  const widget = cloudinary.createUploadWidget(
    { cloudName, uploadPreset },
    async (error, result) => {
      if (error) {
        setError(`Erro no upload: ${error.message || "Erro desconhecido"}`);
        return;
      }

      if (result && result.event === "success") {
        app.public_id = result.info.public_id;

        try {
          setStatus(
            "Aguardando transcrição…",
            "O Cloudinary está extraindo o áudio do seu vídeo.",
            "loading",
          );

          const isReady = await app.waitForTranscription();
          if (!isReady)
            throw new Error(
              "Transcrição não ficou pronta após 30 tentativas. Tente novamente.",
            );

          setStatus(
            "Analisando com Gemini AI…",
            "Encontrando o segmento mais envolvente do seu vídeo.",
            "loading",
          );
          const viralMoment = await app.getViralMomentWithRetry();

          setStatus(
            "Gerando seu clipe…",
            "Aplicando transformação de tempo no Cloudinary.",
            "loading",
          );
          const viralURL = `https://res.cloudinary.com/${cloudName}/video/upload/${viralMoment}/${app.public_id}.mp4`;

          await new Promise((r) => setTimeout(r, 800));
          showResult(viralURL);
        } catch (err) {
          setError(
            err.message || "Erro inesperado. Por favor, tente novamente.",
          );
        }
      }
    },
  );

  widget.open();
});
