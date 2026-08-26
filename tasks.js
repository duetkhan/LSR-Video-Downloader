let supabaseClient = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof supabase === "undefined") {
      showUserStatus("Supabase library failed to load.");
      return;
    }

    supabaseClient = supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    await checkUser();
  } catch (error) {
    console.error(error);
    showUserStatus("Unable to connect to the task system.");
  }
});


/* =========================
   AUTH
   ========================= */

async function checkUser() {
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error) {
    console.error(error);
  }

  if (!user) {
    currentUser = null;

    showUserStatus(
      `You are not logged in. <a href="index.html">Go to Home</a>`
    );

    document.getElementById("taskList").innerHTML =
      `<div class="status">Please login first to access Micro Tasks.</div>`;

    document.getElementById("submissionList").innerHTML =
      `<div class="status">Login required.</div>`;

    return;
  }

  currentUser = user;

  showUserStatus(
    `Logged in as: ${escapeHtml(user.email || "User")}`
  );

  await loadWallet();
  await loadTasks();
  await loadSubmissions();
  await loadWithdrawals();
}


/* =========================
   WALLET
   ========================= */

async function loadWallet() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("wallets")
    .select("balance, pending_balance, total_earned, total_withdrawn")
    .eq("user_id", currentUser.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const balance = Number(data.balance || 0);

  document.getElementById("balance").textContent = balance;
  document.getElementById("withdrawBalance").textContent = balance;
}


/* =========================
   TASKS
   ========================= */

