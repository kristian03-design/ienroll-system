/***********************
 * Simple calendar app
 * Events stored in localStorage as placeholder for database.
 ************************/
// Utility helpers
const formatDate = (d) => new Date(d).toLocaleString();
const pad = (n) => (n < 10 ? "0" + n : "" + n);

// Category color map for pills
const categoryClass = {
  Academic: "category-academic",
  Holiday: "category-holiday",
  Enrollment: "category-enrollment",
  Exam: "category-exam",
  Meeting: "category-meeting",
};

// App state
let state = {
  view: "month", // month/week/day/agenda
  currentDate: new Date(),
  events: loadEvents(), // array of events
  filters: new Set(["Academic", "Holiday", "Enrollment", "Exam", "Meeting"]),
  search: "",
};

// DOM refs
const calendarContainer = document.getElementById("calendarContainer");
const currentTitle = document.getElementById("currentTitle");
const currentRange = document.getElementById("currentRange");
const addEventBtn = document.getElementById("addEventBtn");
const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");
const eventIdInput = document.getElementById("eventId");
const detailTitle = document.getElementById("detailTitle");
const detailCategory = document.getElementById("detailCategory");
const detailWhen = document.getElementById("detailWhen");
const detailDesc = document.getElementById("detailDesc");
const detailLink = document.getElementById("detailLink");
const detailsModal = document.getElementById("detailsModal");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");
const refreshBtn = document.getElementById("refreshBtn");

// Initialize view buttons
document.querySelectorAll(".viewBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.view = btn.dataset.view;
    document
      .querySelectorAll(".viewBtn")
      .forEach((b) => b.classList.remove("bg-[var(--primary)]", "text-white"));
    btn.classList.add("bg-[var(--primary)]", "text-white");
    render();
  });
  if (btn.dataset.view === "month") {
    btn.classList.add("bg-[var(--primary)]", "text-white");
  }
});

// Category filter events
document.querySelectorAll(".categoryFilter").forEach((inp) => {
  inp.addEventListener("change", (e) => {
    if (e.target.checked) state.filters.add(e.target.value);
    else state.filters.delete(e.target.value);
    render();
  });
});

// Search
searchInput.addEventListener("input", (e) => {
  state.search = e.target.value.trim().toLowerCase();
  render();
});

// Prev/Next/Today
prevBtn.addEventListener("click", () => {
  navigate(-1);
});
nextBtn.addEventListener("click", () => {
  navigate(1);
});
todayBtn.addEventListener("click", () => {
  state.currentDate = new Date();
  render();
});

refreshBtn.addEventListener("click", () => {
  state.events = loadEvents();
  render();
});

// Add event flow
addEventBtn.addEventListener("click", () => openEventModal());

// Modal close by background or button
document.querySelectorAll('[data-close="modal"]').forEach((el) => {
  el.addEventListener("click", (e) => {
    closeAllModals();
  });
});

// Mobile sidebar toggles
document.getElementById("mobileMenuBtn").addEventListener("click", () => {
  const ms = document.getElementById("mobileSidebar");
  ms.classList.remove("-translate-x-full");
  document
    .getElementById("mobileMenuBtn")
    .setAttribute("aria-expanded", "true");
});
document.getElementById("mobileClose").addEventListener("click", () => {
  document.getElementById("mobileSidebar").classList.add("-translate-x-full");
  document
    .getElementById("mobileMenuBtn")
    .setAttribute("aria-expanded", "false");
});

// Export all events as iCal
exportBtn.addEventListener("click", () => {
  const ics = buildICal(state.events);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "iEnroll-events.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Form submit (add/edit)
eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = eventIdInput.value || generateId();
  const title = document.getElementById("evtTitle").value.trim();
  const desc = document.getElementById("evtDesc").value.trim();
  const start = document.getElementById("evtStart").value;
  const end = document.getElementById("evtEnd").value;
  const category = document.getElementById("evtCategory").value;
  const link = document.getElementById("evtLink").value.trim();

  // basic validation
  if (!title || !start || !end) {
    alert("Title and date/time required");
    return;
  }
  if (new Date(end) < new Date(start)) {
    alert("End must be after start");
    return;
  }

  // upsert
  const idx = state.events.findIndex((ev) => ev.id === id);
  const payload = { id, title, desc, start, end, category, link };
  if (idx !== -1) state.events[idx] = payload;
  else state.events.push(payload);

  saveEvents(state.events);
  closeAllModals();
  render();
});

