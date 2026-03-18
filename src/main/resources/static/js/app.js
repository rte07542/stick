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

  boardList: qs("#boardList"),
  boardName: qs("#boardName"),
  boardDesc: qs("#boardDesc"),

  spaceSelect: qs("#spaceSelect"),
  spaceBtn: qs("#spaceBtn"),
  spaceLabel: qs("#spaceLabel"),
  spaceMenu: qs("#spaceMenu"),
  spacePill: qs("#spacePill"),

  searchInput: qs("#searchInput"),
  searchWrap: qs("#searchWrap"),
  searchClear: qs("#searchClear"),

  emptyState: qs("#emptyState"),
  dock: qs("#dock"),

  quickInput: qs("#quickInput"),
  fab: qs("#fab"),

  quickInputDock: qs("#quickInputDock"),
  fabDock: qs("#fabDock"),

  quickColors: qs("#quickColors"),
  quickColorsDock: qs("#newColors"),

  layout: qs(".layout"),
  toggleSidebarBtn: qs("#toggleSidebar"),
  splitter: qs("#splitter"),

  memberCount: qs("#memberCount"),

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

addBoardBtn: qs("#addBoardBtn"),
boardContextMenu: qs("#boardContextMenu"),

};

// =========================
// bind events
// =========================
function bindEvents(){
  el.quickInput?.addEventListener("input", e => autoGrowTextarea(e.target));
  el.quickInputDock?.addEventListener("input", e => autoGrowTextarea(e.target));

  el.spaceBtn?.addEventListener("click", onSpaceMenuOpen);
  el.spaceMenu?.addEventListener("click", onSpaceMenuClick);
  el.spaceSelect?.addEventListener("change", onSpaceChange);

  el.searchInput?.addEventListener("input", onSearchInput);
  el.searchClear?.addEventListener("click", onSearchClear);

  el.quickInput?.addEventListener("keydown", onQuickKeydown);
  el.quickInputDock?.addEventListener("keydown", onQuickKeydownDock);

  el.composerPlus?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPlusMenu(el.composerPlus, el.composerFile);
  });

  el.composerPlusDock?.addEventListener("click", (e) => {
    e.stopPropagation();
    openPlusMenu(el.composerPlusDock, el.composerFileDock);
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

el.spaceMenu?.addEventListener("contextmenu", (e) => {
  const item = e.target.closest(".dropItem");
  if (!item) return;

  e.preventDefault();
  e.stopPropagation();

  const spaceId = item.dataset.value;
  if (!spaceId) return;

  closeSpaceMenu();
  openSpaceContextMenu(e.clientX, e.clientY, spaceId);
});

el.spaceBtn?.addEventListener("contextmenu", (e) => {
  if (!state.spaceId) return;

  e.preventDefault();
  e.stopPropagation();

  closeSpaceMenu();
  openSpaceContextMenu(e.clientX, e.clientY, state.spaceId);
});

    el.spaceContextMenu?.addEventListener("click", (e) => {
      const btn = e.target.closest(".spaceContextItem");
      if (!btn || !contextSpaceId) return;

      const act = btn.dataset.act;

      if (act === "settings") {
        openSpaceSettings(contextSpaceId);
        return;
      }

      if (act === "leave") {
        leaveSpace(contextSpaceId);
      }
    });

// --- 교체할 코드 (bindEvents 함수 안에 넣으세요) ---
  el.boardDesc = qs("#boardDesc");
  if (el.boardDesc) {
    el.boardDesc.addEventListener("click", () => {
      if (el.boardDesc.getAttribute("contenteditable") === "false") {
        el.boardDesc.setAttribute("contenteditable", "true");
        el.boardDesc.focus();
      }
    });

    el.boardDesc.addEventListener("blur", () => {
      el.boardDesc.setAttribute("contenteditable", "false");
      if (el.boardDesc.textContent.trim() === "") {
        el.boardDesc.innerHTML = ""; // 텅 비우면 연필 다시 등장
      }
    });

    el.boardDesc.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        el.boardDesc.blur();
      }
    });
  }

  el.addBoardBtn?.addEventListener("click", handleAddBoard);

  el.boardList?.addEventListener("contextmenu", (e) => {
    const btn = e.target.closest(".boardBtn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const boardId = btn.dataset.boardId;
    if (!boardId) return;

    openBoardContextMenu(e.clientX, e.clientY, boardId);
  });

  el.boardContextMenu?.addEventListener("click", (e) => {
    const btn = e.target.closest(".boardContextItem");
    if (!btn || !contextBoardId) return;

    const act = btn.dataset.act;

    if (act === "delete") {
      openDeleteBoardConfirm(contextBoardId);
    }
  });

}

