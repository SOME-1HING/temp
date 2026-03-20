const createForm = document.getElementById("createPollForm");
const statusEl = document.getElementById("status");

function parseOptions(rawText) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = new FormData(createForm);
  const question = String(form.get("question") || "").trim();
  const options = parseOptions(String(form.get("options") || ""));

  if (!question) {
    setStatus(statusEl, "Question is required.", "error");
    return;
  }

  if (options.length < 2) {
    setStatus(statusEl, "Please add at least 2 options.", "error");
    return;
  }

  try {
    setStatus(statusEl, "Creating poll...", "muted");

    const poll = await request("/polls", {
      method: "POST",
      body: JSON.stringify({ question, options }),
    });

    const id = poll?.id || poll?._id;
    setStatus(statusEl, "Poll created.", "success");

    if (id) {
      window.location.href = `./poll.html?id=${encodeURIComponent(id)}`;
      return;
    }

    window.location.href = "./index.html";
  } catch (error) {
    setStatus(statusEl, error.message, "error");
  }
});
