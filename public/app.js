const providerGrid = document.querySelector("#providerGrid");
const providerTemplate = document.querySelector("#providerTemplate");
const generatedAtEl = document.querySelector("#generatedAt");
const providerSummaryEl = document.querySelector("#providerSummary");
const refreshButton = document.querySelector("#refreshButton");

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number(value).toFixed(2);
}

function formatGeneratedAt(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getStatusLabel(status) {
  switch (status) {
    case "ok":
      return "พร้อมใช้งาน";
    default:
      return "มีปัญหา";
  }
}

function getDeltaClass(delta) {
  if (delta > 0) {
    return "delta-up";
  }
  if (delta < 0) {
    return "delta-down";
  }
  return "delta-flat";
}

function getDeltaLabel(delta) {
  if (delta > 0) {
    return `+${formatPrice(delta)}`;
  }
  if (delta < 0) {
    return `${formatPrice(delta)}`;
  }
  return "-";
}

function renderProvider(provider) {
  const fragment = providerTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".provider-card");
  const eyebrow = fragment.querySelector(".provider-card__eyebrow");
  const title = fragment.querySelector("h3");
  const badge = fragment.querySelector(".badge");
  const note = fragment.querySelector(".provider-card__note");
  const updated = fragment.querySelector(".provider-card__updated");
  const tbody = fragment.querySelector("tbody");
  const primaryHeader = fragment.querySelector('[data-label="primary"]');
  const secondaryHeader = fragment.querySelector('[data-label="secondary"]');
  const deltaHeader = fragment.querySelector('[data-label="delta"]');

  eyebrow.textContent = provider.id.toUpperCase();
  title.textContent = provider.name;
  badge.textContent = getStatusLabel(provider.status);
  badge.classList.add(`badge--${provider.status === "ok" ? "ok" : "error"}`);
  note.textContent = provider.note || "ไม่มีหมายเหตุ";
  updated.textContent = provider.sourceUrl
    ? `ต้นทาง: ${provider.sourceUrl}${provider.updatedAt ? ` | อัปเดต: ${provider.updatedAt}` : ""}`
    : provider.updatedAt || "ยังไม่มีข้อมูลอัปเดต";
  primaryHeader.textContent = provider.fieldLabels?.primary || "ค่า 1";
  secondaryHeader.textContent = provider.fieldLabels?.secondary || "ค่า 2";
  deltaHeader.textContent = provider.fieldLabels?.delta || "ส่วนต่าง";

  if (!provider.items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "ยังไม่มีรายการราคาที่แสดงได้จากผู้ให้บริการนี้";
    card.querySelector(".price-table-wrap").replaceWith(empty);
    return fragment;
  }

  provider.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td><strong>${formatPrice(item.primaryValue)}</strong></td>
      <td><strong>${formatPrice(item.secondaryValue)}</strong></td>
      <td class="${getDeltaClass(item.delta)}">${getDeltaLabel(item.delta)}</td>
    `;
    tbody.appendChild(row);
  });

  return fragment;
}

async function loadPrices(forceRefresh = false) {
  refreshButton.disabled = true;
  refreshButton.textContent = "กำลังโหลด...";

  try {
    const response = await fetch(`/api/prices${forceRefresh ? "?refresh=1" : ""}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.details || payload.error || "Request failed");
    }

    generatedAtEl.textContent = formatGeneratedAt(payload.generatedAt);
    providerSummaryEl.textContent = `${payload.summary.availableProviders}/${payload.summary.totalProviders} พร้อมใช้งาน`;
    providerGrid.innerHTML = "";
    payload.providers.forEach((provider) => {
      providerGrid.appendChild(renderProvider(provider));
    });
  } catch (error) {
    providerGrid.innerHTML = `<div class="empty-state">โหลดข้อมูลไม่สำเร็จ: ${error.message}</div>`;
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "รีเฟรชข้อมูล";
  }
}

refreshButton.addEventListener("click", () => {
  loadPrices(true);
});

loadPrices();
