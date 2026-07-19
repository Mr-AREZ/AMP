/* ============================================================
   AREZ Music Player (AMP) — core player
   Vanilla JS: play/pause, next/prev, seek, volume, playlist,
   shuffle, repeat, and keyboard shortcuts.
   ============================================================ */

(function () {
  "use strict";

  // ---- Elements ----
  const audio = document.getElementById("audio");
  const app = document.querySelector(".app");
  const coverEl = document.getElementById("cover");
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");

  const seek = document.getElementById("seek");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");

  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const shuffleBtn = document.getElementById("shuffle");
  const repeatBtn = document.getElementById("repeat");

  const muteBtn = document.getElementById("mute");
  const volume = document.getElementById("volume");

  const playlistEl = document.getElementById("playlist");
  const trackCountEl = document.getElementById("track-count");

  // ---- State ----
  let currentIndex = 0;
  let isShuffle = false;
  let repeatMode = "off"; // "off" | "all" | "one"
  let lastVolume = 0.8;

  // ---- Helpers ----
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function setRangeFill(input) {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const val = Number(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.backgroundSize = pct + "% 100%";
  }

  // ---- Rendering ----
  function buildPlaylist() {
    playlistEl.innerHTML = "";
    TRACKS.forEach(function (track, index) {
      const li = document.createElement("li");
      li.className = "track-item";
      li.setAttribute("role", "option");
      li.dataset.index = String(index);

      li.innerHTML =
        '<img class="track-thumb" src="' +
        track.cover +
        '" alt="" />' +
        '<div class="track-info">' +
        '<div class="track-name">' +
        track.title +
        "</div>" +
        '<div class="track-sub">' +
        track.artist +
        "</div>" +
        "</div>" +
        '<span class="track-eq" aria-hidden="true"><span></span><span></span><span></span></span>' +
        '<span class="track-dur">--:--</span>';

      li.addEventListener("click", function () {
        if (index === currentIndex) {
          togglePlay();
        } else {
          loadTrack(index, true);
        }
      });

      playlistEl.appendChild(li);

      // Preload duration without playing.
      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = track.src;
      probe.addEventListener("loadedmetadata", function () {
        const dur = li.querySelector(".track-dur");
        if (dur) dur.textContent = formatTime(probe.duration);
      });
    });

    trackCountEl.textContent = TRACKS.length + (TRACKS.length === 1 ? " track" : " tracks");
  }

  function highlightActive() {
    const items = playlistEl.querySelectorAll(".track-item");
    items.forEach(function (item) {
      const idx = Number(item.dataset.index);
      item.classList.toggle("active", idx === currentIndex);
      item.setAttribute("aria-selected", idx === currentIndex ? "true" : "false");
    });
  }

  // ---- Track loading ----
  function loadTrack(index, autoplay) {
    currentIndex = (index + TRACKS.length) % TRACKS.length;
    const track = TRACKS[currentIndex];

    audio.src = track.src;
    coverEl.src = track.cover;
    coverEl.alt = track.title + " cover";
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;

    seek.value = 0;
    setRangeFill(seek);
    currentTimeEl.textContent = "0:00";

    highlightActive();

    if (autoplay) {
      play();
    }
  }

  // ---- Playback ----
  function play() {
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {
        /* Autoplay may be blocked until user interaction. */
      });
    }
    app.classList.add("is-playing");
    playBtn.setAttribute("aria-label", "Pause");
  }

  function pause() {
    audio.pause();
    app.classList.remove("is-playing");
    playBtn.setAttribute("aria-label", "Play");
  }

  function togglePlay() {
    if (audio.paused) play();
    else pause();
  }

  function next(auto) {
    if (isShuffle) {
      let rand = currentIndex;
      if (TRACKS.length > 1) {
        while (rand === currentIndex) {
          rand = Math.floor(Math.random() * TRACKS.length);
        }
      }
      loadTrack(rand, true);
      return;
    }

    // At the end with repeat off during auto-advance: stop.
    if (auto && repeatMode === "off" && currentIndex === TRACKS.length - 1) {
      loadTrack(0, false);
      return;
    }
    loadTrack(currentIndex + 1, true);
  }

  function prev() {
    // Restart current track if we're more than 3s in.
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    loadTrack(currentIndex - 1, true);
  }

  // ---- Volume ----
  function setVolume(value) {
    const v = Math.min(1, Math.max(0, value));
    audio.volume = v;
    audio.muted = v === 0;
    volume.value = String(Math.round(v * 100));
    setRangeFill(volume);
    app.classList.toggle("is-muted", audio.muted);
  }

  function toggleMute() {
    if (audio.muted || audio.volume === 0) {
      setVolume(lastVolume || 0.8);
    } else {
      lastVolume = audio.volume;
      setVolume(0);
    }
  }

  // ---- Event wiring ----
  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", function () {
    next(false);
  });
  prevBtn.addEventListener("click", prev);

  shuffleBtn.addEventListener("click", function () {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    shuffleBtn.setAttribute("aria-pressed", String(isShuffle));
  });

  repeatBtn.addEventListener("click", function () {
    repeatMode = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    repeatBtn.classList.toggle("active", repeatMode !== "off");
    repeatBtn.setAttribute("aria-pressed", String(repeatMode !== "off"));
    repeatBtn.setAttribute(
      "aria-label",
      repeatMode === "one" ? "Repeat one" : repeatMode === "all" ? "Repeat all" : "Repeat"
    );
    repeatBtn.title = repeatMode === "one" ? "Repeat one" : repeatMode === "all" ? "Repeat all" : "Repeat off";
  });

  muteBtn.addEventListener("click", toggleMute);

  volume.addEventListener("input", function () {
    setVolume(Number(volume.value) / 100);
  });

  // Seek interaction
  seek.addEventListener("input", function () {
    setRangeFill(seek);
    if (Number.isFinite(audio.duration)) {
      const time = (Number(seek.value) / 100) * audio.duration;
      currentTimeEl.textContent = formatTime(time);
    }
  });
  seek.addEventListener("change", function () {
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    }
  });

  // Audio element events
  audio.addEventListener("loadedmetadata", function () {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", function () {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = String((audio.currentTime / audio.duration) * 100);
      setRangeFill(seek);
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("ended", function () {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      play();
    } else {
      next(true);
    }
  });

  audio.addEventListener("play", function () {
    app.classList.add("is-playing");
  });
  audio.addEventListener("pause", function () {
    app.classList.remove("is-playing");
  });

  // ---- Keyboard shortcuts ----
  document.addEventListener("keydown", function (e) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        if (e.shiftKey) {
          next(false);
        } else {
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
        }
        break;
      case "ArrowLeft":
        if (e.shiftKey) {
          prev();
        } else {
          audio.currentTime = Math.max(0, audio.currentTime - 5);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setVolume(audio.volume + 0.05);
        break;
      case "ArrowDown":
        e.preventDefault();
        setVolume(audio.volume - 0.05);
        break;
      case "KeyM":
        toggleMute();
        break;
      default:
        break;
    }
  });

  // ---- Init ----
  function init() {
    buildPlaylist();
    setVolume(lastVolume);
    loadTrack(0, false);
    setRangeFill(seek);
  }

  init();
})();
