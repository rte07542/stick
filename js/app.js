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
  newSpaceNameInput: qs("#newSpaceNameInput"),
  createSpaceBtn: qs("#createSpaceBtn"),

  membersToggleBtn: qs("#membersToggleBtn"),
  memberPanel: qs("#memberPanel"),
  memberPanelBody: qs("#memberPanelBody"),
  memberClose: qs("#memberClose"),
  memberTitle: qs("#memberTitle"),
  meBtn: qs("#meBtn"),
};

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
  me: "aaa",
  spaceId: "gameA",
  boardId: "build",
  search: "",
  quickColor: "cream",
  data: {
    spaces: {
      gameA: { name: "게임A", boards: ["build", "boss", "item", "bug"], members: ["aaa", "bbb", "ccc", "ddd", "eee", "fff", "ggg"] },
      gameB: { name: "게임B", boards: ["tips", "meta", "craft"], members: ["aaa", "bbb", "ccc"] }
    },
    boards: {
      build: { name: "빌드" },
      boss: { name: "보스공략" },
      item: { name: "아이템" },
      bug:  { name: "버그" },
      tips: { name: "팁" },
      meta: { name: "메타" },
      craft:{ name: "제작" }
    },
    memos: [
      makeMemo("build", "eee", "보조무기: 단검이 편함. 이동기 좋아.", "cream", "2026-01-02T10:00:00Z"),
      makeMemo("build", "ccc", "장비 파밍 루트:\n마을→동굴→성채", "blue", "2026-01-04T10:00:00Z"),
      makeMemo("build", "aaa", "패치 후에 치명타 계수 바뀐 듯.\n체감상 약해짐.", "sage", "2026-01-04T12:00:00Z"),
      makeMemo("build", "bbb", "딜 욕심내면 죽음.\n방어 우선.", "coral", "2026-01-05T10:00:00Z"),
      makeMemo("build", "aaa", "초반엔 이 빌드가 제일 편함.\n스킬은 3-2-1 순서가 안정적.", "cream", "2026-01-06T10:00:00Z"),
    ]
  }
};

function updateBoardStatus(data) {
  // data = { memoCount: 51, memberCount: 9, lastModified: "01/06 00:00:00" }
  if (qs("#memoCount")) qs("#memoCount").textContent = data.memoCount;
  if (qs("#memberCount")) qs("#memberCount").textContent = data.memberCount;
  if (qs("#lastModified")) qs("#lastModified").textContent = data.lastModified;
}

function makeMemo(boardId, author, content, color, createdAt, attachments = []){
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    boardId,
    author,
    content,
    color,
    createdAt,
    updatedAt: null,
    attachments
  };
}

