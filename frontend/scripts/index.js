const pollListEl = document.getElementById("pollList");
const statusEl = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");

function normalizePoll(poll) {
  const id = poll.id || poll._id;
  const question = poll.question || "Untitled poll";
  const options = Array.isArray(poll.options) ? poll.options : [];
  return { id, question, options };
}

function renderPolls(polls) {
  pollListEl.innerHTML = "";

  if (!polls.length) {
    pollListEl.innerHTML = '<p class="muted">No polls yet.</p>';
    return;
  }

  polls.forEach((rawPoll) => {
    const poll = normalizePoll(rawPoll);
    const card = document.createElement("article");
    card.className = "card";

    const link = document.createElement("a");
    link.href = `./poll.html?id=${encodeURIComponent(poll.id)}`;
    link.textContent = poll.question;

    const count = document.createElement("p");
    count.className = "muted";
    count.textContent = `${poll.options.length} option${poll.options.length === 1 ? "" : "s"}`;

    card.append(link, count);
    pollListEl.appendChild(card);
  });
}

async function loadPolls() {
  try {
    refreshBtn.disabled = true;
    setStatus(statusEl, "Loading polls...", "muted");
    const polls = await request("/polls");
    renderPolls(Array.isArray(polls) ? polls : []);
    setStatus(statusEl, "", "");
  } catch (error) {
    setStatus(statusEl, error.message, "error");
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener("click", loadPolls);
loadPolls();