// Delete from details modal
document.getElementById("detailDeleteBtn").addEventListener("click", () => {
  const id = detailsModal.dataset.eventId;
  if (!confirm("Delete this event?")) return;
  state.events = state.events.filter((e) => e.id !== id);
  saveEvents(state.events);
  closeAllModals();
  render();
});

// Edit from details modal
document.getElementById("detailEditBtn").addEventListener("click", () => {
  const id = detailsModal.dataset.eventId;
  const ev = state.events.find((e) => e.id === id);
  closeAllModals();
  openEventModal(ev);
});

// Open add/edit modal, optionally with event data
function openEventModal(eventData = null, defaultDate = null) {
  eventModal.classList.remove("hidden");
  eventModal.classList.add("flex");
  eventModal.setAttribute("aria-hidden", "false");

  if (eventData) {
    eventIdInput.value = eventData.id;
    document.getElementById("evtTitle").value = eventData.title;
    document.getElementById("evtDesc").value = eventData.desc;
    document.getElementById("evtStart").value = eventData.start;
    document.getElementById("evtEnd").value = eventData.end;
    document.getElementById("evtCategory").value = eventData.category;
    document.getElementById("evtLink").value = eventData.link || "";
    document.getElementById("eventModalTitle").textContent = "Edit Event";
  } else {
    eventIdInput.value = "";
    eventForm.reset();
    document.getElementById("eventModalTitle").textContent = "Add Event";
    if (defaultDate) {
      const d = new Date(defaultDate);
      const start = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T09:00`;
      const end = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T10:00`;
      document.getElementById("evtStart").value = start;
      document.getElementById("evtEnd").value = end;
    }
  }

  // focus on first input
  setTimeout(() => document.getElementById("evtTitle").focus(), 80);
}