// =========================
// constants
// =========================
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 420;
const COLOR_CLASSES = ["cream", "blue", "sage", "coral", "lavender"];
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
  me: "1",
  spaceId: null,
  boardId: null,
  search: "",
  quickColor: "cream",
  data: {
    spaces: [],
    boards: [],
    memos: []
  }
};

function updateBoardStatus(data) {
  // data = { memoCount: 51, memberCount: 9, lastModified: "01/06 00:00:00" }
  if (qs("#memoCount")) qs("#memoCount").textContent = data.memoCount;
  if (qs("#memberCount")) qs("#memberCount").textContent = data.memberCount;
  if (qs("#lastModified")) qs("#lastModified").textContent = data.lastModified;
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

function highlight(text, q){
  const safe = escapeHTML(text);
  if(!q) return safe.replaceAll("\n","<br/>");
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return safe.replaceAll("\n","<br/>").replace(re, "<mark>$1</mark>");
}

function getNoteSize(content){
  const len = content.trim().length;
  return len >= 90 ? "large" : "small";
}

function syncSearchClear(){
  const has = (el.searchInput?.value.trim().length ?? 0) > 0;
  el.searchWrap?.classList.toggle("hasText", has);
}

function createDraftAttachments(){
  return []; // [{ id, file, objectUrl }]
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
      : `이미지 붙여넣기(Ctrl+V) 가능. 지금은 임시 프리뷰만 뜸. (${draftAttachments.length}/${MAX_ATTACH})`;
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
function hasSpaces() {
  return Array.isArray(state.data.spaces) && state.data.spaces.length > 0;
}

function syncSpaceOnboardingModal() {
  if (hasSpaces()) {
    closeSpaceOnboardingModal();
  } else {
    openSpaceOnboardingModal();
  }
}

async function loadInitialData() {
  try {
    await fetchAndApplySpaces();

    if (state.data.spaces.length > 0) {
      const stillValid = state.data.spaces.some(
        space => String(space.id) === String(state.spaceId)
      );

      const targetSpaceId = stillValid
        ? state.spaceId
        : state.data.spaces[0].id;

      await setSpace(targetSpaceId);
    } else {
      state.spaceId = null;
      state.boardId = null;
      renderAll();
    }

    syncSpaceOnboardingModal();
  } catch (err) {
    console.error(err);
    state.data.spaces = [];
    state.spaceId = null;
    state.boardId = null;
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

async function fetchMySpaces() {
  const res = await fetch("http://localhost:8080/spaces", {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("스페이스 목록 조회 실패");
  }

  return await res.json();
}

async function createSpace(name, ownerId, description = "") {
  const params = new URLSearchParams({
    name,
    ownerId: String(ownerId),
    description
  });

  const res = await fetch(`http://localhost:8080/spaces?${params.toString()}`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("스페이스 생성 실패");
  }

  return await res.json();
}

async function joinSpaceByCode(inviteCode) {
  const res = await fetch("/spaces/join", {
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
function openViewModal(id){
  const m = state.data.memos.find(x => x.id === id);
  if(!m) return;

  const canEdit = (String(m.authorId) === String(state.me));
  const isEdited = !!m.updatedAt;

  overlayMode = "modal";
  openOverlay();
  el.sidePanel?.classList.add("hidden");
  if(!el.modalRoot) return;

  el.modalRoot.innerHTML = `
    <div class="dialog noteDialog" id="viewMemoDialog">
      <div class="dialogBody">

        <!-- 1줄: 작성자 + x -->
        <div class="viewTop"
             style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:900;color:var(--muted);">
            <span id="viewAuthor"></span>
          </div>
          <button class="dialogClose" type="button" id="viewCloseBtn" aria-label="닫기">✕</button>
        </div>

        <!-- 2줄: 내용 -->
        <div id="viewContent"
             style="white-space:pre-wrap;font-size:14px;font-weight:800;color:#111827;line-height:1.6;">
        </div>

        <!-- 3줄: 시간(수정됨) + 버튼 -->
        <div class="viewBottom"
             style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">

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
  `;

  const dialog = qs("#viewMemoDialog");

  if(m.content.length < 80){
    dialog.classList.add("small");
  }else{
    dialog.classList.add("large");
  }

  // 메모 색 입히기
  COLOR_CLASSES.forEach(c => dialog.classList.remove(c));
  dialog.classList.add(m.color || "cream");

  // 안전 렌더
  qs("#viewAuthor", dialog).textContent = canEdit
    ? `작성자 ID ${m.authorId} (나)`
    : `작성자 ID ${m.authorId}`;
  qs("#viewTime", dialog).textContent = formatDate(m.createdAt);
  qs("#viewEdited", dialog).textContent = isEdited ? "(수정됨)" : "";
  qs("#viewContent", dialog).textContent = m.content;

  qs("#viewCloseBtn", dialog)?.addEventListener("click", closeOverlay);

  if(canEdit){
    qs("#editBtn", dialog)?.addEventListener("click", () => openEditModal(id));
    qs("#deleteBtn", dialog)?.addEventListener("click", () => {
      if(confirm("삭제할거임?")) deleteMemo(id);
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
        <textarea id="editText" class="dialogText" placeholder="메모를 입력..."></textarea>

        <div class="dialogMeta">
          <span style="font-size:12px;font-weight:900;color:var(--muted);">
            색상
          </span>

          <div class="color-pick" id="editColors" aria-label="색상 선택">
            <div class="swatch white" data-color="cream" title="화이트"></div>
            <div class="swatch blue" data-color="blue" title="블루"></div>
            <div class="swatch green" data-color="sage" title="그린"></div>
            <div class="swatch coral" data-color="coral" title="오렌지"></div>
            <div class="swatch purple" data-color="lavender" title="퍼플"></div>
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

  // 초기값
  ta.value = m.content;

  let picked = m.color || "cream";
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
  saveBtn?.addEventListener("click", () => {
    const next = ta.value.trim();
    if(!next) return;

    updateMemo(id, {
      content: next,
      color: picked,
      updatedAt: new Date().toISOString(),
    });

    renderAll();
    openViewModal(id); // 저장 후 보기로
  });

  // UX: 열자마자 포커스
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}


// =========================
// derived data
// =========================
function getMySpaceIds() {
   return state.data.spaces.map(space => String(space.id));
 }

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
    m.author.toLowerCase().includes(q)
  );
}

// =========================
// actions (state changes)
// =========================
async function setSpace(spaceId) {
  state.spaceId = String(spaceId);

  const currentSpace = getCurrentSpace();
  if (!currentSpace) return;

  try {
    const boards = await fetchBoardsBySpace(spaceId);
    currentSpace.boards = Array.isArray(boards) ? boards : [];

    if (currentSpace.boards.length > 0) {
      state.boardId = String(currentSpace.boards[0].id);

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
  if (!text || !state.boardId) return;

  try {
    await createMemoRequest(text, state.boardId, 1, state.quickColor);
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
  if(el.boardList) el.boardList.innerHTML = "";
  if(el.memberCount) el.memberCount.textContent = "0";

  if(el.boardName){
    el.boardName.textContent = show ? "보드 없음" : el.boardName.textContent;
  }
}

// =========================
// render
// =========================
function syncSpaceLabel() {
  if (!el.spaceLabel) return;

  if (!hasAnySpace()) {
    el.spaceLabel.textContent = "여기눌러 추가";
    return;
  }

  const currentSpace = getCurrentSpace();

  el.spaceLabel.textContent =
    currentSpace?.name ??
    el.spaceSelect?.selectedOptions?.[0]?.textContent ??
    "스페이스 선택";
}

function renderBoards() {
  if (!el.boardList) return;

  el.boardList.innerHTML = "";
  const currentSpace = getCurrentSpace();
  const boards = currentSpace?.boards ?? [];

  boards.forEach((boardItem) => {
    const boardId = typeof boardItem === "object"
      ? String(boardItem.id)
      : String(boardItem);

    const boardName = typeof boardItem === "object"
      ? boardItem.name
      : String(boardItem);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "boardBtn" + (boardId === String(state.boardId) ? " active" : "");
    btn.dataset.boardId = boardId;

    const count = typeof boardItem === "object"
      ? (boardItem.memoCount ?? 0)
      : 0;

    btn.innerHTML = `
      <span class="boardHash">#${escapeHTML(boardName)}</span>
      <span class="boardCount">${count}</span>
    `;

    btn.addEventListener("click", async () => {
      await setBoard(boardId);
    });

    el.boardList.appendChild(btn);
  });
}


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
    const size = getNoteSize(m.content);
    const canDelete = (String(m.authorId) === String(state.me));

    const card = document.createElement("div");
    card.className = `note ${m.color} ${size}` + (canDelete ? " canDelete" : "");
    card.dataset.id = m.id;

    const head = document.createElement("div");
    head.className = "noteHead";

    const author = document.createElement("span");
    author.className = "noteAuthor";
    author.textContent = String(m.authorId ?? m.author ?? "");
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

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span class="time">${formatDate(m.createdAt)}</span>`;

    if (m.attachments && m.attachments.length > 0) {
          const imgWrap = document.createElement("div");
          imgWrap.className = "noteImages";

          const img = document.createElement("img");
          img.src = m.attachments[0].url;      // 첫 장만
          img.alt = "첨부 이미지";

          const badge = document.createElement("span");
          badge.className = "noteImgCount";
          badge.textContent = `1/${m.attachments.length}`;

          imgWrap.appendChild(img);
          imgWrap.appendChild(badge);
          card.appendChild(imgWrap);
        }

    card.appendChild(head);
    card.appendChild(body);
    card.appendChild(meta);

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

function openSidePanel(title, bodyHtml){
  overlayMode = "sidepanel";
  if(el.modalRoot) el.modalRoot.innerHTML = "";

  if(el.panelTitle) el.panelTitle.textContent = title;
  if(el.panelBody) el.panelBody.innerHTML = bodyHtml;

  el.sidePanel?.classList.remove("hidden");
  openOverlay();
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
        <textarea id="newText" class="dialogText" placeholder="메모를 입력..."></textarea>
        <div class="attachPreview" id="attachPreview"></div>
        <div class="attachHint" id="attachHint">이미지 붙여넣기(Ctrl+V) 가능. 지금은 임시 프리뷰만 뜸.</div>

        <div class="dialogMeta">
          <span> </span>

          <div class="color-pick" id="newColors" aria-label="색상 선택">
            <div class="swatch white selected" data-color="cream" title="화이트"></div>
            <div class="swatch blue" data-color="blue" title="블루"></div>
            <div class="swatch green" data-color="sagesage" title="그린"></div>
            <div class="swatch coral" data-color="coral" title="오렌지"></div>
            <div class="swatch purple" data-color="lavender" title="퍼플"></div>
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
  const draftAttachments = createDraftAttachments();

  overlayCleanup = () => {
    draftAttachments.forEach(a => URL.revokeObjectURL(a.objectUrl));
  };

    // ✅ 추가: 파일 선택 첨부
    for(const file of initialFiles){
      if(!file?.type?.startsWith("image/")) continue;
      if(draftAttachments.length >= MAX_ATTACH) break;

      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      const objectUrl = URL.createObjectURL(file);
      draftAttachments.push({ id, file, objectUrl });
    }

  // ✅ picked는 먼저 선언 (저장 로직보다 위)
  let picked = "cream";

function rerenderAtt(){
  renderAttachments(attachPreview, draftAttachments, rerenderAtt);
  syncAttachHint(attachHint, draftAttachments);
}
rerenderAtt();

  newText.addEventListener("paste", (e) => {
    handlePasteImage(e, draftAttachments, rerenderAtt);
  });

  closeBtn?.addEventListener("click", closeOverlay);

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

  if (draftAttachments.length > 0) {
    alert("이미지 업로드는 아직 백엔드 연결 안 됨.");
    return;
  }

  try {
    await createMemoRequest(text, state.boardId, 1, picked ?? state.quickColor);
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
function closeSpaceMenu(){
  el.spaceMenu?.classList.add("hidden");
  el.spacePill?.classList.remove("open");
  el.spaceBtn?.setAttribute("aria-expanded", "false");
}

function renderSpaceMenu(){
  if(!el.spaceMenu || !el.spaceSelect) return;

  const items = Array.from(el.spaceSelect.options).map(opt => {
    const active = opt.value === state.spaceId ? "is-active" : "";
    return `
      <button class="dropItem ${active}" type="button" role="option" data-value="${opt.value}">
        ${escapeHTML(opt.textContent)}
      </button>
    `;
  }).join("");

  el.spaceMenu.innerHTML = `
    <div class="dropMenuList">
      ${items}
    </div>

    <div class="dropMenuFooter">
      <button class="dropAddBtn" type="button" data-act="open-space-entry">
        + 스페이스 추가
      </button>
    </div>
  `;
}

function onSpaceMenuOpen(e) {
  e.stopPropagation();

  if (!hasAnySpace()) {
    closeSpaceMenu();
    openSpaceOnboardingModal();
    return;
  }

  if (!el.spaceMenu) return;

  const willOpen = el.spaceMenu.classList.contains("hidden");

  if (!willOpen) {
    closeSpaceMenu();
    return;
  }

  renderSpaceMenu();
  el.spaceMenu.classList.remove("hidden");
  el.spacePill?.classList.add("open");
  el.spaceBtn?.setAttribute("aria-expanded", "true");
}

function onSpaceMenuClick(e){
  const addBtn = e.target.closest('[data-act="open-space-entry"]');
  if (addBtn) {
    closeSpaceMenu();
    openSpaceOnboardingModal();
    return;
  }

  const btn = e.target.closest(".dropItem");
  if(!btn || !el.spaceSelect) return;

  const value = btn.dataset.value;
  if(!value) return;

  el.spaceSelect.value = value;
  onSpaceChange();
  closeSpaceMenu();
}

async function onSpaceChange() {
  const next = el.spaceSelect?.value;
  if (!next) return;

  await setSpace(next);
  syncSpaceLabel();
  renderSpaceMenu();
}

function onDocumentPointerDown(e){
  // plus menu 닫기
  if (plusMenuEl) {
    const isInsidePlusMenu = plusMenuEl.contains(e.target);
    const isPlusBtn =
      e.target.closest("#composerPlus") ||
      e.target.closest("#composerPlusDock");

    if (!isInsidePlusMenu && !isPlusBtn) {
      closePlusMenu();
    }
  }

  // space menu 닫기
  const isInsideSpace =
    el.spacePill?.contains(e.target) ||
    el.spaceMenu?.contains(e.target);

  if (!isInsideSpace) {
    closeSpaceMenu();
  }

  // member panel 바깥 클릭 닫기
  const isMemberToggle = e.target.closest("#membersToggleBtn");
  const isInsideMemberPanel = el.memberPanel?.contains(e.target);

  if (!isMemberToggle && !isInsideMemberPanel) {
    closeMemberPanel();
  }

  // space context menu 바깥 클릭 닫기
  const isInsideSpaceContextMenu = el.spaceContextMenu?.contains(e.target);
  const isSpaceContextTrigger =
    e.target.closest(".dropItem") ||
    e.target.closest("#spaceBtn");

  if (!isInsideSpaceContextMenu && !isSpaceContextTrigger) {
    closeSpaceContextMenu();
  }

  const isInsideBoardContextMenu = el.boardContextMenu?.contains(e.target);
  const isBoardContextTrigger = e.target.closest(".boardBtn");

  if (!isInsideBoardContextMenu && !isBoardContextTrigger) {
    closeBoardContextMenu();
  }
}

function renderMemberPanel(){
  const ch = getCurrentSpace();
  const list = ch?.members ?? [];

  const html = list.length
    ? list.map(n => `
        <div class="memberItem">
          <span class="memberName">${escapeHTML(n)}</span>
        </div>
      `).join("")
    : `<div style="padding:12px 16px; font-size:12px; color:var(--muted); font-weight:800;">멤버 없음</div>`;

  if(el.memberPanelBody) {el.memberPanelBody.innerHTML = `<div class="memberList">${html}</div>`;}

  if(el.memberTitle) {el.memberTitle.textContent = `멤버 (${list.length})`;}

}

function openMemberPanel(){
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
    const dialog = el.modalRoot?.querySelector(".dialog");
    if(dialog && !dialog.contains(e.target)) closeOverlay();
  }

  if(overlayMode === "sidepanel"){
    if(el.sidePanel && !el.sidePanel.contains(e.target)) closeSidePanel();
  }
}

function onGlobalKeydown(e){
  if(e.key !== "Escape") return;

  closePlusMenu();
  closeSpaceMenu();
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

  if (!hasSpaces()) {
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
    const newSpace = await createSpace(name, 1, "");

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




function closePlusMenu(){
  plusMenuEl?.remove();
  plusMenuEl = null;
}

function openPlusMenu(anchorBtn, fileInput){
  closePlusMenu();

  const r = anchorBtn.getBoundingClientRect();
  const menu = document.createElement("div");
  menu.className = "plusMenu";
  menu.innerHTML = `
    <button type="button" data-act="attach">사진 첨부</button>
    <button type="button" data-act="expand">확대 모달로 작성하기</button>
  `;

  // 화면에 붙이고 위치 잡기
  document.body.appendChild(menu);

  menu.style.left = `${Math.max(12, r.left)}px`;
  menu.style.top  = `${r.top - menu.offsetHeight - 10}px`; // 위로 뜨게
  // 아래로 뜨게 하고 싶으면: r.bottom + 10

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if(!btn) return;

    const act = btn.dataset.act;
    closePlusMenu();

    if(act === "attach"){
      fileInput?.click();
      return;
    }
    if(act === "expand"){
      openNewMemoModal(); // 기존 모달 재사용 :contentReference[oaicite:6]{index=6}
      return;
    }
  });

  plusMenuEl = menu;
}

function onComposerFiles(fileInput){
  const files = Array.from(fileInput.files || []);
  fileInput.value = ""; // 같은 파일 다시 선택 가능하게 초기화
  openNewMemoModal(files);
}

let plusMenuEl = null;
let contextSpaceId = null;

function openSpaceContextMenu(x, y, spaceId) {
  if (!el.spaceContextMenu) return;

  console.log("context open", { x, y, spaceId, menu: el.spaceContextMenu });

  contextSpaceId = String(spaceId);
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

    console.log("context positioned", menu.style.left, menu.style.top, rect);
  });
}

function closeSpaceContextMenu() {
  contextSpaceId = null;
  el.spaceContextMenu?.classList.add("hidden");
}

function getSpaceById(spaceId) {
  return state.data.spaces.find(space => String(space.id) === String(spaceId)) ?? null;
}

function openSpaceSettings(spaceId) {
  const space = getSpaceById(spaceId);
  if (!space) return;

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

          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="spaceSettingsDesc" style="font-size:12px; font-weight:900; color:var(--muted);">
              설명
            </label>
            <textarea
              id="spaceSettingsDesc"
              rows="4"
              style="border:1px solid var(--line); border-radius:12px; padding:12px; font-size:14px; font-weight:700; outline:none; background:#fff; resize:vertical;"
              placeholder="스페이스 설명을 입력해"
            >${escapeHTML(space.description ?? "")}</textarea>
          </div>
        </div>

        <div style="margin-top:18px; padding-top:14px; border-top:1px solid rgba(17,24,39,.08);">
          <div style="font-size:12px; font-weight:900; color:#b42318; margin-bottom:8px;">
            위험 구역
          </div>
          <button
            class="btn danger"
            type="button"
            id="spaceDeleteBtn"
            style="width:100%; justify-content:center; border:1px solid rgba(180,35,24,.18); color:#b42318; background:#fff5f5;"
          >
            스페이스 삭제
          </button>
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
  const nameInput = qs("#spaceSettingsName", dialog);
  const descInput = qs("#spaceSettingsDesc", dialog);

  closeBtn?.addEventListener("click", closeOverlay);
  cancelBtn?.addEventListener("click", closeOverlay);

  saveBtn?.addEventListener("click", async () => {
    const next = ta.value.trim();
    if (!next) return;

    try {
      const updatedMemo = await updateMemoRequest(id, next, picked);

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
          updatedAt: updatedMemo.updatedAt ?? new Date().toISOString(),
          attachments: []
        };
      }

      renderAll();
      openViewModal(id);
    } catch (err) {
      console.error(err);
      alert("메모 수정에 실패했어.");
    }
  });

  deleteBtn?.addEventListener("click", () => {
    openDeleteSpaceConfirm(spaceId);
  });

  nameInput?.focus();
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
  const res = await fetch(`http://localhost:8080/spaces/${spaceId}`, {
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

    if (el.spaceSelect) {
      const option = Array.from(el.spaceSelect.options).find(
        opt => String(opt.value) === String(spaceId)
      );
      option?.remove();
    }

    if (String(state.spaceId) === String(spaceId)) {
      if (state.data.spaces.length > 0) {
        await setSpace(state.data.spaces[0].id);

        if (el.spaceSelect) {
          el.spaceSelect.value = String(state.spaceId);
        }
      } else {
        state.spaceId = null;
        state.boardId = null;

        if (el.spaceSelect) {
          el.spaceSelect.value = "";
        }
      }
    }

    syncSpaceLabel();
    syncSpaceOnboardingModal();
    renderSpaceMenu();
    renderAll();
    closeOverlay();
  } catch (err) {
    console.error(err);
    alert("스페이스 삭제에 실패했어.");
  }
}

async function updateSpace(spaceId, name, description) {
  const res = await fetch(`http://localhost:8080/spaces/${spaceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ name, description })
  });

  if (!res.ok) {
    throw new Error("스페이스 수정 실패");
  }

  return await res.json();
}

function leaveSpace(spaceId) {
  const space = getSpaceById(spaceId);
  if (!space) return;

  closeSpaceContextMenu();

  const ok = confirm(`"${space.name}" 스페이스에서 나갈까?`);
  if (!ok) return;

  alert(`여기에 "${space.name}" 나가기 API 연결하면 된다.`);
}

async function fetchAndApplySpaces() {
  try {
    const response = await fetch("http://localhost:8080/spaces", {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Space 목록 불러오기 실패");
    }

    const spaces = await response.json();
    state.data.spaces = Array.isArray(spaces) ? spaces : [];

    if (!el.spaceSelect) return;

    el.spaceSelect.innerHTML = "";

    if (state.data.spaces.length === 0) {
      state.spaceId = "";
      if (el.spaceLabel) el.spaceLabel.textContent = "여기눌러 추가";
      renderSpaceMenu();
      return;
    }

    state.data.spaces.forEach((space) => {
      const option = document.createElement("option");
      option.value = String(space.id);
      option.textContent = space.name;
      el.spaceSelect.appendChild(option);
    });

    const hasCurrent = state.data.spaces.some(
      (space) => String(space.id) === String(state.spaceId)
    );

    state.spaceId = hasCurrent
      ? String(state.spaceId)
      : String(state.data.spaces[0].id);

    el.spaceSelect.value = state.spaceId;

    const currentSpace = getSpaceById(state.spaceId);
    if (el.spaceLabel) {
      el.spaceLabel.textContent = currentSpace?.name ?? "보드 없음";
    }

    renderSpaceMenu();
  } catch (error) {
    console.error("Space 로딩 에러:", error);
  }
}

// =========================
// 보드
// =========================

async function createBoard(spaceId, name, description = "") {
  const res = await fetch(`http://localhost:8080/boards`, {
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
    console.log("서버가 준 새 보드:", newBoard);
    if (!Array.isArray(currentSpace.boards)) {
      currentSpace.boards = [];
    }

    currentSpace.boards.push(newBoard);
    state.boardId = String(newBoard.id);

    renderAll();
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
  const res = await fetch(`http://localhost:8080/boards/${boardId}`, {
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

function syncBoardAddButton() {
  if (!el.addBoardBtn) return;

  const hasSpace = !!state.spaceId && !!getCurrentSpace();
  el.addBoardBtn.classList.toggle("hidden", !hasSpace);
}

async function fetchBoardsBySpace(spaceId) {
  const res = await fetch(`http://localhost:8080/boards/space/${spaceId}`, {
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
  const res = await fetch(`http://localhost:8080/memos/board/${boardId}`, {
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("메모 목록 조회 실패");
  }

  return await res.json();
}

async function createMemoRequest(content, boardId, authorId, color) {
  const params = new URLSearchParams({
    content,
    boardId: String(boardId),
    authorId: String(authorId),
    color
  });

  const res = await fetch(`http://localhost:8080/memos?${params.toString()}`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("메모 생성 실패 응답:", text);
    throw new Error("메모 생성 실패");
  }

  return await res.json();
}

async function updateMemoRequest(memoId, content, color) {
  const params = new URLSearchParams({
    content,
    color
  });

  const res = await fetch(`http://localhost:8080/memos/${memoId}?${params.toString()}`, {
    method: "PUT",
    credentials: "include"
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("메모 수정 실패 응답:", text);
    throw new Error("메모 수정 실패");
  }

  return await res.json();
}

async function deleteMemoRequest(memoId) {
  const res = await fetch(`http://localhost:8080/memos/${memoId}`, {
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
  state.data.memos = Array.isArray(memos)
    ? memos.map(m => ({
        id: String(m.id),
        boardId: String(m.boardId),
        authorId: String(m.authorId),
        author: String(m.authorId),
        content: m.content ?? "",
        color: m.color ?? "cream",
        createdAt: m.createdAt ?? new Date().toISOString(),
        updatedAt: m.updatedAt ?? null,
        attachments: []
      }))
    : [];
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
  } catch (err) {
    console.error("현재 보드 메모 다시 불러오기 실패:", err);
    state.data.memos = [];
  }

  renderAll();
}

// =========================
// renderAll
// =========================
function renderAll() {
  syncBoardAddButton();

  if (!hasAnySpace()) {
    showOnboarding(true);
    return;
  }

  showOnboarding(false);

  const currentSpace = getCurrentSpace();

  if (!state.spaceId || !currentSpace) {
    if (el.boardList) el.boardList.innerHTML = "";
    if (el.board) el.board.innerHTML = "";
    if (el.boardName) el.boardName.textContent = "보드 없음";
    return;
  }

  syncSpaceLabel();
  renderBoards();
  renderBoard();
  applyBoardCols();

  const space = getCurrentSpace();
  if (el.memberCount) {
    el.memberCount.textContent = String((space?.members ?? []).length);
  }
}


// =========================
// init
// =========================
function init() {
  if (el.boardWrap) ro.observe(el.boardWrap);

  bindEvents();
  bindColorPicker(el.quickColors);
  bindColorPicker(el.quickColorsDock);

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