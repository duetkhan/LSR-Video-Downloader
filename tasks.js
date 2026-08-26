let supabaseClient = null;
let currentUser = null;
let currentProfile = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof supabase === "undefined") {
      showUserStatus("Supabase library failed to load.");
      return;
    }

    supabaseClient = supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    createAccountHeader();

    await checkUser();

    /* Keep UI updated when login/logout happens */
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);

      if (session && session.user) {
        currentUser = session.user;

        await loadProfile();
        await loadWallet();
        await loadTasks();
        await loadSubmissions();
        await loadWithdrawals();

        updateAccountHeader();
      } else {
        currentUser = null;
        currentProfile = null;

        updateAccountHeader();

        await loadTasks();

        const submissionList =
          document.getElementById("submissionList");

        if (submissionList) {
          submissionList.innerHTML =
            `<div class="status">Login required to see your task history.</div>`;
        }
      }
    });

  } catch (error) {
    console.error(error);

    showUserStatus(
      "Unable to connect to the task system."
    );
  }
});


/* =========================================================
   ACCOUNT HEADER
========================================================= */

function createAccountHeader() {

  if (document.getElementById("accountHeader")) {
    return;
  }

  const header = document.createElement("div");

  header.id = "accountHeader";

  header.innerHTML = `
    <div class="account-left">

      <div class="account-avatar">
        👤
      </div>

      <div class="account-info">

        <div id="accountUsername">
          Guest
        </div>

        <div id="accountEmail">
          Not logged in
        </div>

      </div>

    </div>

    <div class="account-right">

      <div class="balance-label">
        Balance
      </div>

      <div>
        <span id="headerBalance">
          0
        </span>
        <span class="balance-coin">
          Coins
        </span>
      </div>

    </div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #accountHeader {
      width: calc(100% - 30px);
      max-width: 1100px;
      margin: 15px auto 20px;
      padding: 14px 16px;
      box-sizing: border-box;

      display: flex;
      justify-content: space-between;
      align-items: center;

      background: #1b1b1b;
      border-radius: 16px;

      box-shadow: 0 4px 15px rgba(0,0,0,.25);
    }

    .account-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .account-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #292929;
      font-size: 22px;
      flex-shrink: 0;
    }

    .account-info {
      min-width: 0;
    }

    #accountUsername {
      color: #fff;
      font-size: 16px;
      font-weight: 700;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    #accountEmail {
      margin-top: 3px;
      color: #aaa;
      font-size: 12px;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .account-right {
      text-align: right;
      flex-shrink: 0;
    }

    .balance-label {
      color: #aaa;
      font-size: 12px;
      margin-bottom: 2px;
    }

    #headerBalance {
      color: #ffd43b;
      font-size: 21px;
      font-weight: 700;
    }

    .balance-coin {
      color: #ffd43b;
      font-size: 13px;
    }

    @media(max-width:500px) {

      #accountHeader {
        width: calc(100% - 20px);
        padding: 12px;
      }

      #accountUsername {
        max-width: 140px;
      }

      #accountEmail {
        max-width: 140px;
      }

      #headerBalance {
        font-size: 18px;
      }
    }
  `;

  document.head.appendChild(style);

  /*
    Put account header near the top of the page.
  */
  const firstElement = document.body.firstElementChild;

  if (firstElement) {
    document.body.insertBefore(header, firstElement);
  } else {
    document.body.appendChild(header);
  }
}


/* =========================================================
   CHECK USER
========================================================= */

async function checkUser() {

  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
  }

  if (!session || !session.user) {

    currentUser = null;
    currentProfile = null;

    updateAccountHeader();

    showUserStatus(
      `You are not logged in.
       <a href="login.html">Login</a>
       or
       <a href="signup.html">Sign Up</a>`
    );

    /*
      IMPORTANT:
      Tasks are still loaded for guests.
    */
    await loadTasks();

    const submissionList =
      document.getElementById("submissionList");

    if (submissionList) {
      submissionList.innerHTML =
        `<div class="status">
          Login required to see your task history.
        </div>`;
    }

    return;
  }

  currentUser = session.user;

  await loadProfile();
  await loadWallet();

  updateAccountHeader();

  showUserStatus(
    `Logged in as:
     ${escapeHtml(
       currentProfile?.username ||
       currentUser.email ||
       "User"
     )}`
  );

  await loadTasks();
  await loadSubmissions();
  await loadWithdrawals();
}