function openDetailsModal(ev) {
  detailsModal.classList.remove("hidden");
  detailsModal.classList.add("flex");
  detailsModal.setAttribute("aria-hidden", "false");
  detailsModal.dataset.eventId = ev.id;

  detailTitle.textContent = ev.title;
  detailCategory.textContent = ev.category;
  detailWhen.textContent = `${new Date(ev.start).toLocaleString()} — ${new Date(
    ev.end
  ).toLocaleString()}`;
  detailDesc.textContent = ev.desc || "";
  if (ev.link) {
    detailLink.innerHTML = `<a href="${ev.link}" target="_blank" class="text-sky-600 underline text-sm">Attachment / Link</a>`;
  } else detailLink.innerHTML = "";
  // google calendar link (pre-fill)
  const gLink = buildGoogleCalendarLink(ev);
  document.getElementById("addToGoogle").href = gLink;
  document.getElementById("downloadIcal").onclick = () => {
    const single = buildICal([ev]);
    const blob = new Blob([single], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.title}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
}

function closeAllModals() {
  [eventModal, detailsModal].forEach((m) => {
    m.classList.add("hidden");
    m.classList.remove("flex");
    m.setAttribute("aria-hidden", "true");
  });
}

// Rendering helpers
function render() {
  // update title and range
  currentTitle.textContent = state.view.toUpperCase();
  currentRange.textContent = getRangeLabel();

  // choose renderer
  if (state.view === "month") renderMonth();
  else if (state.view === "week") renderWeek();
  else if (state.view === "day") renderDay();
  else renderAgenda();
}

function filterEvents() {
  return state.events.filter((ev) => {
    if (!state.filters.has(ev.category)) return false;
    if (state.search) {
      const s = state.search;
      if (
        !(
          ev.title.toLowerCase().includes(s) ||
          (ev.desc && ev.desc.toLowerCase().includes(s))
        )
      )
        return false;
    }
    return true;
  });
}

function renderMonth() {
  const date = new Date(state.currentDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0-6 (Sun-Sat)
  // compute grid start (previous month days)
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startWeekday);

  // build header
  const header = document.createElement("div");
  header.className = "grid grid-cols-7 gap-2 text-xs text-slate-500 mb-2";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const el = document.createElement("div");
    el.className = "text-center font-medium";
    el.textContent = d;
    header.appendChild(el);
  });

  // grid container
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-7 gap-2";

  // 6 weeks grid
  const eventsFiltered = filterEvents();

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday = sameDay(cellDate, new Date());
    const dayBox = document.createElement("div");
    dayBox.className = `p-3 rounded-lg min-h-[96px] ${
      isCurrentMonth ? "bg-white" : "bg-gray-50 text-slate-400"
    } ${isToday ? "today-ring" : ""}`;
    dayBox.setAttribute("tabindex", 0);
    dayBox.setAttribute("role", "button");
    dayBox.setAttribute(
      "aria-label",
      `Open events for ${cellDate.toDateString()}`
    );
    dayBox.addEventListener("click", () => {
      if (state.view !== "agenda") {
        // open day view or add modal
        openDayQuick(cellDate);
      }
    });

    // day number and new event mini button
    const headerRow = document.createElement("div");
    headerRow.className = "flex items-center justify-between";
    const dayNum = document.createElement("div");
    dayNum.className = "font-medium";
    dayNum.textContent = cellDate.getDate();
    headerRow.appendChild(dayNum);

    const miniBtn = document.createElement("button");
    miniBtn.className =
      "text-xs px-2 py-0.5 rounded-md border hidden sm:inline";
    miniBtn.textContent = "+";
    miniBtn.title = "Add event";
    miniBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openEventModal(null, cellDate.toISOString());
    });
    headerRow.appendChild(miniBtn);
    dayBox.appendChild(headerRow);

    // events in the day (limit visible to 3)
    const dayEvents = eventsFiltered.filter((e) =>
      sameDay(new Date(e.start), cellDate)
    );
    dayEvents.slice(0, 3).forEach((ev) => {
      const pill = document.createElement("div");
      pill.className = `event-pill ${
        categoryClass[ev.category] || "bg-slate-400"
      }`;
      pill.textContent = ev.title;
      pill.title = ev.title;
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        openDetailsModal(ev);
      });
      dayBox.appendChild(pill);
    });

    if (dayEvents.length > 3) {
      const more = document.createElement("div");
      more.className = "text-xs text-slate-400 mt-1";
      more.textContent = `+${dayEvents.length - 3} more`;
      more.addEventListener("click", (e) => {
        e.stopPropagation();
        openDayQuick(cellDate);
      });
      dayBox.appendChild(more);
    }

    grid.appendChild(dayBox);
  }

  // compose container
  calendarContainer.innerHTML = "";
  calendarContainer.appendChild(header);
  calendarContainer.appendChild(grid);
}

