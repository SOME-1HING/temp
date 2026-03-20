const titleEl = document.getElementById("title");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const statusEl = document.getElementById("status");
const reloadBtn = document.getElementById("reloadBtn");
const deleteBtn = document.getElementById("deleteBtn");

const searchParams = new URLSearchParams(window.location.search);
const pollId = searchParams.get("id");

function normalizeOption(option) {
  if (typeof option === "string") {
    return { text: option, votes: null };
  }

  return {
    text: option?.text || option?.label || option?.option || "Option",
    votes: typeof option?.votes === "number" ? option.votes : null,
  };
}

function normalizePoll(rawPoll) {
  return {
    id: rawPoll?.id || rawPoll?._id,
    question: rawPoll?.question || "Untitled poll",
    options: (Array.isArray(rawPoll?.options) ? rawPoll.options : []).map(
      normalizeOption,
    ),
  };
}

async function vote(optionIndex) {
  try {
    setStatus(statusEl, "Submitting vote...", "muted");

    await request(`/polls/${encodeURIComponent(pollId)}/vote`, {
      method: "PUT",
      body: JSON.stringify({ optionIndex }),
    });

    setStatus(statusEl, "Vote submitted.", "success");
    await loadPoll();
  } catch (error) {
    setStatus(statusEl, error.message, "error");
  }
}

function renderPoll(rawPoll) {
  const poll = normalizePoll(rawPoll);

  titleEl.textContent = "Poll";
  questionEl.textContent = poll.question;
  optionsEl.innerHTML = "";

  poll.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.className = "option-item";

    const text = document.createElement("span");
    text.textContent = option.text;

    const right = document.createElement("div");
    right.className = "actions";

    if (option.votes !== null) {
      const votes = document.createElement("span");
      votes.className = "muted";
      votes.textContent = `${option.votes} vote${option.votes === 1 ? "" : "s"}`;
      right.appendChild(votes);
    }

    const voteBtn = document.createElement("button");
    voteBtn.type = "button";
    voteBtn.className = "btn secondary";
    voteBtn.textContent = "Vote";
    voteBtn.addEventListener("click", () => vote(index));

    right.appendChild(voteBtn);
    li.append(text, right);
    optionsEl.appendChild(li);
  });
}

async function loadPoll() {
  if (!pollId) {
    setStatus(statusEl, "Missing poll id.", "error");
    reloadBtn.disabled = true;
    deleteBtn.disabled = true;
    return;
  }

  try {
    reloadBtn.disabled = true;
    setStatus(statusEl, "Loading poll...", "muted");
    const poll = await request(`/polls/${encodeURIComponent(pollId)}`);
    renderPoll(poll);
    setStatus(statusEl, "", "");
  } catch (error) {
    setStatus(statusEl, error.message, "error");
  } finally {
    reloadBtn.disabled = false;
  }
}

reloadBtn.addEventListener("click", loadPoll);

deleteBtn.addEventListener("click", async () => {
  if (!pollId) {
    return;
  }

  const confirmed = window.confirm("Delete this poll?");
  if (!confirmed) {
    return;
  }

  try {
    deleteBtn.disabled = true;
    setStatus(statusEl, "Deleting poll...", "muted");
    await request(`/polls/${encodeURIComponent(pollId)}`, { method: "DELETE" });
    window.location.href = "./index.html";
  } catch (error) {
    setStatus(statusEl, error.message, "error");
    deleteBtn.disabled = false;
  }
});

loadPoll();
