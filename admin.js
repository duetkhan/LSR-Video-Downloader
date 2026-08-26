let supabaseClient = null;
let adminUser = null;


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initAdmin
);


async function initAdmin() {

  try {

    if (typeof supabase === "undefined") {

      showAccess(
        "Supabase library failed to load."
      );

      return;
    }


    supabaseClient =
      supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );


    await checkAdmin();

  } catch (error) {

    console.error(error);

    showAccess(
      "Unable to load admin panel."
    );
  }
}


/* =========================
   CHECK ADMIN
========================= */

async function checkAdmin() {

  const {
    data: {
      user
    },
    error
  } =
    await supabaseClient.auth.getUser();


  if (error) {

    console.error(error);

    showAccess(
      "Unable to check login."
    );

    return;
  }


  if (!user) {

    showAccess(
      `You are not logged in.<br><br>
       <a href="login.html">
       Login
       </a>`
    );

    return;
  }


  adminUser = user;


  /*
    Check profiles.is_admin
  */

  const {
    data: profile,
    error: profileError
  } =
    await supabaseClient
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .maybeSingle();


  if (profileError) {

    console.error(profileError);

    showAccess(
      "Unable to verify admin account."
    );

    return;
  }


  if (
    !profile ||
    profile.is_admin !== true
  ) {

    showAccess(
      "⛔ Access denied. Admin account required."
    );

    return;
  }


  document
    .getElementById("accessStatus")
    .classList.add("hidden");


  document
    .getElementById("adminPanel")
    .classList.remove("hidden");


  document
    .getElementById("adminName")
    .textContent =
      profile.username ||
      user.email?.split("@")[0] ||
      "Admin";


  await loadAdminData();
}


/* =========================
   LOAD EVERYTHING
========================= */

async function loadAdminData() {

  await Promise.all([
    loadSubmissions(),
    loadWithdrawals(),
    loadTasks()
  ]);
}


/* =========================
   SUBMISSIONS
========================= */

async function loadSubmissions() {

  const list =
    document.getElementById(
      "submissionList"
    );


  list.innerHTML =
    `<div class="status">
      Loading submissions...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("task_submissions")
      .select(`
        id,
        user_id,
        task_id,
        proof,
        reward,
        status,
        submitted_at,
        reviewed_at,
        review_note,
        tasks (
          title
        )
      `)
      .eq("status", "pending")
      .order(
        "submitted_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="status">
        Unable to load submissions.<br>
        ${escapeHtml(error.message)}
      </div>`;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML =
      `<div class="status">
        No pending task submissions.
      </div>`;

    return;
  }


  list.innerHTML =
    data.map(item => {

      const title =
        item.tasks?.title ||
        "Task";


      return `
        <div class="submission">

          <h3>
            ${escapeHtml(title)}
          </h3>

          <p>
            👤 User ID:
            ${escapeHtml(item.user_id)}
          </p>

          <p>
            🪙 Reward:
            <strong>
              ${Number(item.reward || 0)}
              Coins
            </strong>
          </p>

          <p>
            📅 Submitted:
            ${formatDate(item.submitted_at)}
          </p>

          <div class="proof">
            <strong>Proof:</strong><br>
            ${escapeHtml(item.proof || "")}
          </div>

          <button
            class="approve"
            onclick="approveSubmission('${item.id}')"
          >
            ✅ Approve
          </button>

          <button
            class="reject"
            onclick="rejectSubmission('${item.id}')"
          >
            ❌ Reject
          </button>

        </div>
      `;

    }).join("");
}


/* =========================
   APPROVE
========================= */

async function approveSubmission(id) {

  /*
    IMPORTANT:
    Do not directly modify wallet from
    browser until the secure RPC exists.
  */

  alert(
    "Approval action is ready, but the secure database RPC must be connected before coins are added."
  );
}


/* =========================
   REJECT
========================= */

async function rejectSubmission(id) {

  const note =
    prompt(
      "Enter rejection note:"
    );


  if (note === null) {
    return;
  }


  alert(
    "Rejection action is ready, but the secure database RPC must be connected."
  );
}