function renderWeek() {
  // simplified week view: show 7 days with timeline
  const start = startOfWeek(state.currentDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  calendarContainer.innerHTML = "";
  const weekHeader = document.createElement("div");
  weekHeader.className = "grid grid-cols-7 gap-2 mb-2 text-sm";
  days.forEach((d) => {
    const el = document.createElement("div");
    el.className = "text-center font-medium p-2 bg-gray-50 rounded-lg";
    el.textContent = `${d.toLocaleDateString(undefined, {
      weekday: "short",
    })} ${d.getDate()}`;
    weekHeader.appendChild(el);
  });
  calendarContainer.appendChild(weekHeader);

  const dayGrid = document.createElement("div");
  dayGrid.className = "grid grid-cols-7 gap-2";
  const eventsFiltered = filterEvents();

  days.forEach((d) => {
    const box = document.createElement("div");
    box.className = "p-3 rounded-lg min-h-[200px] bg-white";
    const dayEv = eventsFiltered.filter((ev) => sameDay(new Date(ev.start), d));
    dayEv.forEach((ev) => {
      const el = document.createElement("div");
      el.className = `p-2 mb-2 rounded-lg cursor-pointer ${
        categoryClass[ev.category] || ""
      }`;
      el.style.color = "white";
      el.textContent = `${new Date(ev.start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} — ${ev.title}`;
      el.addEventListener("click", () => openDetailsModal(ev));
      box.appendChild(el);
    });
    dayGrid.appendChild(box);
  });

  calendarContainer.appendChild(dayGrid);
}

function renderDay() {
  const d = new Date(state.currentDate);
  calendarContainer.innerHTML = "";
  const hd = document.createElement("div");
  hd.className = "mb-3";
  hd.textContent = d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  calendarContainer.appendChild(hd);

  const eventsFiltered = filterEvents().filter((ev) =>
    sameDay(new Date(ev.start), d)
  );
  if (eventsFiltered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "p-8 text-center text-slate-400 bg-gray-50 rounded-lg";
    empty.textContent = "No events for this date.";
    calendarContainer.appendChild(empty);
  } else {
    eventsFiltered.forEach((ev) => {
      const item = document.createElement("div");
      item.className =
        "p-3 mb-3 rounded-lg bg-white border flex justify-between items-start";
      const left = document.createElement("div");
      left.innerHTML = `<div class="font-medium">${
        ev.title
      }</div><div class="text-sm text-slate-500">${new Date(
        ev.start
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} — ${new Date(ev.end).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}</div><div class="text-sm mt-1">${ev.desc || ""}</div>`;
      const right = document.createElement("div");
      const btn = document.createElement("button");
      btn.className = "px-3 py-1 rounded-md border";
      btn.textContent = "Details";
      btn.addEventListener("click", () => openDetailsModal(ev));
      right.appendChild(btn);
      item.appendChild(left);
      item.appendChild(right);
      calendarContainer.appendChild(item);
    });
  }
}

function renderAgenda() {
  const eventsFiltered = filterEvents().sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );
  calendarContainer.innerHTML = "";
  const container = document.createElement("div");
  container.className = "space-y-2";
  // Auto-collapse past events
  const now = new Date();
  eventsFiltered.forEach((ev) => {
    const evStart = new Date(ev.start);
    const item = document.createElement("div");
    item.className = `p-3 rounded-lg ${
      evStart < now ? "bg-gray-50 text-slate-400" : "bg-white"
    }`;
    item.innerHTML = `<div class="flex justify-between items-start"><div><div class="font-medium">${
      ev.title
    }</div><div class="text-sm text-slate-500">${new Date(
      ev.start
    ).toLocaleString()} — ${new Date(
      ev.end
    ).toLocaleString()}</div></div><div class="text-sm">${
      ev.category
    }</div></div><div class="text-sm mt-2">${ev.desc || ""}</div>`;
    item.addEventListener("click", () => openDetailsModal(ev));
    container.appendChild(item);
  });
  calendarContainer.appendChild(container);
}

// Navigation movement: delta months/weeks/days
function navigate(delta) {
  const d = new Date(state.currentDate);
  if (state.view === "month") d.setMonth(d.getMonth() + delta);
  else if (state.view === "week") d.setDate(d.getDate() + delta * 7);
  else d.setDate(d.getDate() + delta);
  state.currentDate = d;
  render();
}

function getRangeLabel() {
  const d = new Date(state.currentDate);
  if (state.view === "month")
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  if (state.view === "week") {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return `${s.toLocaleDateString()} — ${e.toLocaleDateString()}`;
  }
  if (state.view === "day") return d.toLocaleDateString();
  return "Agenda";
}

// Quick open daily list for add/more
function openDayQuick(date) {
  state.view = "day";
  state.currentDate = date;
  // update view buttons visually
  document
    .querySelectorAll(".viewBtn")
    .forEach((b) =>
      b.classList.toggle("bg-[var(--primary)]", b.dataset.view === "day")
    );
  render();
}