/* =========================================================
   PROFILE
========================================================= */

async function loadProfile() {

  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("username, full_name")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Profile error:", error);
    currentProfile = null;
    return;
  }

  currentProfile = data || null;

  updateAccountHeader();
}


/* =========================================================
   UPDATE ACCOUNT HEADER
========================================================= */

function updateAccountHeader() {

  const usernameElement =
    document.getElementById("accountUsername");

  const emailElement =
    document.getElementById("accountEmail");

  if (!usernameElement || !emailElement) {
    return;
  }

  if (!currentUser) {

    usernameElement.textContent = "Guest";
    emailElement.textContent = "Not logged in";

    const headerBalance =
      document.getElementById("headerBalance");

    if (headerBalance) {
      headerBalance.textContent = "0";
    }

    return;
  }

  const email =
    currentUser.email || "";

  const fallbackUsername =
    email
      ? email.split("@")[0]
      : "User";

  const username =
    currentProfile?.username ||
    currentProfile?.full_name ||
    fallbackUsername;

  usernameElement.textContent = username;

  emailElement.textContent = email;

  const headerBalance =
    document.getElementById("headerBalance");

  if (headerBalance) {

    const oldBalance =
      document.getElementById("balance");

    headerBalance.textContent =
      oldBalance
        ? oldBalance.textContent
        : "0";
  }
}


/* =========================================================
   WALLET
========================================================= */

async function loadWallet() {

  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("wallets")
    .select(
      "balance, pending_balance, total_earned, total_withdrawn"
    )
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error("Wallet error:", error);
    return;
  }

  if (!data) {
    console.log("Wallet row not found.");
    return;
  }

  const balance =
    Number(data.balance || 0);

  const balanceElement =
    document.getElementById("balance");

  if (balanceElement) {
    balanceElement.textContent = balance;
  }

  const withdrawBalance =
    document.getElementById("withdrawBalance");

  if (withdrawBalance) {
    withdrawBalance.textContent = balance;
  }

  const headerBalance =
    document.getElementById("headerBalance");

  if (headerBalance) {
    headerBalance.textContent = balance;
  }
}


/* =========================================================
   TASKS
========================================================= */

async function loadTasks() {

  const taskList =
    document.getElementById("taskList");

  if (!taskList) return;

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
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error("Tasks error:", error);

    taskList.innerHTML =
      `<div class="status">
        Unable to load tasks.
      </div>`;

    return;
  }

  if (!data || data.length === 0) {

    taskList.innerHTML =
      `<div class="status">
        No tasks available right now.
      </div>`;

    return;
  }

  taskList.innerHTML =
    data.map(task => {

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

          <h3>
            ${escapeHtml(task.title)}
          </h3>

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

          <button
            type="button"
            onclick="openTask(${Number(task.id)})"
          >
            ▶ Start Task
          </button>

          <div
            id="task-${Number(task.id)}"
            class="hidden"
          >

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
              <strong>
                Instructions:
              </strong>
            </p>

            <p>
              ${escapeHtml(
                task.instructions ||
                "Complete the task and submit proof."
              )}
            </p>

            <textarea
              id="proof-${Number(task.id)}"
              rows="4"
              placeholder="Enter your proof here..."
            ></textarea>

            <button
              type="button"
              onclick="submitTask(${Number(task.id)})"
            >
              ✅ Submit Task
            </button>

            <div
              id="result-${Number(task.id)}"
            ></div>

          </div>

        </div>
      `;

    }).join("");
}


/* =========================================================
   OPEN TASK
========================================================= */

function openTask(taskId) {

  /*
    Guest can see the task,
    but cannot start it.
  */

  if (!currentUser) {

    alert(
      "Please login or create an account first."
    );

    return;
  }

  const box =
    document.getElementById(
      `task-${taskId}`
    );

  if (!box) return;

  box.classList.toggle("hidden");
}


/* =========================================================
   SUBMIT TASK
========================================================= */

async function submitTask(taskId) {

  if (!currentUser) {

    alert(
      "Please login or create an account first."
    );

    return;
  }

  const proofElement =
    document.getElementById(
      `proof-${taskId}`
    );

  const resultElement =
    document.getElementById(
      `result-${taskId}`
    );

  const proof =
    proofElement
      ? proofElement.value.trim()
      : "";

  if (!proof) {

    if (resultElement) {
      resultElement.innerHTML =
        `<div class="status">
          Please enter your proof.
        </div>`;
    }

    return;
  }

  if (resultElement) {
    resultElement.innerHTML =
      `<div class="status">
        Submitting...
      </div>`;
  }

  const {
    data,
    error
  } = await supabaseClient.rpc(
    "submit_task",
    {
      p_task_id: taskId,
      p_proof: proof
    }
  );

  if (error) {

    console.error(error);

    if (resultElement) {
      resultElement.innerHTML =
        `<div class="status">
          ${escapeHtml(error.message)}
        </div>`;
    }

    return;
  }

  if (resultElement) {
    resultElement.innerHTML =
      `<div class="status">
        ✅ Submitted successfully.
        Your task is now pending review.
      </div>`;
  }

  if (proofElement) {
    proofElement.value = "";
  }

  await loadSubmissions();
}


/* =========================================================
   SUBMISSIONS
========================================================= */

async function loadSubmissions() {

  if (!currentUser) return;

  const submissionList =
    document.getElementById(
      "submissionList"
    );

  if (!submissionList) return;

  const {
    data,
    error
  } = await supabaseClient
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
    .order("submitted_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    submissionList.innerHTML =
      `<div class="status">
        Unable to load task history.
      </div>`;

    return;
  }

  if (!data || data.length === 0) {

    submissionList.innerHTML =
      `<div class="status">
        No task submissions yet.
      </div>`;

    return;
  }

  submissionList.innerHTML =
    data.map(item => {

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
              ? `
                <br>
                Note:
                ${escapeHtml(item.review_note)}
              `
              : ""
          }

        </div>
      `;

    }).join("");
}