function autoGrowTextarea(ta){
  if(!ta) return;

  const max = 140; // CSS max-height랑 맞추기
  ta.style.height = "auto"; // ✅ 이게 복귀의 핵심

  // scrollHeight는 내용 없을 때도 padding 포함해서 나옴
  const next = Math.min(ta.scrollHeight, max);
  ta.style.height = next + "px";
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
// Memo View / Edit Modal
// =========================
function openViewModal(id){
  const m = state.data.memos.find(x => x.id === id);
  if(!m) return;

  const canEdit = (m.author === state.me);
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
  qs("#viewAuthor", dialog).textContent = canEdit ? `${m.author} (나)` : m.author;
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
  if(m.author !== state.me) return; // 남 글 수정 금지

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

function updateMemo(id, patch){
  const idx = state.data.memos.findIndex(x => x.id === id);
  if(idx < 0) return;

  state.data.memos[idx] = {
    ...state.data.memos[idx],
    ...patch,
  };
}

// =========================
// derived data
// =========================
function getMySpaceIds(){
  return Object.keys(state.data.spaces || {});
}
function hasAnySpace(){
  return getMySpaceIds().length > 0;
}
function getCurrentSpace(){
  return state.data.spaces[state.spaceId];
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
function setSpace(spaceId){
  state.spaceId = spaceId;

  const ch = state.data.spaces[spaceId];
  const boards = ch?.boards ?? [];
  state.boardId = boards[0] ?? "";

  state.search = "";
  if(el.searchInput) el.searchInput.value = "";
  syncSearchClear();
}

function setBoard(boardId){
  state.boardId = boardId;
  state.search = "";
  if(el.searchInput) el.searchInput.value = "";
  syncSearchClear();
}

function deleteMemo(id){
  state.data.memos = state.data.memos.filter(m => m.id !== id);
  renderAll();
}

function submitQuick(textarea){
  const text = textarea.value.trim();
  if(!text) return;

  state.data.memos.push(makeMemo(state.boardId, state.me, text, state.quickColor, new Date().toISOString()));
  textarea.value = "";
  autoGrowTextarea(textarea); // ✅ 비우면 높이도 원복
  renderAll();
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
    el.boardName.textContent = show ? "#채널 없음" : el.boardName.textContent;
  }
}

// =========================
// render
// =========================
function syncSpaceLabel(){
  const ch = getCurrentSpace();
  if(!el.spaceLabel) return;
  el.spaceLabel.textContent = ch?.name ?? el.spaceSelect?.selectedOptions?.[0]?.textContent ?? state.spaceId;
}

function renderBoards(){
  if(!el.boardList) return;

  el.boardList.innerHTML = "";
  const ch = getCurrentSpace();
  const boardIds = ch?.boards ?? [];

  boardIds.forEach(rid => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "boardBtn" + (rid === state.boardId ? " active" : "");

    const name = state.data.boards[rid]?.name ?? rid;
    const count = state.data.memos.filter(m => m.boardId === rid).length;

    btn.innerHTML = `
      <span class="boardHash">#${escapeHTML(name)}</span>
      <span class="boardCount">${count}</span>
    `;

    btn.addEventListener("click", () => {
      setBoard(rid);
      renderAll();
    });

    el.boardList.appendChild(btn);
  });
}

function updateComposerMode(isEmpty){
  if(el.emptyState) el.emptyState.hidden = !isEmpty;
  if(el.dock) el.dock.hidden = isEmpty;

  if(el.boardWrap){
    el.boardWrap.style.paddingBottom = isEmpty ? "40px" : "140px";
  }

  const rn = state.data.boards[state.boardId]?.name ?? state.boardId;
  if(el.boardName) el.boardName.textContent = `#${rn}`;
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
    const canDelete = (m.author === state.me);

    const card = document.createElement("div");
    card.className = `note ${m.color} ${size}` + (canDelete ? " canDelete" : "");
    card.dataset.id = m.id;

    const head = document.createElement("div");
    head.className = "noteHead";

    const author = document.createElement("span");
    author.className = "noteAuthor";
    author.textContent = m.author;
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

function renderAll(){
  if(!hasAnySpace()){
    showOnboarding(true);
    return;
  }
  showOnboarding(false);

  // spaceId 유효성 보정
  const mySpaces = getMySpaceIds();
  if(!state.spaceId || !state.data.spaces[state.spaceId]){
    setSpace(mySpaces[0]);
  }

  syncSpaceLabel();
  renderBoards();
  renderBoard();
  applyBoardCols();

  const ch = getCurrentSpace();
  if(el.memberCount) el.memberCount.textContent = String((ch?.members ?? []).length);
}

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

  // ✅ 저장은 딱 한 번만
  createBtn?.addEventListener("click", () => {
    const text = newText.value.trim();
    if(!text && draftAttachments.length === 0) return;

    if(draftAttachments.length > 0){
      alert("이미지 업로드는 백엔드 붙인 후에 저장 가능. 지금은 프리뷰만 됨.");
    }

    const color = picked ?? state.quickColor;
    state.data.memos.push(makeMemo(state.boardId, state.me, text, color, new Date().toISOString(), []));

    closeOverlay();   // ✅ 여기서 cleanup 자동 실행됨
    renderAll();
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

  el.spaceMenu.innerHTML = Array.from(el.spaceSelect.options).map(opt => {
    const active = opt.value === state.spaceId ? "is-active" : "";
    return `
      <button class="dropItem ${active}" type="button" role="option" data-value="${opt.value}">
        ${escapeHTML(opt.textContent)}
      </button>
    `;
  }).join("");
}

function onSpaceMenuOpen(e){
  e.stopPropagation();

  if(!el.spaceMenu) return;

  const willOpen = el.spaceMenu.classList.contains("hidden");

  if(!willOpen){
    closeSpaceMenu();
    return;
  }

  renderSpaceMenu();
  el.spaceMenu.classList.remove("hidden");
  el.spacePill?.classList.add("open");
  el.spaceBtn?.setAttribute("aria-expanded", "true");
}

function onSpaceMenuClick(e){
  const btn = e.target.closest(".dropItem");
  if(!btn || !el.spaceSelect) return;

  const value = btn.dataset.value;
  if(!value) return;

  el.spaceSelect.value = value;
  onSpaceChange();
  closeSpaceMenu();
}

function onSpaceChange(){
  const next = el.spaceSelect?.value;
  if(!next) return;

  setSpace(next);
  renderAll();
}

function onDocumentPointerDown(e){
  // plus menu 닫기
  if(plusMenuEl){
    const isInsidePlusMenu = plusMenuEl.contains(e.target);
    const isPlusBtn =
      e.target.closest("#composerPlus") ||
      e.target.closest("#composerPlusDock");

    if(!isInsidePlusMenu && !isPlusBtn){
      closePlusMenu();
    }
  }

  // space menu 닫기
  const isInsideSpace =
    el.spacePill?.contains(e.target) ||
    el.spaceMenu?.contains(e.target);

  if(!isInsideSpace){
    closeSpaceMenu();
  }

  // member panel 바깥 클릭 닫기
  const isMemberToggle = e.target.closest("#membersToggleBtn");
  const isInsideMemberPanel = el.memberPanel?.contains(e.target);

  if(!isMemberToggle && !isInsideMemberPanel){
    closeMemberPanel();
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

function onJoinByCode(){
  const code = el.inviteCodeInput?.value.trim();
  if(!code) return;

  const map = { "A": "gameA", "B": "gameB", "gameA": "gameA", "gameB": "gameB" };
  const cid = map[code];

  if(!cid || !state.data.spaces[cid]){
    alert("유효하지 않은 초대코드임.");
    return;
  }

  setSpace(cid);
  el.inviteCodeInput.value = "";
  renderAll();
}

function onCreateSpace(){
  const name = el.newSpaceNameInput?.value.trim();
  if(!name) return;

  const id = "ch_" + Math.random().toString(16).slice(2, 8);

  // ⚠️ 데모: board id 충돌 위험 있음. 백엔드 붙일 땐 채널별 board id로 바꿔라.
  const generalId = "general";

  state.data.spaces[id] = {
    name,
    boards: [generalId],
    members: [state.me]
  };

  state.data.boards[generalId] = { name: "일반" };

  setSpace(id);
  setBoard(generalId);

  el.newSpaceNameInput.value = "";
  renderAll();
}

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

  el.joinByCodeBtn?.addEventListener("click", onJoinByCode);
  el.createSpaceBtn?.addEventListener("click", onCreateSpace);

  el.meBtn?.addEventListener("click", () => location.href = "./index.html");

  el.membersToggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMemberPanel();
  });

  el.memberClose?.addEventListener("click", closeMemberPanel);

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
}

let plusMenuEl = null;

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

// =========================
// init
// =========================
function init(){
  if(el.boardWrap) ro.observe(el.boardWrap);

  bindEvents();
  bindColorPicker(el.quickColors);
  bindColorPicker(el.quickColorsDock);

  loadSidebarW();

const saved = localStorage.getItem("sidebarCollapsed");

// 저장이 1이면 접힘, 아니면 펼침(기본)
if(saved === "1"){
  el.layout?.classList.add("sidebar-collapsed");
} else {
  el.layout?.classList.remove("sidebar-collapsed");
}

  syncColorUI();
  syncSearchClear();

  autoGrowTextarea(el.quickInput);
  autoGrowTextarea(el.quickInputDock);

  if(el.spaceSelect) el.spaceSelect.value = state.spaceId;

  setSpace(state.spaceId);

  renderAll();
}

init();