// Helpers: same day and start of week
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfWeek(d) {
  const date = new Date(d);
  const diff = date.getDay(); // sun=0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Storage helpers
function generateId() {
  return "evt_" + Math.random().toString(36).slice(2, 9);
}
function saveEvents(arr) {
  localStorage.setItem("ienroll_events_v1", JSON.stringify(arr));
}
function loadEvents() {
  try {
    const raw = localStorage.getItem("ienroll_events_v1");
    if (!raw) {
      // seed with sample events
      const seed = [
        {
          id: generateId(),
          title: "Semester Opening",
          desc: "First day of classes",
          start: new Date().toISOString().split("T")[0] + "T08:00",
          end: new Date().toISOString().split("T")[0] + "T09:00",
          category: "Academic",
          link: "",
        },
        {
          id: generateId(),
          title: "Enrollment Deadline",
          desc: "Last day to enroll",
          start:
            new Date(new Date().setDate(new Date().getDate() + 5))
              .toISOString()
              .slice(0, 10) + "T23:59",
          end:
            new Date(new Date().setDate(new Date().getDate() + 5))
              .toISOString()
              .slice(0, 10) + "T23:59",
          category: "Enrollment",
          link: "",
        },
        {
          id: generateId(),
          title: "Math Exam",
          desc: "Midterm exam",
          start:
            new Date(new Date().setDate(new Date().getDate() + 2))
              .toISOString()
              .slice(0, 10) + "T09:00",
          end:
            new Date(new Date().setDate(new Date().getDate() + 2))
              .toISOString()
              .slice(0, 10) + "T12:00",
          category: "Exam",
          link: "",
        },
      ];
      saveEvents(seed);
      return seed;
    }
    return JSON.parse(raw).map((ev) => {
      // ensure date strings are in full datetime format
      return ev;
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Google Calendar link builder
function buildGoogleCalendarLink(ev) {
  const padIso = (dt) => {
    const d = new Date(dt);
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };
  const tz = ""; // could append timezone param if desired
  const dates = `${padIso(ev.start)}/${padIso(ev.end)}`;
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    ev.title
  )}&dates=${dates}&details=${encodeURIComponent(
    ev.desc || ""
  )}&location=${encodeURIComponent(ev.link || "")}`;
  return url;
}

// iCal builder for one or many events
function buildICal(events) {
  const pad2 = (n) => (n < 10 ? "0" + n : n);
  const toICSDate = (isod) => {
    const d = new Date(isod);
    return (
      d.getUTCFullYear() +
      pad2(d.getUTCMonth() + 1) +
      pad2(d.getUTCDate()) +
      "T" +
      pad2(d.getUTCHours()) +
      pad2(d.getUTCMinutes()) +
      pad2(d.getUTCSeconds()) +
      "Z"
    );
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//iEnroll//SchoolCalendar//EN",
  ];
  events.forEach((ev) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}`);
    lines.push(`DTSTAMP:${toICSDate(new Date())}`);
    lines.push(`DTSTART:${toICSDate(ev.start)}`);
    lines.push(`DTEND:${toICSDate(ev.end)}`);
    lines.push(`SUMMARY:${escapeICal(ev.title)}`);
    if (ev.desc) lines.push(`DESCRIPTION:${escapeICal(ev.desc)}`);
    if (ev.link) lines.push(`URL:${ev.link}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\\r\\n");
}
function escapeICal(s) {
  return (s || "").replace(/\\n/g, "\\\\n").replace(/,/g, "\\,");
}

// build initial UI and attach event listeners on render
render();

// Accessibility: keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
    // Ctrl+N new event
    e.preventDefault();
    openEventModal();
  } else if (e.key === "ArrowLeft") navigate(-1);
  else if (e.key === "ArrowRight") navigate(1);
  else if (e.key === "t") {
    state.currentDate = new Date();
    render();
  }
});

// Click outside to close modals (already handled by backdrop)
