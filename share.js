const statusEl = document.querySelector("#status");
const reportEl = document.querySelector("#report");
const copyButton = document.querySelector("#copyButton");

async function loadSharedReport() {
  const id = window.location.pathname.split("/").filter(Boolean).pop();
  if (!id) {
    setStatus("error", "报告链接无效。");
    return;
  }

  try {
    const response = await fetch(`/api/report/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "报告不存在");
    reportEl.textContent = data.report.markdown || "该报告没有 Markdown 内容。";
    document.title = "合规检测报告";
    setStatus("success", `报告生成时间：${new Date(data.report.generatedAt).toLocaleString("zh-CN")}`);
  } catch (error) {
    setStatus("error", error.message || "报告加载失败。");
  }
}

function setStatus(type, text) {
  statusEl.className = `audit-status ${type}`;
  statusEl.textContent = text;
}

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(reportEl.textContent || "");
  copyButton.textContent = "已复制";
  window.setTimeout(() => {
    copyButton.textContent = "复制 Markdown";
  }, 1600);
});

loadSharedReport();