async function loadTasks() {
  const taskList = document.getElementById("taskList");

  taskList.innerHTML =
    `<div class="status">Loading tasks...</div>`;

  const { data, error } = await supabaseClient
    .from("tasks")
    .select(`
      id,
      title,
      description,
      instructions,
      reward,
      task_url,
      proof_type,
      max_completions,
      current_completions,
      status
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    taskList.innerHTML =
      `<div class="status">Unable to load tasks.</div>`;

    return;
  }

  if (!data || data.length === 0) {
    taskList.innerHTML =
      `<div class="status">No tasks available right now.</div>`;

    return;
  }

  taskList.innerHTML = data.map(task => {

    const remaining =
      task.max_completions === null
        ? "Unlimited"
        : Math.max(
            0,
            Number(task.max_completions) -
            Number(task.current_completions || 0)
          );

    return `
      <div class="task-card">

        <h3>${escapeHtml(task.title)}</h3>

        <p>
          ${escapeHtml(task.description || "")}
        </p>

        <p>
          🎁 Reward:
          <span class="reward">
            ${Number(task.reward)} Coins
          </span>
        </p>

        <p>
          👥 Remaining:
          ${remaining}
        </p>

        <button onclick="openTask(${Number(task.id)})">
          ▶ Start Task
        </button>

        <div id="task-${Number(task.id)}" class="hidden">

          ${
            task.task_url
              ? `
                <p>
                  <a
                    href="${safeUrl(task.task_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 Open Task
                  </a>
                </p>
              `
              : ""
          }

          <p>
            <strong>Instructions:</strong>
          </p>

          <p>
            ${escapeHtml(task.instructions || "Complete the task and submit proof.")}
          </p>

          <textarea
            id="proof-${Number(task.id)}"
            rows="4"
            placeholder="Enter your proof here..."
          ></textarea>

          <button onclick="submitTask(${Number(task.id)})">
            ✅ Submit Task
          </button>

          <div id="result-${Number(task.id)}"></div>

        </div>

      </div>
    `;
  }).join("");
}


/* =========================
   OPEN TASK
   ========================= */

function openTask(taskId) {
  const box = document.getElementById(`task-${taskId}`);

  if (!box) return;

  box.classList.toggle("hidden");
}


/* =========================
   SUBMIT TASK
   ========================= */

async function submitTask(taskId) {
  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  const proofElement =
    document.getElementById(`proof-${taskId}`);

  const resultElement =
    document.getElementById(`result-${taskId}`);

  const proof =
    proofElement ? proofElement.value.trim() : "";

  if (!proof) {
    resultElement.innerHTML =
      `<div class="status">Please enter your proof.</div>`;

    return;
  }

  resultElement.innerHTML =
    `<div class="status">Submitting...</div>`;

  const { data, error } = await supabaseClient.rpc(
    "submit_task",
    {
      p_task_id: taskId,
      p_proof: proof
    }
  );

  if (error) {
    console.error(error);

    resultElement.innerHTML =
      `<div class="status">${escapeHtml(error.message)}</div>`;

    return;
  }

  resultElement.innerHTML =
    `<div class="status">
      ✅ Submitted successfully. Your task is now pending review.
    </div>`;

  proofElement.value = "";

  await loadSubmissions();
}


/* =========================
   SUBMISSIONS
   ========================= */

async function loadSubmissions() {
  if (!currentUser) return;

  const submissionList =
    document.getElementById("submissionList");

  const { data, error } = await supabaseClient
    .from("task_submissions")
    .select(`
      id,
      task_id,
      reward,
      status,
      submitted_at,
      reviewed_at,
      review_note,
      tasks (
        title
      )
    `)
    .eq("user_id", currentUser.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error(error);

    submissionList.innerHTML =
      `<div class="status">Unable to load task history.</div>`;

    return;
  }

  if (!data || data.length === 0) {
    submissionList.innerHTML =
      `<div class="status">No task submissions yet.</div>`;

    return;
  }

  submissionList.innerHTML = data.map(item => {

    const title =
      item.tasks?.title || "Task";

    return `
      <div class="status">

        <strong>
          ${escapeHtml(title)}
        </strong>

        <br>

        Reward:
        <span class="coin">
          ${Number(item.reward)} Coins
        </span>

        <br>

        Status:
        <strong>
          ${escapeHtml(item.status)}
        </strong>

        <br>

        Submitted:
        ${formatDate(item.submitted_at)}

        ${
          item.review_note
            ? `<br>Note: ${escapeHtml(item.review_note)}`
            : ""
        }

      </div>
    `;
  }).join("");
}


/* =========================
   WITHDRAWAL
   ========================= */

async function requestWithdrawal() {
  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  const method =
    document.getElementById("withdrawMethod").value;

  const accountDetails =
    document.getElementById("accountDetails").value.trim();

  const amount =
    Number(document.getElementById("withdrawAmount").value);

  const message =
    document.getElementById("withdrawMessage");

  if (!method) {
    message.innerHTML =
      `<div class="status">Select a payment method.</div>`;
    return;
  }

  if (!accountDetails) {
    message.innerHTML =
      `<div class="status">Enter your payment account.</div>`;
    return;
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    message.innerHTML =
      `<div class="status">Enter a valid withdrawal amount.</div>`;
    return;
  }

  message.innerHTML =
    `<div class="status">Processing withdrawal...</div>`;

  const { data, error } = await supabaseClient.rpc(
    "request_withdrawal",
    {
      p_amount: amount,
      p_method: method,
      p_account_details: accountDetails
    }
  );

  if (error) {
    console.error(error);

    message.innerHTML =
      `<div class="status">${escapeHtml(error.message)}</div>`;

    return;
  }

  message.innerHTML =
    `<div class="status">
      ✅ Withdrawal request submitted successfully.
    </div>`;

  document.getElementById("withdrawAmount").value = "";
  document.getElementById("accountDetails").value = "";

  await loadWallet();
  await loadWithdrawals();
}


/* =========================
   WITHDRAWAL HISTORY
   ========================= */

async function loadWithdrawals() {
  if (!currentUser) return;

  const list =
    document.getElementById("withdrawalList");

  const { data, error } = await supabaseClient
    .from("withdrawals")
    .select(`
      id,
      amount,
      method,
      status,
      requested_at,
      processed_at,
      admin_note
    `)
    .eq("user_id", currentUser.id)
    .order("requested_at", { ascending: false });

  if (error) {
    console.error(error);

    list.innerHTML =
      `<div class="status">Unable to load withdrawals.</div>`;

    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML =
      `<div class="status">No withdrawal requests yet.</div>`;

    return;
  }

  list.innerHTML = data.map(item => {

    return `
      <div class="status">

        💸 ${Number(item.amount)} Coins

        <br>

        Method:
        ${escapeHtml(item.method)}

        <br>

        Status:
        <strong>
          ${escapeHtml(item.status)}
        </strong>

        <br>

        Requested:
        ${formatDate(item.requested_at)}

        ${
          item.admin_note
            ? `<br>Admin note: ${escapeHtml(item.admin_note)}`
            : ""
        }

      </div>
    `;
  }).join("");
}


/* =========================
   HELPERS
   ========================= */

function showUserStatus(message) {
  const element =
    document.getElementById("userStatus");

  if (element) {
    element.innerHTML = message;
  }
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function safeUrl(value) {
  try {
    const url = new URL(value);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {
      return url.href;
    }

    return "#";
  } catch {
    return "#";
  }
}


function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString();
}