/* =========================================================
   WITHDRAWAL
========================================================= */

async function requestWithdrawal() {

  if (!currentUser) {

    alert(
      "Please login or create an account first."
    );

    return;
  }

  const methodElement =
    document.getElementById(
      "withdrawMethod"
    );

  const detailsElement =
    document.getElementById(
      "accountDetails"
    );

  const amountElement =
    document.getElementById(
      "withdrawAmount"
    );

  const message =
    document.getElementById(
      "withdrawMessage"
    );

  if (
    !methodElement ||
    !detailsElement ||
    !amountElement
  ) {
    return;
  }

  const method =
    methodElement.value;

  const accountDetails =
    detailsElement.value.trim();

  const amount =
    Number(amountElement.value);

  if (!method) {

    message.innerHTML =
      `<div class="status">
        Select a payment method.
      </div>`;

    return;
  }

  if (!accountDetails) {

    message.innerHTML =
      `<div class="status">
        Enter your payment account.
      </div>`;

    return;
  }

  if (
    !Number.isInteger(amount) ||
    amount <= 0
  ) {

    message.innerHTML =
      `<div class="status">
        Enter a valid withdrawal amount.
      </div>`;

    return;
  }

  message.innerHTML =
    `<div class="status">
      Processing withdrawal...
    </div>`;

  const {
    data,
    error
  } = await supabaseClient.rpc(
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
      `<div class="status">
        ${escapeHtml(error.message)}
      </div>`;

    return;
  }

  message.innerHTML =
    `<div class="status">
      ✅ Withdrawal request submitted successfully.
    </div>`;

  amountElement.value = "";
  detailsElement.value = "";

  await loadWallet();
  await loadWithdrawals();
}


/* =========================================================
   WITHDRAWAL HISTORY
========================================================= */

async function loadWithdrawals() {

  if (!currentUser) return;

  const list =
    document.getElementById(
      "withdrawalList"
    );

  if (!list) return;

  const {
    data,
    error
  } = await supabaseClient
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
    .order("requested_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="status">
        Unable to load withdrawals.
      </div>`;

    return;
  }

  if (!data || data.length === 0) {

    list.innerHTML =
      `<div class="status">
        No withdrawal requests yet.
      </div>`;

    return;
  }

  list.innerHTML =
    data.map(item => {

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
              ? `
                <br>
                Admin note:
                ${escapeHtml(item.admin_note)}
              `
              : ""
          }

        </div>
      `;

    }).join("");
}


/* =========================================================
   USER STATUS
========================================================= */

function showUserStatus(message) {

  const element =
    document.getElementById(
      "userStatus"
    );

  if (element) {
    element.innerHTML = message;
  }
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   SAFE URL
========================================================= */

function safeUrl(value) {

  try {

    const url =
      new URL(value);

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


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

  if (!value) return "";

  return new Date(value)
    .toLocaleString();
}