/* =========================
   WITHDRAWALS
========================= */

async function loadWithdrawals() {

  const list =
    document.getElementById(
      "withdrawalList"
    );


  list.innerHTML =
    `<div class="status">
      Loading withdrawals...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("withdrawals")
      .select(`
        id,
        user_id,
        amount,
        method,
        account_details,
        status,
        requested_at,
        processed_at,
        admin_note
      `)
      .eq("status", "pending")
      .order(
        "requested_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="status">
        Unable to load withdrawals.<br>
        ${escapeHtml(error.message)}
      </div>`;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML =
      `<div class="status">
        No pending withdrawals.
      </div>`;

    return;
  }


  list.innerHTML =
    data.map(item => {

      return `
        <div class="withdrawal">

          <h3>
            💸 ${Number(item.amount || 0)}
            Coins
          </h3>

          <p>
            👤 User ID:
            ${escapeHtml(item.user_id)}
          </p>

          <p>
            💳 Method:
            ${escapeHtml(item.method)}
          </p>

          <p>
            🏦 Account:
            ${escapeHtml(item.account_details || "")}
          </p>

          <p>
            📅 Requested:
            ${formatDate(item.requested_at)}
          </p>

          <button
            class="approve"
            onclick="approveWithdrawal('${item.id}')"
          >
            ✅ Approve
          </button>

          <button
            class="reject"
            onclick="rejectWithdrawal('${item.id}')"
          >
            ❌ Reject
          </button>

        </div>
      `;

    }).join("");
}


/* =========================
   WITHDRAW APPROVE
========================= */

async function approveWithdrawal(id) {

  alert(
    "Withdrawal approval is ready, but the secure database RPC must be connected before changing the withdrawal status."
  );
}


/* =========================
   WITHDRAW REJECT
========================= */

async function rejectWithdrawal(id) {

  const note =
    prompt(
      "Enter rejection note:"
    );


  if (note === null) {
    return;
  }


  alert(
    "Withdrawal rejection is ready, but the secure database RPC must be connected."
  );
}


/* =========================
   TASKS
========================= */

async function loadTasks() {

  const list =
    document.getElementById(
      "taskList"
    );


  list.innerHTML =
    `<div class="status">
      Loading tasks...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("tasks")
      .select(`
        id,
        title,
        description,
        reward,
        status,
        max_completions,
        current_completions,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    list.innerHTML =
      `<div class="status">
        Unable to load tasks.<br>
        ${escapeHtml(error.message)}
      </div>`;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML =
      `<div class="status">
        No tasks found.
      </div>`;

    return;
  }


  list.innerHTML =
    data.map(task => {

      const status =
        String(task.status || "")
          .toLowerCase();


      const statusClass =
        status === "active"
          ? "active"
          : "inactive";


      return `
        <div class="task">

          <h3>
            ${escapeHtml(task.title)}
          </h3>

          <p>
            ${escapeHtml(
              task.description || ""
            )}
          </p>

          <p>
            🪙 Reward:
            ${Number(task.reward || 0)}
            Coins
          </p>

          <p>
            Status:
            <strong class="${statusClass}">
              ${escapeHtml(task.status)}
            </strong>
          </p>

          <p>
            👥 Completed:
            ${Number(
              task.current_completions || 0
            )}
            /
            ${
              task.max_completions === null
                ? "Unlimited"
                : Number(task.max_completions)
            }
          </p>

        </div>
      `;

    }).join("");
}


/* =========================
   LOGOUT
========================= */

async function adminLogout() {

  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    alert(
      "Logout failed: " +
      error.message
    );

    return;
  }


  window.location.href =
    "login.html";
}


/* =========================
   ACCESS MESSAGE
========================= */

function showAccess(message) {

  const element =
    document.getElementById(
      "accessStatus"
    );


  if (element) {

    element.innerHTML =
      message;

  }

}


/* =========================
   HELPERS
========================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


function formatDate(value) {

  if (!value) {
    return "";
  }


  return new Date(value)
    .toLocaleString();
}
