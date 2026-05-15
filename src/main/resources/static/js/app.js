// app.js (front only, refactored - single file)

const qs = (sel, root = document) => root.querySelector(sel);

// =========================
// DOM cache
// =========================
const el = {
  boardWrap: qs("#boardWrap"),
  board: qs("#board"),
  overlay: qs("#overlay"),
  modalRoot: qs("#modalRoot"),

  composerPlus: qs("#composerPlus"),
  composerPlusDock: qs("#composerPlusDock"),
  composerFile: qs("#composerFile"),
  composerFileDock: qs("#composerFileDock"),

  sidePanel: qs("#sidePanel"),
  panelTitle: qs("#panelTitle"),
  panelBody: qs("#panelBody"),
  panelClose: qs("#panelClose"),

  boardName: qs("#boardName"),
  boardDesc: qs("#boardDesc"),

  searchInput: qs("#searchInput"),
  searchWrap: qs("#searchWrap"),
  searchClear: qs("#searchClear"),

  emptyState: qs("#emptyState"),
  dock: qs("#dock"),

  quickInput: qs("#quickInput"),

  quickInputDock: qs("#quickInputDock"),

  quickColors: qs("#quickColors"),
  quickColorsDock: qs("#newColors"),

  layout: qs(".layout"),
  toggleSidebarBtn: qs("#toggleSidebar"),
  splitter: qs("#splitter"),

  onboardingState: qs("#onboardingState"),
  inviteCodeInput: qs("#inviteCodeInput"),
  joinByCodeBtn: qs("#joinByCodeBtn"),

  membersToggleBtn: qs("#membersToggleBtn"),
  memberPanel: qs("#memberPanel"),
  memberPanelBody: qs("#memberPanelBody"),
  memberClose: qs("#memberClose"),
  memberTitle: qs("#memberTitle"),
  meBtn: qs("#meBtn"),
spaceOnboardingModal: qs("#spaceOnboardingModal"),

showCreateSpaceBtn: qs("#showCreateSpaceBtn"),
createSpaceModal: qs("#createSpaceModal"),
closeCreateSpaceModalBtn: qs("#closeCreateSpaceModalBtn"),
backToJoinModalBtn: qs("#backToJoinModalBtn"),
createSpaceNameInput: qs("#createSpaceNameInput"),
submitCreateSpaceBtn: qs("#submitCreateSpaceBtn"),

spaceContextMenu: qs("#spaceContextMenu"),

boardContextMenu: qs("#boardContextMenu"),

spaceList: qs("#spaceList"),
addSpaceBtn: qs("#addSpaceBtn"),

};

// dock 이미지 상태
let dockImages = []; // { file, url } 배열

async function handleGenerateInviteCode(spaceId) {
  const modal = qs("#inviteModal");
  const display = qs("#inviteCodeDisplay");
  if (!modal || !display) return;

  display.textContent = "...";
  modal.classList.remove("hidden");

  try {
    const res = await authFetch(`/spaces/${spaceId}/invite`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) throw new Error();
    const code = await res.text();
    display.textContent = code;
  } catch (err) {
    display.textContent = "생성 실패";
  }
}

// =========================
// constants
// =========================
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 420;
const COLOR_CLASSES = ["yellow", "blue", "green", "peach", "purple"];
const MAX_ATTACH = 4;

let overlayCleanup = null; // 현재 열린 오버레이(모달/패널) 닫힐 때 실행할 정리 함수

// overlayMode: "modal" | "sidepanel" | null
let overlayMode = null;

// sidebar width 기억
let lastSidebarW = null;

// =========================
// state (demo)
// =========================
const state = {
  me: localStorage.getItem("loginUserId") ?? "1",
  spaceId: null,
  boardId: null,
  search: "",
  quickColor: "yellow",
  data: {
    spaces: [],
    memos: []
  }
};

function updateBoardStatus(data) {
  if (qs("#memoCount")) {
    qs("#memoCount").textContent = data?.memoCount ?? 0;
  }

  if (qs("#lastModified")) {
    qs("#lastModified").textContent = data?.lastModified
      ? formatDate(data.lastModified)
      : "-";
  }
}

function syncBoardSummary() {
  const currentBoard = getCurrentBoard();

  if (!currentBoard) {
    updateBoardStatus({
      memoCount: 0,
      lastModified: null
    });
    return;
  }

  updateBoardStatus({
    memoCount: currentBoard.memoCount ?? 0,
    lastModified: currentBoard.lastModified ?? null
  });
}

function autoGrowTextarea(ta) {
  if (!ta) return;

  const max = 140;
  const singleLine = 28;

  ta.style.height = singleLine + "px";

  if (ta.scrollHeight <= singleLine + 8) {
    ta.style.height = singleLine + "px";
    ta.style.overflowY = "hidden";
    return;
  }

  const next = Math.min(ta.scrollHeight, max);
  ta.style.height = next + "px";
  ta.style.overflowY = next > max ? "auto" : "hidden";
}

// =========================
// helpers
// =========================
function escapeHTML(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function escapeRegExp(s){
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatDate(iso) {
  const d = new Date(iso);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  const period = hours < 12 ? "오전" : "오후";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const hh = String(hours).padStart(2, "0");

  return `${mm}/${dd} ${period} ${hh}:${minutes}`;
}

function linkify(html) {
  return html.replace(
    /(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">$1</a>'
  );
}

function highlight(text, q){
  const safe = escapeHTML(text);
  const linked = linkify(safe.replaceAll("\n","<br/>"));
  if(!q) return linked;
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return linked.replace(re, "<mark>$1</mark>");
}

function getNoteSize(content){
  const len = content.trim().length;
  return len >= 90 ? "large" : "small";
}

function syncSearchClear(){
  const has = (el.searchInput?.value.trim().length ?? 0) > 0;
  el.searchWrap?.classList.toggle("hasText", has);
}

function handlePasteImage(e, draftAttachments, render){
  const items = e.clipboardData?.items;
  if(!items) return;

  const files = [];
  for(const it of items){
    if(it.kind === "file"){
      const f = it.getAsFile();
      if(f && f.type.startsWith("image/")) files.push(f);
    }
  }
  if(files.length === 0) return;

  e.preventDefault();

  for(const file of files){
    if(draftAttachments.length >= MAX_ATTACH) break;

    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
    const objectUrl = URL.createObjectURL(file);
    draftAttachments.push({ id, file, objectUrl });
  }

  render();
}

function renderAttachments(container, draftAttachments, onChange){
  if(!container) return;
  container.innerHTML = "";

  draftAttachments.forEach(att => {
    const item = document.createElement("div");
    item.className = "attachItem";
    item.dataset.id = att.id;

    const img = document.createElement("img");
    img.src = att.objectUrl;

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "attachRemove";
    rm.textContent = "✕";
    rm.addEventListener("click", () => {
      const idx = draftAttachments.findIndex(x => x.id === att.id);
      if(idx >= 0){
        URL.revokeObjectURL(draftAttachments[idx].objectUrl);
        draftAttachments.splice(idx, 1);
        // ✅ 프리뷰+힌트 같이 갱신
        if(typeof onChange === "function") onChange();
        else renderAttachments(container, draftAttachments);
      }
    });

    item.appendChild(img);
    item.appendChild(rm);
    container.appendChild(item);
  });
}

function syncAttachHint(hintEl, draftAttachments){
  if(!hintEl) return;
  hintEl.textContent =
    draftAttachments.length >= MAX_ATTACH
      ? `이미지는 최대 ${MAX_ATTACH}장까지 가능.`
      : `이미지 붙여넣기(Ctrl+V) 가능.(${draftAttachments.length}/${MAX_ATTACH})`;
}


// =========================
// Space가 없을때의 모달
// =========================
function openSpaceOnboardingModal() {
  el.spaceOnboardingModal?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSpaceOnboardingModal() {
  el.spaceOnboardingModal?.classList.add("hidden");
  document.body.style.overflow = "";
}

function syncSpaceOnboardingModal() {
  if (hasAnySpace()) {
    closeSpaceOnboardingModal();
  } else {
    openSpaceOnboardingModal();
  }
}

async function loadInitialData() {
  try {
    await fetchAndApplySpaces();

    const { spaceId: routeSpaceId, boardId: routeBoardId } = getRouteFromUrl();

    if (state.data.spaces.length > 0) {
      const targetSpace = state.data.spaces.find(
        space => String(space.id) === String(routeSpaceId)
      );

      const targetSpaceId = targetSpace
        ? String(targetSpace.id)
        : String(state.data.spaces[0].id);

      await setSpace(targetSpaceId, { boardId: routeBoardId });
    } else {
      state.spaceId = null;
      state.boardId = null;
      setRouteToUrl(null, null);
      renderAll();
    }

    syncSpaceOnboardingModal();
  } catch (err) {
    console.error(err);
    state.data.spaces = [];
    state.spaceId = null;
    state.boardId = null;
    setRouteToUrl(null, null);
    syncSpaceOnboardingModal();
    renderAll();
  }
}

async function handleJoinByCode() {
  const inviteCode = el.inviteCodeInput?.value.trim();

  if (!inviteCode) {
    alert("참가코드를 입력해.");
    el.inviteCodeInput?.focus();
    return;
  }

  try {
    const joinedSpace = await joinSpaceByCode(inviteCode);

    el.inviteCodeInput.value = "";

    await fetchAndApplySpaces();
    await setSpace(joinedSpace.id);

    closeSpaceOnboardingModal();
  } catch (err) {
    console.error(err);
    alert("참가코드 입장에 실패했어.");
  }
}

async function createSpace(name, description = "") {
  const params = new URLSearchParams({ name, description });

  const res = await authFetch(`/spaces?${params.toString()}`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("스페이스 생성 실패");
  }

  return await res.json();
}

async function joinSpaceByCode(inviteCode) {
  const res = await authFetch("/spaces/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ inviteCode })
  });

  if (!res.ok) {
    throw new Error("참가코드 입장 실패");
  }

  return await res.json();
}
loadInitialData();

// =========================
// Memo View / Edit Modal
// =========================

function isMemoEdited(memo) {
  if (!memo?.createdAt || !memo?.updatedAt) return false;
  return new Date(memo.updatedAt).getTime() !== new Date(memo.createdAt).getTime();
}

function openViewModal(id){
  const m = state.data.memos.find(x => x.id === id);
  if(!m) return;

  const canEdit = (String(m.authorId) === String(state.me));
  const isEdited = isMemoEdited(m);

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");
  if(!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog noteDialog viewMemoDialog" id="viewMemoDialog">
      <div class="dialogBody">
        <div class="viewTop" style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:900;color:var(--muted);">
            <span id="viewAuthor"></span>
          </div>
          <button class="dialogClose" type="button" id="viewCloseBtn" aria-label="닫기">x</button>
        </div>

        <div id="viewAttachments" class="viewAttachments" style="display:none;"></div>

        <div id="viewContent" style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-size:14px;font-weight:800;color:#111827;line-height:1.6;"></div>

        <div class="viewBottom" style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div style="font-size:12px;font-weight:900;color:var(--muted);">
            <span id="viewTime"></span>
            <span id="viewEdited" style="margin-left:6px;opacity:.9;"></span>
          </div>

          <div class="dialogActions" style="display:flex;gap:10px;flex-wrap:wrap;">
            ${canEdit ? `
              <button class="btn" type="button" id="editBtn">수정</button>
              <button class="btn" type="button" id="deleteBtn">삭제</button>
            ` : ``}
          </div>
        </div>
      </div>
    </div>
    <div class="imageLightbox hidden" id="imageLightbox">
      <img id="imageLightboxImg" alt="첨부 이미지 확대" />
    </div>
  `;

  const dialog = qs("#viewMemoDialog");
  const attachmentCount = m.attachments?.length ?? 0;
  const hasContent = m.content.trim().length > 0;
  if (attachmentCount > 0) dialog.classList.add("hasAttachments");

  if (attachmentCount === 0) {
    dialog.classList.add(m.content.length < 80 ? "textSmall" : "textLarge");
  } else if (attachmentCount === 1 && !hasContent) {
    dialog.classList.add("imageSingle");
  } else if (attachmentCount === 1) {
    dialog.classList.add("mixedSingle");
  } else {
    dialog.classList.add("imageMultiple");
  }

  COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
  dialog.classList.add(m.color || "yellow");

  qs("#viewAuthor", dialog).textContent = canEdit
      ? `${m.authorNickname ?? m.authorId} (나)`
      : `${m.authorNickname ?? m.authorId}`;
  qs("#viewTime", dialog).textContent = formatDate(m.createdAt);
  qs("#viewEdited", dialog).textContent = isEdited ? "(수정됨)" : "";
  qs("#viewContent", dialog).innerHTML = linkify(escapeHTML(m.content).replaceAll("\n","<br/>"));

  const viewAtt = qs("#viewAttachments", dialog);
  if (viewAtt && attachmentCount > 0) {
    viewAtt.style.display = "flex";
    viewAtt.innerHTML = "";

    let currentAttachmentIndex = 0;
    viewAtt.innerHTML = `
      <button class="viewImageNav prev" type="button" aria-label="이전 이미지">‹</button>
      <button class="viewAttachmentButton" type="button" aria-label="현재 이미지 확대">
        <img id="viewAttachmentImage" alt="첨부 이미지" />
      </button>
      <button class="viewImageNav next" type="button" aria-label="다음 이미지">›</button>
      <span class="viewImageCount" id="viewImageCount"></span>
    `;

    const imageBtn = qs(".viewAttachmentButton", viewAtt);
    const imageEl = qs("#viewAttachmentImage", viewAtt);
    const prevBtn = qs(".viewImageNav.prev", viewAtt);
    const nextBtn = qs(".viewImageNav.next", viewAtt);
    const countEl = qs("#viewImageCount", viewAtt);

    const renderAttachment = () => {
      const current = m.attachments[currentAttachmentIndex];
      imageEl.src = current.url;
      countEl.textContent = `${currentAttachmentIndex + 1}/${attachmentCount}`;
      const hasMultiple = attachmentCount > 1;
      prevBtn.hidden = !hasMultiple;
      nextBtn.hidden = !hasMultiple;
      countEl.hidden = !hasMultiple;
    };

    prevBtn.addEventListener("click", () => {
      currentAttachmentIndex = (currentAttachmentIndex - 1 + attachmentCount) % attachmentCount;
      renderAttachment();
    });

    nextBtn.addEventListener("click", () => {
      currentAttachmentIndex = (currentAttachmentIndex + 1) % attachmentCount;
      renderAttachment();
    });

    imageBtn.addEventListener("click", () => {
      const lightbox = qs("#imageLightbox");
      const lightboxImg = qs("#imageLightboxImg");
      if(!lightbox || !lightboxImg) return;
      lightboxImg.src = m.attachments[currentAttachmentIndex].url;
      lightbox.classList.remove("hidden");
    });

    renderAttachment();
  }

  qs("#viewCloseBtn", dialog)?.addEventListener("click", closeOverlay);

  if(canEdit){
    qs("#editBtn", dialog)?.addEventListener("click", () => openEditModal(id));
    qs("#deleteBtn", dialog)?.addEventListener("click", () => {
      if(confirm("삭제할까요?")) deleteMemo(id);
      closeOverlay();
    });
  }
}
function openEditModal(id){
  const m = state.data.memos.find(x => x.id === id);
  if(!m) return;
  if(String(m.authorId) !== String(state.me)) return; // 남 글 수정 금지

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");

  if(!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog noteDialog" id="editMemoDialog">
      <div class="dialogHead">
        <div class="dialogTitle">메모 수정</div>
        <button class="dialogClose" type="button" id="editCloseBtn" aria-label="닫기">✕</button>
      </div>

      <div class="dialogBody">
        <textarea id="editText" class="dialogText" maxlength="2000" placeholder="메모를 입력..."></textarea>
        <div class="attachPreview" id="editAttachPreview"></div>
        <div class="memoAttachBar">
          <input type="file" id="editFileInput" multiple hidden>
          <button type="button" id="editAttachBtn" class="attachBtn">이미지 추가</button>
        </div>
        <div class="attachHint" id="editAttachHint"></div>
        <div class="dialogMeta">
          <span style="font-size:12px;font-weight:900;color:var(--muted);">
            색상
          </span>

          <div class="color-pick" id="editColors" aria-label="색상 선택">
            <div class="swatch yellow" data-color="yellow" title="옐로우"></div>
            <div class="swatch blue" data-color="blue" title="블루"></div>
            <div class="swatch green" data-color="green" title="그린"></div>
            <div class="swatch peach" data-color="peach" title="피치"></div>
            <div class="swatch purple" data-color="purple" title="퍼플"></div>
          </div>
        </div>

        <div class="dialogActions">
          <button class="btn primary" id="saveBtn" type="button">저장</button>
        </div>
      </div>
    </div>
  `;

  const dialog = qs("#editMemoDialog");
  const closeBtn = qs("#editCloseBtn", dialog);
  const ta = qs("#editText", dialog);
  const colors = qs("#editColors", dialog);
  const saveBtn = qs("#saveBtn", dialog);

  closeBtn?.addEventListener("click", () => openViewModal(id)); // 닫으면 보기로 복귀

  // 기존 첨부 불러오기
  const draftAttachments = m.attachments.map(att => ({
    id: att.id,         // 서버 ID (기존)
    file: null,         // 기존은 파일 없음
    objectUrl: att.url, // 이미 서버 URL
    isExisting: true
  }));

  const editPreview = qs("#editAttachPreview", dialog);
  const editHint = qs("#editAttachHint", dialog);
  const editFileInput = qs("#editFileInput", dialog);

    // Ctrl+V 붙여넣기로 이미지 추가
    dialog.addEventListener("paste", (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      Array.from(items).forEach(item => {
        if (!item.type.startsWith("image/") || draftAttachments.length >= MAX_ATTACH) return;
        const file = item.getAsFile();
        if (!file) return;
        draftAttachments.push({
          id: null,
          file,
          objectUrl: URL.createObjectURL(file),
          isExisting: false
        });
      });
      rerenderEditAtt();
    });

  const editAttachBtn = qs("#editAttachBtn", dialog);

  function rerenderEditAtt() {
    if (!editPreview) return;
    editPreview.innerHTML = "";
    draftAttachments.forEach((att, idx) => {
      const item = document.createElement("div");
      item.className = "attachItem";
      const img = document.createElement("img");
      img.src = att.objectUrl;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "attachRemove";
      rm.textContent = "✕";
      rm.addEventListener("click", () => {
        if (!att.isExisting) URL.revokeObjectURL(att.objectUrl);
        draftAttachments.splice(idx, 1);
        rerenderEditAtt();
      });
      item.appendChild(img);
      item.appendChild(rm);
      editPreview.appendChild(item);
    });
    if (editHint) editHint.textContent = `(${draftAttachments.length}/${MAX_ATTACH})`;
  }
  rerenderEditAtt();

  editAttachBtn?.addEventListener("click", () => editFileInput?.click());
  editFileInput?.addEventListener("change", (e) => {
    Array.from(e.target.files || []).forEach(file => {
      if (!file.type.startsWith("image/") || draftAttachments.length >= MAX_ATTACH) return;
      draftAttachments.push({
        id: null,
        file,
        objectUrl: URL.createObjectURL(file),
        isExisting: false
      });
    });
    rerenderEditAtt();
    editFileInput.value = "";
  });

  // 초기값
  ta.value = m.content;

  let picked = m.color || "yellow";
  COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
  dialog.classList.add(picked);

  // 초기 선택 표시
  colors?.querySelectorAll(".swatch").forEach(sw => {
    sw.classList.toggle("selected", sw.dataset.color === picked);
  });

  // 색 선택
  colors?.addEventListener("click", (e) => {
    const sw = e.target.closest(".swatch");
    if(!sw) return;

    picked = sw.dataset.color;

    COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
    dialog.classList.add(picked);

    colors.querySelectorAll(".swatch").forEach(x => {
      x.classList.toggle("selected", x.dataset.color === picked);
    });
  });

  // 저장
  saveBtn?.addEventListener("click", async () => {
    const next = ta.value.trim();
    if (!next) return;

    try {
      // 새 파일 업로드
      const newFiles = draftAttachments.filter(a => !a.isExisting && a.file);
      let uploadedIds = [];
      if (newFiles.length > 0) {
        const uploaded = await uploadFiles(newFiles.map(a => a.file));
        uploadedIds = uploaded.map(f => f.id);
      }
      // 기존 유지할 ID + 새로 업로드한 ID
      const existingIds = draftAttachments.filter(a => a.isExisting).map(a => a.id);
      const attachmentIds = [...existingIds, ...uploadedIds];

      const updatedMemo = await updateMemoRequest(id, next, picked, attachmentIds);

      const idx = state.data.memos.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) {
        state.data.memos[idx] = {
          ...state.data.memos[idx],
          id: String(updatedMemo.id),
          boardId: String(updatedMemo.board?.id ?? state.data.memos[idx].boardId),
          authorId: String(updatedMemo.authorId ?? state.data.memos[idx].authorId),
          author: String(updatedMemo.authorId ?? state.data.memos[idx].authorId),
          content: updatedMemo.content ?? next,
          color: updatedMemo.color ?? picked,
          createdAt: updatedMemo.createdAt ?? state.data.memos[idx].createdAt,
          updatedAt: updatedMemo.updatedAt ?? state.data.memos[idx].updatedAt,
          attachments: Array.isArray(updatedMemo.attachments)
            ? updatedMemo.attachments
            : state.data.memos[idx].attachments
        };
      }

      renderAll();
      openViewModal(id);
    } catch (err) {
      console.error(err);
      alert("메모 수정에 실패했어.");
    }
  });

  // UX: 열자마자 포커스
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}


// =========================
// derived data
// =========================

 function hasAnySpace() {
   return state.data.spaces.length > 0;
 }

 function getCurrentSpace() {
   return state.data.spaces.find(space => String(space.id) === String(state.spaceId)) ?? null;
 }

function getMemosForBoard(){
  const all = state.data.memos.filter(m => m.boardId === state.boardId);
  all.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const q = state.search.trim().toLowerCase();
  if(!q) return all;

  return all.filter(m =>
    m.content.toLowerCase().includes(q) ||
    (m.authorNickname ?? "").toLowerCase().includes(q)
  );
}

// =========================
// actions (state changes)
// =========================
async function setSpace(spaceId, options = {}) {
  const { boardId = null } = options;

  state.spaceId = String(spaceId);

  const currentSpace = getCurrentSpace();
  if (!currentSpace) return;

  try {
    const boards = await fetchBoardsBySpace(spaceId);
    currentSpace.boards = Array.isArray(boards) ? boards : [];

    if (currentSpace.boards.length > 0) {
      const targetBoard = currentSpace.boards.find(
        board => String(board.id) === String(boardId)
      );

      state.boardId = targetBoard
        ? String(targetBoard.id)
        : String(currentSpace.boards[0].id);

      const memos = await fetchMemosByBoard(state.boardId);
      applyMemos(memos);
    } else {
      state.boardId = null;
      state.data.memos = [];
    }
  } catch (err) {
    console.error("보드/메모 로딩 실패:", err);
    currentSpace.boards = [];
    state.boardId = null;
    state.data.memos = [];
  }

  state.search = "";
  if (el.searchInput) el.searchInput.value = "";
  syncSearchClear();

  setRouteToUrl(state.spaceId, state.boardId);
  renderAll();
}

async function setBoard(boardId) {
  state.boardId = String(boardId);
  state.search = "";

  if (el.searchInput) el.searchInput.value = "";
  syncSearchClear();

  try {
    const memos = await fetchMemosByBoard(boardId);
    applyMemos(memos);
  } catch (err) {
    console.error("메모 로딩 실패:", err);
    state.data.memos = [];
  }

  setRouteToUrl(state.spaceId, state.boardId);
  renderAll();
}


async function deleteMemo(id) {
  try {
    await deleteMemoRequest(id);
    await reloadCurrentBoardMemos();
  } catch (err) {
    console.error(err);
    alert("메모 삭제에 실패했어.");
  }
}

async function submitQuick(textarea) {
  const text = textarea.value.trim();
  if (!text && dockImages.length === 0) return;
  if (!state.boardId) return;

  try {
    let attachmentIds = [];
    if (dockImages.length > 0) {
      const uploaded = await uploadFiles(dockImages.map(img => img.file));
      attachmentIds = uploaded.map(f => f.id);
      dockImages.forEach(img => URL.revokeObjectURL(img.url));
      dockImages = [];
      renderDockImagePreview();
    }
    await createMemoRequest({
      content: text,
      boardId: state.boardId,
      authorId: Number(state.me),
      color: state.quickColor,
      attachmentIds
    });
    textarea.value = "";
    autoGrowTextarea(textarea);
    await reloadCurrentBoardMemos();
  } catch (err) {
    console.error(err);
    alert("메모 저장에 실패했어.");
  }
}

// =========================
// onboarding
// =========================
function showOnboarding(show){
  if(!el.onboardingState) return;

  el.onboardingState.hidden = !show;

  if(el.emptyState) el.emptyState.hidden = true;
  if(el.dock) el.dock.hidden = true;

  if(el.board) el.board.innerHTML = "";

  if(el.boardName){
    el.boardName.textContent = show ? "보드 없음" : el.boardName.textContent;
  }
}

// =========================
// render
// =========================
function updateComposerMode(isEmpty){
  const canCompose = hasAnySpace() && hasActiveBoard();

  if (el.emptyState) {
    el.emptyState.hidden = !canCompose || !isEmpty;
  }

  if (el.dock) {
    el.dock.hidden = !canCompose || isEmpty;
  }

  if (el.boardWrap) {
    el.boardWrap.style.paddingBottom = canCompose && !isEmpty ? "140px" : "40px";
  }

const currentSpace = getCurrentSpace();
const currentBoard = (currentSpace?.boards ?? []).find(b =>
  String(typeof b === "object" ? b.id : b) === String(state.boardId)
);

const rn = currentBoard
  ? (typeof currentBoard === "object" ? currentBoard.name : String(currentBoard))
  : (state.boardId ?? "채널 없음");
  if (el.boardName) el.boardName.textContent = `#${rn}`;
}

function renderBoard(){
  if(!el.board) return;

  const q = state.search.trim();

  // 방 전체(검색 무시) -> empty 판단용
  const boardAll = state.data.memos.filter(m => m.boardId === state.boardId);

  const memos = getMemosForBoard();
  el.board.innerHTML = "";

  memos.forEach(m => {
    const hasAttachments = m.attachments && m.attachments.length > 0;
    const size = hasAttachments ? "small" : getNoteSize(m.content);
    const canDelete = (String(m.authorId) === String(state.me));

    const card = document.createElement("div");
    card.className = `note ${m.color} ${size}` + (hasAttachments ? " hasImage" : "") + (canDelete ? " canDelete" : "");
    card.dataset.id = m.id;

    const head = document.createElement("div");
    head.className = "noteHead";

    const author = document.createElement("span");
    author.className = "noteAuthor";
    author.textContent = m.authorNickname ?? String(m.authorId ?? "");
    head.appendChild(author);

    if(canDelete){
      const x = document.createElement("button");
      x.type = "button";
      x.className = "hoverX";
      x.textContent = "✕";
      x.title = "삭제";
      x.addEventListener("click", (e) => {
        e.stopPropagation();
        if(confirm("삭제할거임?")) deleteMemo(m.id);
      });
      head.appendChild(x);
    }

    const body = document.createElement("div");
    body.className = "body";
    body.innerHTML = highlight(m.content, q);

    card.appendChild(head);  // 닉네임/X 항상 최상단

    if (hasAttachments) {
      const extraImageCount = m.attachments.length - 1;
      const imgWrap = document.createElement("div");
      imgWrap.className = "noteImages" + (extraImageCount > 0 ? " hasMultiple" : "");

      const img = document.createElement("img");
      img.src = m.attachments[0].url;
      img.alt = "첨부 이미지";

      imgWrap.appendChild(img);

      if (extraImageCount > 0) {
        const badge = document.createElement("span");
        badge.className = "noteImgCount";
        badge.textContent = `+${extraImageCount}`;
        imgWrap.appendChild(badge);
      }

      card.appendChild(imgWrap);
    }

    card.appendChild(body);

    card.addEventListener("click", (e) => {
      e.stopPropagation();
      openViewModal(m.id);
    });

    el.board.appendChild(card);
  });

  if (memos.length === 0 && state.search.trim() !== "") {
    const empty = document.createElement("div");
    empty.style.gridColumn = "1 / -1";
    empty.style.padding = "18px";
    empty.style.border = "1px dashed #cfd5dd";
    empty.style.borderRadius = "16px";
    empty.style.background = "white";
    empty.style.color = "#6b7280";
    empty.style.fontWeight = "900";
    empty.textContent = "검색 결과 없음.";
    el.board.appendChild(empty);
  }

  updateComposerMode(boardAll.length === 0);
}

function applyBoardCols(){
  if(!el.boardWrap || !el.board) return;

  const rootStyles = getComputedStyle(document.documentElement);
  const gap = parseInt(rootStyles.getPropertyValue("--gap")) || 12;
  const maxCols = parseInt(rootStyles.getPropertyValue("--max-cols")) || 12;

  const test = document.createElement("div");
  test.style.width = rootStyles.getPropertyValue("--card-w");
  test.style.position = "absolute";
  test.style.visibility = "hidden";
  document.body.appendChild(test);
  const cardW = test.getBoundingClientRect().width;
  test.remove();

  const w = el.boardWrap.clientWidth;
  let fit = Math.floor((w + gap) / (cardW + gap));
  fit = Math.max(2, fit);

  el.board.style.setProperty("--cols", Math.min(maxCols, fit));
}

const ro = new ResizeObserver(() => applyBoardCols());

// =========================
// overlay / sidepanel
// =========================
function openOverlay(){
  if(!el.overlay) return;

  el.overlay.classList.remove("hidden");
  el.overlay.setAttribute("aria-hidden", "false");

  el.overlay.classList.toggle("modal", overlayMode === "modal");
  el.overlay.classList.toggle("sidePanel", overlayMode === "sidepanel");
}

function closeOverlay(){

    try { overlayCleanup?.(); } finally { overlayCleanup = null; }

  overlayMode = null;

  if(el.overlay){
    el.overlay.classList.add("hidden");
    el.overlay.setAttribute("aria-hidden", "true");
    el.overlay.classList.remove("modal", "sidePanel");
  }

  if(el.modalRoot) el.modalRoot.innerHTML = "";
  if(el.sidePanel) el.sidePanel.classList.add("hidden");
  if(el.panelBody) el.panelBody.innerHTML = "";
}

function closeSidePanel(){
  el.sidePanel?.classList.add("hidden");
  if(el.panelBody) el.panelBody.innerHTML = "";
  closeOverlay();
}

// =========================
// memo modal
// =========================
function openNewMemoModal(initialFiles = []){
  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");

  if(!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog noteDialog" id="newMemoDialog">
      <div class="dialogHead">
        <div class="dialogTitle">새 메모</div>
        <button class="dialogClose" type="button" id="closeBtn">✕</button>
      </div>

      <div class="dialogBody">
        <textarea id="newText" class="dialogText" maxlength="2000" placeholder="메모를 입력..."></textarea>
        <div class="attachPreview" id="attachPreview"></div>
                <div class="memoAttachBar">
                  <input type="file" id="memoFileInput" multiple hidden>
                  <button type="button" id="memoAttachBtn" class="attachBtn">파일 첨부</button>
                </div>
        <div class="attachHint" id="attachHint">이미지 붙여넣기(Ctrl+V) 가능. 지금은 임시 프리뷰만 뜸.</div>

        <div class="dialogMeta">
          <span> </span>

          <div class="color-pick" id="newColors" aria-label="색상 선택">
            <div class="swatch yellow selected" data-color="yellow" title="옐로우"></div>
            <div class="swatch blue" data-color="blue" title="블루"></div>
            <div class="swatch green" data-color="green" title="그린"></div>
            <div class="swatch peach" data-color="peach" title="피치"></div>
            <div class="swatch purple" data-color="purple" title="퍼플"></div>
          </div>
        </div>

        <div class="dialogActions">
          <button class="btn primary" id="createBtn" type="button">저장</button>
        </div>
      </div>
    </div>
  `;

  const dialog = qs("#newMemoDialog");
  const closeBtn = qs("#closeBtn", dialog);
  const newText  = qs("#newText", dialog);
  const createBtn = qs("#createBtn", dialog);
  const newColors = qs("#newColors", dialog);
  const attachHint = qs("#attachHint", dialog);
  const attachPreview = qs("#attachPreview", dialog);
  const memoFileInput = qs("#memoFileInput", dialog);
  const memoAttachBtn = qs("#memoAttachBtn", dialog);

  const draftAttachments = [];

    // ✅ 추가: 파일 선택 첨부
  overlayCleanup = () => {
      draftAttachments.forEach(a => {
           if (a.objectUrl?.startsWith("blob:")) {
             URL.revokeObjectURL(a.objectUrl);
            }
       });
  };
  for(const file of initialFiles){
      if(!file?.type?.startsWith("image/")) continue;
      if(draftAttachments.length >= MAX_ATTACH) break;

      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      const objectUrl = URL.createObjectURL(file);
      draftAttachments.push({ id, file, objectUrl });
    }

  // ✅ picked는 먼저 선언 (저장 로직보다 위)
  let picked = "yellow";

function rerenderAtt(){
  renderAttachments(attachPreview, draftAttachments, rerenderAtt);
  syncAttachHint(attachHint, draftAttachments);
}
rerenderAtt();

  newText.addEventListener("paste", (e) => {
    handlePasteImage(e, draftAttachments, rerenderAtt);
  });

  closeBtn?.addEventListener("click", closeOverlay);

  memoAttachBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    memoFileInput?.click();
  });

  memoFileInput?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (!file?.type?.startsWith("image/")) continue;
      if (draftAttachments.length >= MAX_ATTACH) break;

      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random();

      const objectUrl = URL.createObjectURL(file);
      draftAttachments.push({ id, file, objectUrl });
    }

    rerenderAtt();

    // 같은 파일 다시 고를 수 있게 초기화
    memoFileInput.value = "";
  });

  // ✅ 모달 배경 초기색
  COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
  dialog.classList.add(picked);

  // ✅ 선택 UI 초기 표시
  newColors?.querySelectorAll(".swatch").forEach(x => {
    x.classList.toggle("selected", x.dataset.color === picked);
  });

  // ✅ 색 선택
  newColors?.addEventListener("click", (e) => {
    const sw = e.target.closest(".swatch");
    if(!sw) return;

    picked = sw.dataset.color;

    COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
    dialog.classList.add(picked);

    newColors.querySelectorAll(".swatch").forEach(x => {
      x.classList.toggle("selected", x.dataset.color === picked);
    });
  });

createBtn?.addEventListener("click", async () => {
  const text = newText.value.trim();
  if (!text && draftAttachments.length === 0) return;

  try {
    let attachmentIds = [];

    if (draftAttachments.length > 0) {
      const uploaded = await uploadFiles(draftAttachments.map(att => att.file));
      attachmentIds = uploaded.map(file => file.id);
    }

    await createMemoRequest({
      content: text,
      boardId: state.boardId,
      authorId: Number(state.me),
      color: picked ?? state.quickColor,
      attachmentIds
    });

    closeOverlay();
    await reloadCurrentBoardMemos();
  } catch (err) {
    console.error(err);
    alert("메모 저장에 실패했어.");
  }
});
  newText?.focus();
}

// =========================
// color picker (composer)
// =========================
function bindColorPicker(root){
  if(!root) return;
  root.addEventListener("click", (e) => {
    const sw = e.target.closest(".swatch");
    if(!sw) return;
    state.quickColor = sw.dataset.color;
    syncColorUI();
  });
}

function syncColorUI(){
  const roots = [el.quickColors, el.quickColorsDock].filter(Boolean);
  roots.forEach(root => {
    root.querySelectorAll(".swatch").forEach(s => {
      s.classList.toggle("selected", s.dataset.color === state.quickColor);
    });
  });

  document.querySelectorAll(".composerBar").forEach(bar => {
    COLOR_CLASSES.forEach(c => bar.classList.remove(c));
    bar.classList.add(state.quickColor);
  });
}

// =========================
// sidebar resize
// =========================
function setSidebarW(px){
  document.documentElement.style.setProperty("--sidebar-w", `${px}px`);
  applyBoardCols();
  localStorage.setItem("sidebarW", String(px));
}

function loadSidebarW(){
  const saved = parseInt(localStorage.getItem("sidebarW") || "", 10);
  if(Number.isFinite(saved)){
    setSidebarW(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, saved)));
  }
}

// =========================
// event handlers
// =========================

function onDocumentPointerDown(e){
  const isMemberToggle = e.target.closest("#membersToggleBtn");
  const isInsideMemberPanel = el.memberPanel?.contains(e.target);
  if (!isMemberToggle && !isInsideMemberPanel) closeMemberPanel();

  const isInsideBoardContextMenu = el.boardContextMenu?.contains(e.target);
  const isBoardContextTrigger = e.target.closest(".board-Btn");
  if (!isInsideBoardContextMenu && !isBoardContextTrigger) closeBoardContextMenu();

  const isInsideSpaceContextMenu = el.spaceContextMenu?.contains(e.target);
    const isSpaceContextTrigger = e.target.closest(".spaceBtn");
    if (!isInsideSpaceContextMenu && !isSpaceContextTrigger) {
      closeSpaceContextMenu();
    }
}

function renderMemberPanel(){
  const ch = getCurrentSpace();
  const list = ch?.membersFull ?? [];
  const myRole = list.find(m => String(m.userId) === String(state.me))?.role ?? "MEMBER";

  const ROLE_LABEL = { OWNER: "소유자", ADMIN: "관리자", MEMBER: "멤버" };
  const ROLE_COLOR = { OWNER: "#f59e0b", ADMIN: "#3b82f6", MEMBER: "#6b7280" };

  const html = list.length
    ? list.map(m => {
        return `
          <div class="memberItem" style="display:flex;align-items:center;gap:8px;padding:8px 16px;cursor:default;"
               data-uid="${m.userId}" data-role="${m.role}" data-name="${escapeHTML(m.nickname)}">
            <span class="memberName" style="flex:1;font-size:13px;font-weight:800;">${escapeHTML(m.nickname)}</span>
            <span style="font-size:11px;font-weight:900;color:${ROLE_COLOR[m.role]};background:${ROLE_COLOR[m.role]}18;border-radius:6px;padding:2px 7px;">${ROLE_LABEL[m.role] ?? m.role}</span>
          </div>`;
      }).join("")
    : `<div style="padding:12px 16px;font-size:12px;color:var(--muted);font-weight:800;">멤버 없음</div>`;

  if (el.memberPanelBody) {
    el.memberPanelBody.innerHTML = `<div class="memberList">${html}</div>`;

    el.memberPanelBody.querySelectorAll(".memberItem").forEach(item => {
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const uid = item.dataset.uid;
        const role = item.dataset.role;
        const name = item.dataset.name;
        const isMe = String(uid) === String(state.me);
        const canKick = !isMe && (
          (myRole === "OWNER" && role !== "OWNER") ||
          (myRole === "ADMIN" && role === "MEMBER")
        );
        const canChangeRole = !isMe && myRole === "OWNER";
        if (!canKick && !canChangeRole) return;
        openMemberContextMenu(e.clientX, e.clientY, ch.id, uid, name, role, canKick, canChangeRole);
      });
    });
  }

  if (el.memberTitle) el.memberTitle.textContent = `멤버 (${list.length})`;
}

function openMemberContextMenu(x, y, spaceId, targetUserId, name, currentRole, canKick, canChangeRole) {
  document.querySelector("#memberCtxMenu")?.remove();

  const menu = document.createElement("div");
  menu.id = "memberCtxMenu";
  menu.style.cssText = "position:fixed;background:#fff;border:1px solid var(--line);border-radius:12px;padding:6px 0;box-shadow:0 4px 24px rgba(0,0,0,.12);z-index:9999;min-width:150px;";
  menu.style.left = Math.min(x, window.innerWidth - 160) + "px";
  menu.style.top = Math.min(y, window.innerHeight - 160) + "px";

  if (canChangeRole) {
    const roleBtn = document.createElement("button");
    roleBtn.type = "button";
    roleBtn.style.cssText = "display:block;width:100%;text-align:left;padding:9px 16px;background:none;border:none;cursor:pointer;font-size:13px;font-weight:800;color:#111827;";
    roleBtn.textContent = "역할 변경";
    roleBtn.addEventListener("click", () => {
      menu.remove();
      openRoleChangePopup(x, y, spaceId, targetUserId, currentRole);
    });
    menu.appendChild(roleBtn);
  }

  if (canKick) {
    const kickBtn = document.createElement("button");
    kickBtn.type = "button";
    kickBtn.style.cssText = "display:block;width:100%;text-align:left;padding:9px 16px;background:none;border:none;cursor:pointer;font-size:13px;font-weight:800;color:#b42318;";
    kickBtn.textContent = "강퇴";
    kickBtn.addEventListener("click", async () => {
      menu.remove();
      if (!confirm(`${name}님을 강퇴할까요?`)) return;
      try {
        await authFetch(`/spaces/${spaceId}/members/${targetUserId}`, { method: "DELETE", credentials: "include" });
        await openMemberPanel();
      } catch { alert("강퇴에 실패했어."); }
    });
    menu.appendChild(kickBtn);
  }

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", function close(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener("click", close); }
    });
  }, 0);
}

function openRoleChangePopup(x, y, spaceId, targetUserId, currentRole) {
  document.querySelector("#roleChangePopup")?.remove();

  const roles = [
    { value: "OWNER", label: "소유자", desc: "모든 권한 (당신은 관리자로 강등)" },
    { value: "ADMIN", label: "관리자", desc: "멤버 강퇴 가능" },
    { value: "MEMBER", label: "멤버", desc: "기본 권한" },
  ];

  const popup = document.createElement("div");
  popup.id = "roleChangePopup";
  popup.style.cssText = "position:fixed;background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px 0;box-shadow:0 4px 24px rgba(0,0,0,.12);z-index:9999;min-width:210px;";
  popup.style.left = Math.min(x, window.innerWidth - 220) + "px";
  popup.style.top = Math.min(y, window.innerHeight - 160) + "px";

  roles.forEach(r => {
    const item = document.createElement("button");
    item.type = "button";
    item.style.cssText = `display:block;width:100%;text-align:left;padding:9px 16px;background:${r.value === currentRole ? "#f3f4f6" : "none"};border:none;cursor:pointer;`;
    item.innerHTML = `<div style="font-size:13px;font-weight:900;color:#111827;">${r.label}</div><div style="font-size:11px;font-weight:700;color:var(--muted);">${r.desc}</div>`;
    item.addEventListener("click", async () => {
      popup.remove();
      if (r.value === currentRole) return;
      if (r.value === "OWNER" && !confirm("이 멤버에게 소유자 권한을 넘기면 당신은 관리자로 강등됩니다. 계속할까요?")) return;
      try {
        await authFetch(`/spaces/${spaceId}/members/${targetUserId}/role?role=${r.value}`, { method: "PATCH", credentials: "include" });
        await openMemberPanel();
      } catch { alert("역할 변경에 실패했어."); }
    });
    popup.appendChild(item);
  });

  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener("click", function close(e) {
      if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener("click", close); }
    });
  }, 0);
}

async function openMemberPanel(){
  const currentSpace = getCurrentSpace();
  if (currentSpace) {
    const res = await authFetch(`/spaces/${currentSpace.id}/members`, {
      credentials: "include"
    });
    const members = await res.json();
    currentSpace.membersFull = members;
    currentSpace.members = members.map(m => m.nickname);
  }
  renderMemberPanel();
  el.memberPanel.classList.add("open");
}

function closeMemberPanel(){
  el.memberPanel?.classList.remove("open");
}

function toggleMemberPanel(){
  if(!el.memberPanel) return;
  const willOpen = !el.memberPanel.classList.contains("open");
  if(willOpen) openMemberPanel();
  else closeMemberPanel();
}

function onSearchInput(){
  state.search = el.searchInput.value;
  syncSearchClear();
  renderBoard();
}

function onSearchClear(){
  state.search = "";
  el.searchInput.value = "";
  syncSearchClear();
  renderBoard();
  el.searchInput.focus();
}

function onQuickKeydown(e){
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    submitQuick(el.quickInput);
  }
}

function onQuickKeydownDock(e){
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    submitQuick(el.quickInputDock);
  }
}

function onOverlayPointerDown(e){
  if(!el.overlay) return;

  if(overlayMode === "modal"){
    const lightbox = el.modalRoot?.querySelector("#imageLightbox:not(.hidden)");
    if(lightbox){
      if(e.target === lightbox){
        lightbox.classList.add("hidden");
      }
      return;
    }

    const dialog = el.modalRoot?.querySelector(".dialog");
    if(dialog && !dialog.contains(e.target)) closeOverlay();
  }

  if(overlayMode === "sidepanel"){
    if(el.sidePanel && !el.sidePanel.contains(e.target)) closeSidePanel();
  }
}

function onGlobalKeydown(e){
  if(e.key !== "Escape") return;

  closeMemberPanel();

  if(state.search.trim().length > 0){
    state.search = "";
    el.searchInput.value = "";
    syncSearchClear();
    renderBoard();
    return;
  }

  if(el.overlay && !el.overlay.classList.contains("hidden")){
    closeOverlay();
  }

  closeSpaceContextMenu();
  closeBoardContextMenu();
}

function onToggleSidebar(){
  if(!el.layout) return;

  const willCollapse = !el.layout.classList.contains("sidebar-collapsed");

  if(willCollapse){
    const cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w"), 10);
    if(Number.isFinite(cur)) lastSidebarW = cur;
    el.layout.classList.add("sidebar-collapsed");
    localStorage.setItem("sidebarCollapsed","1");
  }else{
    el.layout.classList.remove("sidebar-collapsed");
    localStorage.setItem("sidebarCollapsed","0");
    if(lastSidebarW) setSidebarW(lastSidebarW);
    else loadSidebarW();
  }
}

function onSplitterDown(e){
  if(!el.layout || !el.splitter) return;
  if(el.layout.classList.contains("sidebar-collapsed")) return;

  el.splitter.setPointerCapture(e.pointerId);

  const onMove = (ev) => {
    const rect = el.layout.getBoundingClientRect();
    const next = ev.clientX - rect.left;
    const clamped = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, next));
    setSidebarW(clamped);
  };

  const onUp = (ev) => {
    el.splitter.releasePointerCapture(ev.pointerId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

// =========================
// 스페이스 만들기
// =========================

function openCreateSpaceModal() {
  el.createSpaceModal?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCreateSpaceModal() {
  el.createSpaceModal?.classList.add("hidden");
  document.body.style.overflow = "";

  if (!hasAnySpace()) {
    openSpaceOnboardingModal();
  }
}

function switchToCreateSpaceModal() {
  closeSpaceOnboardingModal();
  openCreateSpaceModal();
  setTimeout(() => {
    el.createSpaceNameInput?.focus();
  }, 0);
}

function switchToJoinModal() {
  closeCreateSpaceModal();
  openSpaceOnboardingModal();
  setTimeout(() => {
    el.inviteCodeInput?.focus();
  }, 0);
}

async function handleCreateSpace() {
  const name = el.createSpaceNameInput?.value.trim();

  if (!name) {
    alert("스페이스 이름을 입력해.");
    el.createSpaceNameInput?.focus();
    return;
  }

  try {
    const newSpace = await createSpace(name, "");

    el.createSpaceNameInput.value = "";

    await fetchAndApplySpaces();
    await setSpace(newSpace.id);

    closeCreateSpaceModal();
    closeSpaceOnboardingModal();

    syncSpaceOnboardingModal();
  } catch (err) {
    console.error(err);
    alert("스페이스 생성에 실패했어.");
  }
}

function hasActiveBoard() {
  return !!state.boardId;
}

function onComposerFiles(fileInput){
  const files = Array.from(fileInput.files || []);
  fileInput.value = ""; // 같은 파일 다시 선택 가능하게 초기화
  openNewMemoModal(files);
}

let contextSpaceId = null;

function openSpaceContextMenu(x, y, spaceId) {
  if (!el.spaceContextMenu) return;

  contextSpaceId = String(spaceId);

  const space = state.data.spaces.find(s=> String(s.id) === String(spaceId));
  const spaceName = space?.name ?? "";

  el.spaceContextMenu.querySelector('[data-act="invite"]').textContent = `${spaceName} 초대코드 생성`;
  el.spaceContextMenu.querySelector('[data-act="settings"]').textContent = `${spaceName} 설정`;

  el.spaceContextMenu.classList.remove("hidden");

  const menu = el.spaceContextMenu;
  const pad = 8;

  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();

    let left = x;
    let top = y;

    if (left + rect.width > window.innerWidth - pad) {
      left = window.innerWidth - rect.width - pad;
    }

    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - rect.height - pad;
    }

    menu.style.left = `${Math.max(pad, left)}px`;
    menu.style.top = `${Math.max(pad, top)}px`;
  });
}

function closeSpaceContextMenu() {
  contextSpaceId = null;
  el.spaceContextMenu?.classList.add("hidden");
}

function getSpaceById(spaceId) {
  return state.data.spaces.find(space => String(space.id) === String(spaceId)) ?? null;
}

function getMySpaceMember(members) {
  return (members ?? []).find(member =>
    String(member.userId) === String(state.me)
  ) ?? null;
}

async function fetchSpaceMembers(spaceId) {
  const res = await authFetch(`/spaces/${spaceId}/members`, {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("멤버 정보를 불러오지 못했어.");
  }

  return await res.json();
}


function formatSpaceRole(role) {
  if (role === "OWNER") return "OWNER (방주인)";
  if (role === "ADMIN") return "ADMIN (관리자)";
  return "MEMBER (멤버)";
}


async function openSpaceSettings(spaceId) {
  const space = getSpaceById(spaceId);
  if (!space) return;

  let members = [];

  try {
    members = await fetchSpaceMembers(spaceId);
    space.membersFull = members;
  } catch (err) {
    console.error(err);
    alert("멤버 정보를 불러오지 못했어.");
    return;
  }

  const myMember = getMySpaceMember(members);
  const myRole = myMember?.role ?? "MEMBER";
  const memberCount = members.length;
  const isOwner = myRole === "OWNER";

  closeSpaceContextMenu();

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");

  if (!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" id="spaceSettingsDialog" style="width: min(420px, 92vw);">
      <div class="dialogHead">
        <div class="dialogTitle">스페이스 설정</div>
        <button class="dialogClose" type="button" id="spaceSettingsCloseBtn" aria-label="닫기">✕</button>
      </div>

      <div class="dialogBody">
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="spaceSettingsName" style="font-size:12px; font-weight:900; color:var(--muted);">
              스페이스 이름
            </label>
            <input
              id="spaceSettingsName"
              type="text"
              value="${escapeHTML(space.name ?? "")}"
              style="height:44px; border:1px solid var(--line); border-radius:12px; padding:0 12px; font-size:14px; font-weight:700; outline:none; background:#fff;"
            />
          </div>
          <div style="display:flex; flex-direction:column; gap:10px; padding:12px; border:1px solid rgba(17,24,39,.08); border-radius:12px; background:#f9fafb;">
            <div style="display:flex; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:900; color:var(--muted);">내 역할</span>
              <span style="font-size:13px; font-weight:900; color:#111827;">${formatSpaceRole(myRole)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; gap:12px;">
              <span style="font-size:12px; font-weight:900; color:var(--muted);">멤버 수</span>
              <span style="font-size:13px; font-weight:900; color:#111827;">${memberCount}명</span>
            </div>
          </div>


        <div style="margin-top:18px; padding-top:14px; border-top:1px solid rgba(17,24,39,.08);">
          <div style="font-size:12px; font-weight:900; color:#b42318; margin-bottom:8px;">
            위험 구역
          </div>
          ${isOwner ? `
            <button
              class="btn danger"
              type="button"
              id="spaceDeleteBtn"
              style="width:100%; justify-content:center; border:1px solid rgba(180,35,24,.18); color:#b42318; background:#fff5f5;"
            >
              스페이스 삭제
            </button>
          ` : `
            <button
              class="btn danger"
              type="button"
              id="spaceLeaveBtn"
              style="width:100%; justify-content:center; border:1px solid rgba(180,35,24,.18); color:#b42318; background:#fff5f5;"
            >
              스페이스 나가기
            </button>
          `}

        </div>

        <div class="dialogActions" style="margin-top:16px;">
          <button class="btn" type="button" id="spaceSettingsCancelBtn">취소</button>
          <button class="btn primary" type="button" id="spaceSettingsSaveBtn">저장</button>
        </div>
      </div>
    </div>
  `;

    const dialog = qs("#spaceSettingsDialog");
    const closeBtn = qs("#spaceSettingsCloseBtn", dialog);
    const cancelBtn = qs("#spaceSettingsCancelBtn", dialog);
    const saveBtn = qs("#spaceSettingsSaveBtn", dialog);
    const deleteBtn = qs("#spaceDeleteBtn", dialog);
    const leaveBtn = qs("#spaceLeaveBtn", dialog);
    const nameInput = qs("#spaceSettingsName", dialog);


  closeBtn?.addEventListener("click", closeOverlay);
  cancelBtn?.addEventListener("click", closeOverlay);

  deleteBtn?.addEventListener("click", () => {
    openDeleteSpaceConfirm(spaceId);
  });
  leaveBtn?.addEventListener("click", () => {
    handleLeaveSpace(spaceId);
  });

  nameInput?.focus();

  saveBtn?.addEventListener("click", async () => {
    const nextName = nameInput?.value.trim();

    if (!nextName) {
      alert("이름을 입력해.");
      nameInput?.focus();
      return;
    }

    try {
      const updated = await updateSpace(spaceId, nextName);
      const sp = state.data.spaces.find(s => String(s.id) === String(spaceId));

      if (sp) {
        sp.name = updated.name;
      }

      renderSpaceList();
      renderSpaceName();
      closeOverlay();
    } catch (err) {
      console.error(err);
      alert("저장에 실패했어.");
    }
  });

  nameInput?.setSelectionRange(nameInput.value.length, nameInput.value.length);
}

function openDeleteSpaceConfirm(spaceId) {
  const space = getSpaceById(spaceId);
  if (!space || !el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" id="deleteSpaceDialog" style="width:min(360px, 92vw);">
      <div class="dialogHead">
        <div class="dialogTitle" style="color:#b42318;">스페이스 삭제</div>
        <button class="dialogClose" type="button" id="deleteSpaceCloseBtn" aria-label="닫기">✕</button>
      </div>

      <div class="dialogBody">
        <div style="font-size:14px; font-weight:800; color:#111827; line-height:1.5;">
          <b>"${escapeHTML(space.name)}"</b> 스페이스를 삭제할까?
        </div>
        <div style="margin-top:10px; font-size:12px; font-weight:800; color:var(--muted); line-height:1.5;">
          이 작업은 되돌리기 어렵다.
        </div>

        <div class="dialogActions" style="margin-top:18px;">
          <button class="btn" type="button" id="deleteSpaceCancelBtn">취소</button>
          <button
            class="btn danger"
            type="button"
            id="deleteSpaceConfirmBtn"
            style="border:1px solid rgba(180,35,24,.18); color:#b42318; background:#fff5f5;"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  `;

  qs("#deleteSpaceCloseBtn")?.addEventListener("click", () => openSpaceSettings(spaceId));
  qs("#deleteSpaceCancelBtn")?.addEventListener("click", () => openSpaceSettings(spaceId));
  qs("#deleteSpaceConfirmBtn")?.addEventListener("click", () => {
    deleteSpace(spaceId);
  });
}

async function requestDeleteSpace(spaceId) {
  const res = await authFetch(`/spaces/${spaceId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("스페이스 삭제 실패");
  }
}

async function deleteSpace(spaceId) {
  try {
    await requestDeleteSpace(spaceId);

    const idx = state.data.spaces.findIndex(
      space => String(space.id) === String(spaceId)
    );
    if (idx < 0) return;

    state.data.spaces.splice(idx, 1);

    if (String(state.spaceId) === String(spaceId)) {
      if (state.data.spaces.length > 0) {
        await setSpace(state.data.spaces[0].id);
      } else {
        state.spaceId = null;
        state.boardId = null;
      }
    }

    renderSpaceList();
    syncSpaceOnboardingModal();
    renderAll();
    closeOverlay();
  } catch (err) {
    console.error(err);
    alert("스페이스 삭제에 실패했어.");
  }
}

async function updateSpace(spaceId, name) {
  const res = await authFetch(`/spaces/${spaceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "스페이스 저장 실패");
  }

  return await res.json();
}

function authFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Authorization": `Bearer ${token}`
        }
    });
}

async function fetchAndApplySpaces() {
  try {
    const response = await authFetch("/spaces", {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Space 목록 불러오기 실패");

    const spaces = await response.json();
    state.data.spaces = Array.isArray(spaces) ? spaces : [];

    if (state.data.spaces.length === 0) {
      state.spaceId = "";
      renderSpaceList();
      return;
    }

    const hasCurrent = state.data.spaces.some(
      s => String(s.id) === String(state.spaceId)
    );
    state.spaceId = hasCurrent
      ? String(state.spaceId)
      : String(state.data.spaces[0].id);

    renderSpaceList();
  } catch (error) {
    console.error("Space 로딩 에러:", error);
  }
}

// =========================
// 보드
// =========================

async function createBoard(spaceId, name, description = "") {
  const res = await authFetch(`/boards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      spaceId: Number(spaceId),
      name,
      description
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("보드 생성 실패 응답:", text);
    throw new Error("보드 생성 실패");
  }

  return await res.json();
}

async function handleAddBoard() {
  const currentSpace = getCurrentSpace();
  if (!currentSpace) {
    return;
  }

  const name = prompt("새 보드 이름");
  if (!name || !name.trim()) return;

  try {
    const newBoard = await createBoard(currentSpace.id, name.trim(), "");

    if (!Array.isArray(currentSpace.boards)) {
      currentSpace.boards = [];
    }

    currentSpace.boards.push(newBoard);

    await setBoard(newBoard.id);
  } catch (err) {
    console.error(err);
    alert("보드 생성에 실패했어.");
  }
}

let contextBoardId = null;

function openBoardContextMenu(x, y, boardId) {
  if (!el.boardContextMenu) return;

  contextBoardId = String(boardId);
  el.boardContextMenu.classList.remove("hidden");

  const menu = el.boardContextMenu;
  const pad = 8;

  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();

    let left = x;
    let top = y;

    if (left + rect.width > window.innerWidth - pad) {
      left = window.innerWidth - rect.width - pad;
    }

    if (top + rect.height > window.innerHeight - pad) {
      top = window.innerHeight - rect.height - pad;
    }

    menu.style.left = `${Math.max(pad, left)}px`;
    menu.style.top = `${Math.max(pad, top)}px`;
  });
}

function closeBoardContextMenu() {
  contextBoardId = null;
  el.boardContextMenu?.classList.add("hidden");
}

async function requestDeleteBoard(boardId) {
  const res = await authFetch(`/boards/${boardId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("보드 삭제 실패");
  }
}

function getBoardNameById(boardId) {
  const currentSpace = getCurrentSpace();
  const boards = currentSpace?.boards ?? [];

  const board = boards.find(b =>
    String(typeof b === "object" ? b.id : b) === String(boardId)
  );

  if (!board) return "알 수 없는 보드";

  return typeof board === "object"
    ? board.name
    : String(board);
}

function openDeleteBoardConfirm(boardId) {
  const boardName = getBoardNameById(boardId);
  closeBoardContextMenu();

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");

  if (!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" style="width:min(360px, 92vw);">
      <div class="dialogHead">

        <div class="dialogTitle" style="color:#b42318;">보드 삭제</div>
        <button class="dialogClose" type="button" id="deleteBoardCloseBtn">✕</button>
      </div>
      <div class="dialogBody">
        <div style="font-size:14px; font-weight:800; line-height:1.5;">
          <b>"${escapeHTML(boardName)}"</b> 보드를 삭제할까?
        </div>
        <div style="margin-top:10px; font-size:12px; font-weight:800; color:var(--muted);">
          되돌리기 어렵다.
        </div>
        <div class="dialogActions" style="margin-top:18px;">
          <button class="btn" type="button" id="deleteBoardCancelBtn">취소</button>
          <button class="btn danger" type="button" id="deleteBoardConfirmBtn"
            style="border:1px solid rgba(180,35,24,.18); color:#b42318; background:#fff5f5;">
            삭제
          </button>
        </div>
      </div>
    </div>
  `;

  qs("#deleteBoardCloseBtn")?.addEventListener("click", closeOverlay);
  qs("#deleteBoardCancelBtn")?.addEventListener("click", closeOverlay);
  qs("#deleteBoardConfirmBtn")?.addEventListener("click", () => deleteBoard(boardId));
}

async function deleteBoard(boardId) {
  try {
    await requestDeleteBoard(boardId);

    const currentSpace = getCurrentSpace();
    if (!currentSpace || !Array.isArray(currentSpace.boards)) return;

    currentSpace.boards = currentSpace.boards.filter(b => {
      const id = typeof b === "object" ? b.id : b;
      return String(id) !== String(boardId);
    });

    state.data.memos = state.data.memos.filter(m => String(m.boardId) !== String(boardId));

    if (String(state.boardId) === String(boardId)) {
      if (currentSpace.boards.length > 0) {
        const firstBoard = currentSpace.boards[0];
        state.boardId = String(typeof firstBoard === "object" ? firstBoard.id : firstBoard);
      } else {
        state.boardId = null;
      }
    }

    renderAll();
    closeOverlay();
  } catch (err) {
    console.error(err);
    alert("보드 삭제에 실패했어.");
  }
}

async function requestUpdateBoard(boardId, name, description = "") {
  const res = await authFetch(`/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, description })
    });

  if (!res.ok) {
    const text = await res.text();
    console.error("보드 수정 실패 응답:", text);
    throw new Error("보드 수정 실패");
  }

  return await res.json();
}

function openRenameBoardModal(boardId) {
  const currentSpace = getCurrentSpace();
  const boards = currentSpace?.boards ?? [];

  const board = boards.find(b =>
    String(typeof b === "object" ? b.id : b) === String(boardId)
  );

  if (!board || typeof board !== "object") return;

  closeBoardContextMenu();

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");

  if (!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" style="width:min(380px, 92vw);">
      <div class="dialogHead">
        <div class="dialogTitle">보드명 변경</div>
        <button class="dialogClose" type="button" id="renameBoardCloseBtn">✕</button>
      </div>
      <div class="dialogBody">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label for="renameBoardInput" style="font-size:12px; font-weight:900; color:var(--muted);">
            보드 이름
          </label>
          <input
            id="renameBoardInput"
            type="text"
            value="${escapeHTML(board.name ?? "")}"
            style="height:44px; border:1px solid var(--line); border-radius:12px; padding:0 12px; font-size:14px; font-weight:700; outline:none; background:#fff;"
            maxlength="30"
          />
        </div>

        <div class="dialogActions" style="margin-top:18px;">
          <button class="btn" type="button" id="renameBoardCancelBtn">취소</button>
          <button class="btn primary" type="button" id="renameBoardSaveBtn">저장</button>
        </div>
      </div>
    </div>
  `;

  const input = qs("#renameBoardInput");
  const closeBtn = qs("#renameBoardCloseBtn");
  const cancelBtn = qs("#renameBoardCancelBtn");
  const saveBtn = qs("#renameBoardSaveBtn");

  closeBtn?.addEventListener("click", closeOverlay);
  cancelBtn?.addEventListener("click", closeOverlay);

  saveBtn?.addEventListener("click", async () => {
    const nextName = input?.value.trim();
    if (!nextName) {
      alert("보드 이름을 입력해.");
      input?.focus();
      return;
    }

    try {
      const updatedBoard = await requestUpdateBoard(
        boardId,
        nextName,
        board.description ?? ""
      );

      const idx = boards.findIndex(b =>
        String(typeof b === "object" ? b.id : b) === String(boardId)
      );

      if (idx >= 0 && typeof boards[idx] === "object") {
        boards[idx] = {
          ...boards[idx],
          ...updatedBoard,
          id: updatedBoard.id ?? boards[idx].id,
          name: updatedBoard.name ?? nextName
        };
      }

      if (String(state.boardId) === String(boardId)) {
        syncBoardHeader?.();
      }

      renderSpaceList();
      renderAll();
      closeOverlay();
    } catch (err) {
      console.error(err);
      alert("보드명 변경에 실패했어.");
    }
  });

  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveBtn?.click();
    }
  });
}


async function fetchBoardsBySpace(spaceId) {
  const res = await authFetch(`/boards/space/${spaceId}`, {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("보드 목록 조회 실패");
  }

  return await res.json();
}

// =========================
// Memo API
// =========================

async function fetchMemosByBoard(boardId) {
  const res = await authFetch(`/memos/board/${boardId}`, {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("메모 목록 조회 실패");
  }

  return await res.json();
}

async function createMemoRequest({ content, boardId, authorId, color, attachmentIds = [] }) {
  const res = await authFetch("/memos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      content,
      boardId: Number(boardId),
      authorId: Number(authorId),
      color,
      attachmentIds
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("메모 생성 실패 응답:", text);
    throw new Error("메모 생성 실패");
  }

  return await res.json();
}

async function updateMemoRequest(memoId, content, color, attachmentIds = []) {
  const res = await authFetch(`/memos/${memoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content, color, attachmentIds })
    });

  if (!res.ok) {
    const text = await res.text();
    console.error("메모 수정 실패 응답:", text);
    throw new Error("메모 수정 실패");
  }

  return await res.json();
}

async function deleteMemoRequest(memoId) {
  const res = await authFetch(`/memos/${memoId}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("메모 삭제 실패 응답:", text);
    throw new Error("메모 삭제 실패");
  }
}

function applyMemos(memos) {
  state.data.memos = (Array.isArray(memos) ? memos : []).map(m => ({
    id: String(m.id),
    boardId: String(m.board?.id ?? m.boardId),
    authorId: String(m.authorId ?? ""),
    author: String(m.authorId ?? ""),
    authorNickname: m.authorNickname ?? null,
    content: m.content ?? "",
    color: m.color ?? "yellow",
    createdAt: m.createdAt ?? new Date().toISOString(),
    updatedAt: m.updatedAt ?? null,
    attachments: Array.isArray(m.attachments) ? m.attachments : []
  }));
}

async function reloadCurrentBoardMemos() {
  if (!state.boardId) {
    state.data.memos = [];
    renderAll();
    return;
  }

  try {
    const memos = await fetchMemosByBoard(state.boardId);
    applyMemos(memos);

    const currentSpace = getCurrentSpace();
    if (currentSpace && state.spaceId) {
      const boards = await fetchBoardsBySpace(state.spaceId);
      currentSpace.boards = Array.isArray(boards) ? boards : [];
    }
  } catch (err) {
    console.error("현재 보드 메모 다시 불러오기 실패:", err);
    state.data.memos = [];
  }

  renderAll();
}

function getRouteFromUrl() { //URL 읽는 함수
  const params = new URLSearchParams(window.location.search);

  const space = params.get("space");
  const board = params.get("board");

  return {
    spaceId: space ? Number(space) : null,
    boardId: board ? Number(board) : null
  };
}

function setRouteToUrl(spaceId, boardId = null) { //URL 쓰는 함수
  const url = new URL(window.location);

  if (spaceId !== null && spaceId !== undefined) {
    url.searchParams.set("space", spaceId);
  } else {
    url.searchParams.delete("space");
  }

  if (boardId !== null && boardId !== undefined) {
    url.searchParams.set("board", boardId);
  } else {
    url.searchParams.delete("board");
  }

  history.replaceState({}, "", url);
}

function getCurrentBoard() { //보드 찾는 함수
  const currentSpace = getCurrentSpace();
  if (!currentSpace || !Array.isArray(currentSpace.boards)) return null;

  return currentSpace.boards.find(
    board => String(board.id) === String(state.boardId)
  ) ?? null;
}

function syncBoardHeader() { //board header 화면 동기화 함수
  const currentBoard = getCurrentBoard();

  if (el.boardName) {
    el.boardName.textContent = currentBoard?.name
      ? `#${currentBoard.name}`
      : "보드 없음";
  }

  if (el.boardDesc) {
    el.boardDesc.textContent = currentBoard?.description ?? "";
  }
}

async function updateBoard(boardId, payload) { // 보드 설명 수정 api 함수
  const res = await authFetch(`/boards/${boardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("보드 수정 실패 응답:", text);
    throw new Error("보드 수정 실패");
  }

  return await res.json();
}

async function uploadFiles(files) { //파일 업로드 함수
  const formData = new FormData();

  files.forEach(file => {
    formData.append("files", file);
  });

  const res = await authFetch("/uploads", {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("업로드 실패:", text);
    throw new Error("업로드 실패");
  }

  return await res.json();
}

function renderSpaceList() {
  if (!el.spaceList) return;
  if (state.data.spaces.length === 0) {
    el.spaceList.innerHTML = '<div class="emptyListMsg">가입된 스페이스 없음</div>';
    return;
  }

  el.spaceList.innerHTML = state.data.spaces.map(space => {
    const isActive = String(space.id) === String(state.spaceId);
    const boards = space.boards ?? [];

    const boardsHtml = isActive ? `
      <div class="board-wrap">
        <div class="board-list">
          ${boards.length === 0
            ? '<div class="emptyListMsg">개설된 보드 없음</div>'
            : boards.map(b => {
                const boardId = typeof b === "object" ? String(b.id) : String(b);
                const boardName = typeof b === "object" ? b.name : String(b);
                const count = typeof b === "object" ? (b.memoCount ?? 0) : 0;
                const isActiveBoard = boardId === String(state.boardId);
                return `
                  <div class="board-item ${isActiveBoard ? "active" : ""}" data-board-id="${boardId}">
                    <i class="ti ti-hash board-icon"></i>
                    <span class="board-label">${escapeHTML(boardName)}</span>
                    <span class="board-count">${count}</span>
                  </div>`;
              }).join("")
          }
          <div class="add-btn addBoardInline" style="padding:6px 10px; font-size:13px;" data-space-id="${space.id}">
            <i class="ti ti-plus" style="font-size:14px;"></i>
            보드 추가
          </div>
        </div>
      </div>` : "";

    return `
      <div class="space-item">
        <div class="space-header ${isActive ? "active" : "collapsed"}" data-space-id="${space.id}">
          <div class="space-icon">
            <i class="ti ${isActive ? "ti-folder-filled" : "ti-folder"}" style="color:${isActive ? "white" : "#BBBBAA"}; font-size:17px;"></i>
          </div>
          <span class="space-label">${escapeHTML(space.name)}</span>
          <i class="ti ti-chevron-right space-chevron"></i>
        </div>
        ${boardsHtml}
      </div>`;
  }).join("");

  // 스페이스 클릭
  el.spaceList.querySelectorAll(".space-header").forEach(header => {
    header.addEventListener("click", () => setSpace(header.dataset.spaceId));
    header.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openSpaceContextMenu(e.clientX, e.clientY, header.dataset.spaceId);
    });
  });

  // 보드 클릭
  el.spaceList.querySelectorAll(".board-item").forEach(item => {
    item.addEventListener("click", () => setBoard(item.dataset.boardId));
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      openBoardContextMenu(e.clientX, e.clientY, item.dataset.boardId);
    });
  });

  // 보드 추가 버튼
  el.spaceList.querySelectorAll(".addBoardInline").forEach(btn => {
    btn.addEventListener("click", handleAddBoard);
  });
}

function renderSpaceName() {
    const tabBoardSub = document.getElementById("tabBoardSub");
    if (tabBoardSub) {
        const spaceName = getCurrentSpace()?.name ?? "";
        tabBoardSub.textContent = spaceName ? `${spaceName} 의 게시판` : "게시판";
    }
}

function openProfileModal() {
  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");
  if (!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" id="profileDialog" style="width:min(400px,92vw);">
      <div class="dialogHead">
        <div class="dialogTitle">프로필</div>
        <button class="dialogClose" type="button" id="profileCloseBtn">✕</button>
      </div>
      <div class="dialogBody">

        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding:14px;background:#f9fafb;border-radius:14px;">

          <div style="position:relative;cursor:pointer;" id="profileAvatarWrap">
            <div class="avatar" id="profileAvatar"
              style="width:48px;height:48px;font-size:18px;overflow:hidden;">?</div>
            <div style="position:absolute;inset:0;border-radius:999px;background:rgba(0,0,0,.35);
              display:flex;align-items:center;justify-content:center;
              opacity:0;transition:opacity .15s;font-size:11px;font-weight:800;color:#fff;"
              id="profileAvatarOverlay">변경</div>
            <input type="file" id="profileAvatarInput" accept="image/*" hidden />
          </div>

          <div>
            <div style="font-size:15px;font-weight:800;color:#111827;" id="profileNameDisplay">로딩중...</div>
            <div style="font-size:12px;font-weight:700;color:#6b7280;" id="profileEmailDisplay"></div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          <label style="font-size:12px;font-weight:900;color:#6b7280;">닉네임</label>
          <input id="profileNicknameInput" type="text"
            style="height:44px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;outline:none;background:#fff;"
            placeholder="닉네임 입력"
          />
        </div>

        <div style="margin-bottom:20px;">
          <button class="btn" type="button" id="profileChangePwBtn"
            style="width:100%;height:44px;border:1px solid var(--line);border-radius:12px;font-size:14px;font-weight:700;">
            비밀번호 변경
          </button>
        </div>

        <div class="dialogActions" style="justify-content:space-between;">
          <button class="btn" type="button" id="profileLogoutBtn"
            style="border:1px solid rgba(180,35,24,.18);color:#b42318;background:#fff5f5;">
            로그아웃
          </button>
          <button class="btn primary" type="button" id="profileSaveBtn">저장</button>
        </div>

      </div>
    </div>
  `;

  const dialog = qs("#profileDialog");

  loadMyProfile(dialog);

  qs("#profileCloseBtn", dialog)?.addEventListener("click", closeOverlay);
  qs("#profileChangePwBtn", dialog)?.addEventListener("click", openChangePasswordModal);

  qs("#profileSaveBtn", dialog)?.addEventListener("click", async () => {
    const nickname = qs("#profileNicknameInput", dialog)?.value.trim();

    if (!nickname) {
      alert("닉네임을 입력해.");
      return;
    }

    try {
      alert("저장됐어.");
      closeOverlay();
      syncMyProfile();
    } catch (err) {
      console.error(err);
      alert("저장에 실패했어.");
    }
  });

  qs("#profileLogoutBtn", dialog)?.addEventListener("click", () => {
    if (!confirm("로그아웃 할까요?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("loginUserId");
    window.location.href = "/";
  });

  const avatarWrap = qs("#profileAvatarWrap", dialog);
  const avatarOverlay = qs("#profileAvatarOverlay", dialog);
  const avatarInput = qs("#profileAvatarInput", dialog);

  avatarWrap?.addEventListener("mouseenter", () => avatarOverlay.style.opacity = "1");
  avatarWrap?.addEventListener("mouseleave", () => avatarOverlay.style.opacity = "0");

  avatarWrap?.addEventListener("click", () => avatarInput?.click());

  avatarInput?.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadFiles([file]);
      const url = uploaded?.[0]?.url;
      if (!url) throw new Error("url 없음");

      await updateMyAvatar(url);

      // 모달 아바타 갱신
      const avatar = qs("#profileAvatar", dialog);
      if (avatar) {
        avatar.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" />`;
      }

      // 사이드바 하단 아바타 갱신
      const sideAvatar = qs("#meAvatar");
      if (sideAvatar) {
        sideAvatar.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" />`;
      }

    } catch (err) {
      console.error(err);
      alert("이미지 업로드에 실패했어.");
    }

    avatarInput.value = "";
  });
}

async function updateMyAvatar(url) {
  const res = await authFetch("/users/me/avatar", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ profileImageUrl: url })
  });

  if (!res.ok) throw new Error("아바타 업데이트 실패");
  return await res.json();
}

function openChangePasswordModal() {
  overlayMode = "modal";
  openOverlay();
  if (!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog" id="changePwDialog" style="width:min(380px,92vw);">
      <div class="dialogHead">
        <div class="dialogTitle">비밀번호 변경</div>
        <button class="dialogClose" type="button" id="changePwCloseBtn">✕</button>
      </div>
      <div class="dialogBody">

        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:900;color:#6b7280;">현재 비밀번호</label>
            <input id="currentPwInput" type="password"
              style="height:44px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;outline:none;background:#fff;"
              placeholder="현재 비밀번호"
            />
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:900;color:#6b7280;">새 비밀번호</label>
            <input id="newPwInput" type="password"
              style="height:44px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;outline:none;background:#fff;"
              placeholder="새 비밀번호"
            />
          </div>

          <div style="display:flex;flex-direction:column;gap:6px;">
            <label style="font-size:12px;font-weight:900;color:#6b7280;">비밀번호 확인</label>
            <input id="confirmPwInput" type="password"
              style="height:44px;border:1px solid var(--line);border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;outline:none;background:#fff;"
              placeholder="새 비밀번호 재입력"
            />
          </div>

        </div>

        <div class="dialogActions">
          <button class="btn" type="button" id="changePwCancelBtn">취소</button>
          <button class="btn primary" type="button" id="changePwSaveBtn">변경</button>
        </div>

      </div>
    </div>
  `;

  const dialog = qs("#changePwDialog");

  qs("#changePwCloseBtn", dialog)?.addEventListener("click", () => openProfileModal());
  qs("#changePwCancelBtn", dialog)?.addEventListener("click", () => openProfileModal());

  qs("#changePwSaveBtn", dialog)?.addEventListener("click", async () => {
    const currentPw = qs("#currentPwInput", dialog)?.value.trim();
    const newPw = qs("#newPwInput", dialog)?.value.trim();
    const confirmPw = qs("#confirmPwInput", dialog)?.value.trim();
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$])(?=.*\d).{8,}$/;

    if (!currentPw || !newPw || !confirmPw) {
      alert("모든 항목을 입력해.");
      return;
    }

    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않아.");
      qs("#confirmPwInput", dialog)?.focus();
      return;
    }

    if (!passwordPattern.test(newPw)) {
      alert("비밀번호는 8자 이상이며 소문자, 대문자, 숫자, 특수문자(!@#$)를 포함해야 해.");
      qs("#newPwInput", dialog)?.focus();
      return;
    }

    try {
      await updateMyPassword({ currentPassword: currentPw, newPassword: newPw });
      alert("비밀번호가 변경됐어.");
      openProfileModal();
    } catch (err) {
        console.error(err);
        alert(err.message || "비밀번호 변경에 실패했어.");
      }
  });

  qs("#currentPwInput", dialog)?.focus();
}

async function updateMyPassword({ currentPassword, newPassword }) {
  const res = await authFetch("/users/me/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "비밀번호 변경 실패");
  }

  return await res.json();
}

async function loadMyProfile(dialog) {
  try {
    const res = await authFetch(`/users/${state.me}`, {
      credentials: "include"
    });
    if (!res.ok) throw new Error();

    const me = await res.json();

    const avatar = qs("#profileAvatar", dialog);
    const nameDisplay = qs("#profileNameDisplay", dialog);
    const emailDisplay = qs("#profileEmailDisplay", dialog);
    const nicknameInput = qs("#profileNicknameInput", dialog);

    if (avatar) {
      if (me.profileImageUrl) {
        avatar.innerHTML = `<img src="${me.profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" />`;
      } else {
        avatar.textContent = (me.nickname ?? me.loginId ?? "?")[0].toUpperCase();
      }
    }
    if (nameDisplay) nameDisplay.textContent = me.nickname ?? me.loginId ?? "알 수 없음";
    if (emailDisplay) emailDisplay.textContent = me.loginId ?? "";
    if (nicknameInput) nicknameInput.value = me.nickname ?? "";
  } catch (err) {
    console.error("프로필 로딩 실패:", err);
  }
}

async function updateMyProfile({ nickname, password }) {
  const body = { nickname };
  if (password) body.password = password;

  const res = await authFetch("/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error("프로필 수정 실패");
  return await res.json();
}

function syncMyProfile() {
  authFetch(`/users/${state.me}`, { credentials: "include" })
    .then(r => r.json())
    .then(me => {
      const sideAvatar = qs("#meAvatar");
      if (sideAvatar) {
        if (me.profileImageUrl) {
          sideAvatar.innerHTML = `<img src="${me.profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" />`;
        } else {
          sideAvatar.textContent = (me.nickname ?? me.loginId ?? "?")[0].toUpperCase();
        }
      }
      if (qs("#meName")) qs("#meName").textContent = me.nickname ?? me.loginId ?? "알 수 없음";
    })
    .catch(() => {});
}

async function handleLeaveSpace(spaceId) {
  if (!confirm("스페이스에서 나가시겠습니까?")) return;
  try {
    await authFetch(`/spaces/${spaceId}/members/${state.me}`, {
      method: "DELETE",
      credentials: "include"
    });

    await fetchAndApplySpaces();

    if (state.data.spaces.length === 0) {
      // 스페이스가 하나도 없음 → 온보딩
      state.spaceId = null;
      state.boardId = null;
      state.data.memos = [];
      setRouteToUrl(null, null);
      renderAll();
      syncSpaceOnboardingModal();
    } else if (String(state.spaceId) === String(spaceId)) {
      // 나간 스페이스가 현재 스페이스였음 → 첫번째로 이동
      await setSpace(state.data.spaces[0].id);
    }
  } catch (err) {
    console.error(err);
    alert("나가기 실패");
  }
}

function formatRole(role) {
  if (role === "OWNER") return "OWNER (방주인)";
  if (role === "ADMIN") return "ADMIN (관리자)";
  return "MEMBER (멤버)";
}

function addDockImage(file) {
  if (dockImages.length >= 4) { alert("이미지는 최대 4개야."); return; }
  const url = URL.createObjectURL(file);
  dockImages.push({ file, url });
  renderDockImagePreview();
}

function renderDockImagePreview() {
  const preview = qs("#dockImagePreview");
  if (!preview) return;
  if (dockImages.length === 0) {
    preview.style.display = "none";
    preview.innerHTML = "";
    return;
  }
  preview.style.display = "flex";
  preview.innerHTML = dockImages.map((img, i) => `
    <div class="attachItem">
      <img src="${img.url}" />
      <button class="attachRemove" data-index="${i}" type="button">✕</button>
    </div>
  `).join("");
  preview.querySelectorAll(".attachRemove").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      URL.revokeObjectURL(dockImages[idx].url);
      dockImages.splice(idx, 1);
      renderDockImagePreview();
    });
  });
}

// =========================
// bind events
// =========================
function bindEvents(){
  el.meBtn?.addEventListener("click", openProfileModal);

  // 스페이스 추가 버튼
  el.addSpaceBtn?.addEventListener("click", () => openSpaceOnboardingModal());

  el.searchInput?.addEventListener("input", onSearchInput);
  el.searchClear?.addEventListener("click", onSearchClear);

  el.quickInput?.addEventListener("keydown", onQuickKeydown);
  el.quickInputDock?.addEventListener("keydown", onQuickKeydownDock);

el.composerPlus?.addEventListener("click", (e) => {
  e.stopPropagation();
  openNewMemoModal();
});

el.composerPlusDock?.addEventListener("click", (e) => {
  e.stopPropagation();
  openNewMemoModal();
});

  el.composerFile?.addEventListener("change", () => onComposerFiles(el.composerFile));
  el.composerFileDock?.addEventListener("change", () => onComposerFiles(el.composerFileDock));

  el.panelClose?.addEventListener("click", closeSidePanel);

  el.overlay?.addEventListener("pointerdown", onOverlayPointerDown);
  window.addEventListener("keydown", onGlobalKeydown);
  document.addEventListener("pointerdown", onDocumentPointerDown);

  el.toggleSidebarBtn?.addEventListener("click", onToggleSidebar);
  el.splitter?.addEventListener("pointerdown", onSplitterDown);

  el.joinByCodeBtn?.addEventListener("click", handleJoinByCode);

  el.membersToggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMemberPanel();
  });

      el.spaceOnboardingModal?.addEventListener("click", (e) => {
        if (e.target === el.spaceOnboardingModal) {
          closeSpaceOnboardingModal();
        }
      });

      el.createSpaceModal?.addEventListener("click", (e) => {
        if (e.target === el.createSpaceModal) {
          closeCreateSpaceModal();
        }
      });

  el.memberClose?.addEventListener("click", closeMemberPanel);

    el.showCreateSpaceBtn?.addEventListener("click", switchToCreateSpaceModal);
    el.closeCreateSpaceModalBtn?.addEventListener("click", closeCreateSpaceModal);
    el.backToJoinModalBtn?.addEventListener("click", switchToJoinModal);
    el.submitCreateSpaceBtn?.addEventListener("click", handleCreateSpace);

    el.createSpaceNameInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCreateSpace();
      }
    });

  if (el.boardDesc) {
    el.boardDesc.addEventListener("click", () => {
      if (el.boardDesc.getAttribute("contenteditable") === "false") {
        el.boardDesc.setAttribute("contenteditable", "true");
        el.boardDesc.focus();
      }
    });

    el.boardDesc.addEventListener("blur", async () => {
      el.boardDesc.setAttribute("contenteditable", "false");

      const currentBoard = getCurrentBoard();
      if (!currentBoard) return;

      const nextDescription = el.boardDesc.textContent.trim();

      try {
      const updatedBoard = await updateBoard(currentBoard.id, { description: nextDescription });
          currentBoard.description = updatedBoard.description ?? nextDescription;
        syncBoardHeader();
      } catch (err) {
        console.error(err);
        alert("보드 설명 저장에 실패했어.");
        el.boardDesc.textContent = currentBoard.description ?? "";
      }
    });

    el.boardDesc.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.boardDesc.blur();
      }
    });
  }

 el.boardContextMenu?.addEventListener("click", (e) => {
   const btn = e.target.closest(".boardContextItem");
   if (!btn || !contextBoardId) return;

   const act = btn.dataset.act;

   if (act === "rename") {
     openRenameBoardModal(contextBoardId);
     return;
   }

   if (act === "delete") {
     openDeleteBoardConfirm(contextBoardId);
   }
 });

 el.spaceContextMenu?.addEventListener("click", (e) => {
   const item = e.target.closest(".spaceContextItem");
   if (!item) return;
   const act = item.dataset.act;

   if (act === "invite") {
     handleGenerateInviteCode(contextSpaceId);
     closeSpaceContextMenu();
   } else if (act === "settings") {
     openSpaceSettings(contextSpaceId);
   }
 });

 qs("#inviteModalClose")?.addEventListener("click", () => {
   qs("#inviteModal")?.classList.add("hidden");
 });

 qs("#inviteCopyBtn")?.addEventListener("click", () => {
   const code = qs("#inviteCodeDisplay")?.textContent;
   if (code) navigator.clipboard.writeText(code).then(() => alert("복사됐어!"));
 });

 // Ctrl+V 붙여넣기
 el.quickInputDock?.addEventListener("paste", (e) => {
   const items = Array.from(e.clipboardData?.items ?? []);
   const imageItems = items.filter(i => i.type.startsWith("image/"));
   if (imageItems.length === 0) return;
   e.preventDefault();
   imageItems.forEach(item => {
     const file = item.getAsFile();
     if (file) addDockImage(file);
   });
 });

 // 드래그 앤 드롭
 const dockBar = qs("#dock");
 dockBar?.addEventListener("dragover", (e) => {
   e.preventDefault();
   e.dataTransfer.dropEffect = "copy";
 });
 dockBar?.addEventListener("drop", (e) => {
   e.preventDefault();
   const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
   files.forEach(f => addDockImage(f));
 });

}

// =========================
// renderAll
// =========================
function renderAll() {

  if (!hasAnySpace()) {
    showOnboarding(true);
    return;
  }

  showOnboarding(false);

  const currentSpace = getCurrentSpace();

  if (!state.spaceId || !currentSpace) {
    if (el.board) el.board.innerHTML = "";
    if (el.boardName) el.boardName.textContent = "보드 없음";
    return;
  }

  renderSpaceName();
  syncBoardHeader();
  syncBoardSummary();
  renderSpaceList();
  renderBoard();
  applyBoardCols();
}

// =========================
// init
// =========================
function init() {
  if (el.boardWrap) ro.observe(el.boardWrap);

  bindEvents();
  bindColorPicker(el.quickColors);
  bindColorPicker(el.quickColorsDock);
  syncMyProfile();

  loadSidebarW();

  const saved = localStorage.getItem("sidebarCollapsed");

  if (saved === "1") {
    el.layout?.classList.add("sidebar-collapsed");
  } else {
    el.layout?.classList.remove("sidebar-collapsed");
  }

  syncColorUI();
  syncSearchClear();

  autoGrowTextarea(el.quickInput);
  autoGrowTextarea(el.quickInputDock);

  renderAll();
}


init();

