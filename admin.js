```javascript
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

    showAccess(`
      ⛔ You are not logged in.
      <br><br>
      <a href="login.html">
        Login
      </a>
    `);

    return;
  }


  adminUser = user;


  /* =========================
     CHECK ADMIN ROLE
  ========================= */

  const {
    data: profile,
    error: profileError
  } =
    await supabaseClient
      .from("profiles")
      .select(`
        username,
        is_admin
      `)
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

    showAccess(`
      ⛔ Access denied.
      <br><br>
      Admin account required.
    `);

    return;
  }


  /* =========================
     SHOW ADMIN PANEL
  ========================= */

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
   LOAD ALL ADMIN DATA
========================= */

async function loadAdminData() {

  await Promise.all([
    loadSubmissions(),
    loadWithdrawals(),
    loadTasks()
  ]);
}


/* =========================
   TASK SUBMISSIONS
========================= */

async function loadSubmissions() {

  const list =
    document.getElementById(
      "submissionList"
    );


  list.innerHTML = `
    <div class="status">
      Loading submissions...
    </div>
  `;


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

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load submissions.
        <br><br>
        ${escapeHtml(error.message)}
      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML = `
      <div class="status">
        ✅ No pending task submissions.
      </div>
    `;

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
            📋 ${escapeHtml(title)}
          </h3>

          <p>
            👤 User ID:
            <br>
            <small>
              ${escapeHtml(item.user_id)}
            </small>
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

            <strong>
              Proof:
            </strong>

            <br><br>

            ${escapeHtml(
              item.proof || "No proof provided."
            )}

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
   APPROVE TASK
========================= */

async function approveSubmission(id) {

  const confirmed =
    confirm(
      "Approve this task submission?\n\n" +
      "The task reward will be added to the user's wallet."
    );


  if (!confirmed) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "admin_review_submission",
      {
        p_submission_id: id,
        p_action: "approve",
        p_note: null
      }
    );


  if (error) {

    console.error(error);

    alert(
      "❌ Approval failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "✅ Task approved successfully.\n\n" +
    "Reward has been added to the user's balance."
  );


  await loadAdminData();
}


/* =========================
   REJECT TASK
========================= */

async function rejectSubmission(id) {

  const note =
    prompt(
      "Enter the reason for rejecting this task:"
    );


  if (note === null) {
    return;
  }


  const cleanNote =
    note.trim() ||
    "Rejected by admin";


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "admin_review_submission",
      {
        p_submission_id: id,
        p_action: "reject",
        p_note: cleanNote
      }
    );


  if (error) {

    console.error(error);

    alert(
      "❌ Rejection failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "❌ Task submission rejected."
  );


  await loadAdminData();
}


/* =========================
   WITHDRAWALS
========================= */

async function loadWithdrawals() {

  const list =
    document.getElementById(
      "withdrawalList"
    );


  list.innerHTML = `
    <div class="status">
      Loading withdrawals...
    </div>
  `;


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

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load withdrawals.
        <br><br>
        ${escapeHtml(error.message)}
      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML = `
      <div class="status">
        ✅ No pending withdrawals.
      </div>
    `;

    return;
  }


  list.innerHTML =
    data.map(item => {

      return `
        <div class="withdrawal">

          <h3>
            💸
            ${Number(item.amount || 0)}
            Coins
          </h3>

          <p>
            👤 User ID:
            <br>
            <small>
              ${escapeHtml(item.user_id)}
            </small>
          </p>

          <p>
            💳 Method:
            <strong>
              ${escapeHtml(
                item.method || ""
              )}
            </strong>
          </p>

          <p>
            🏦 Account:
            <br>
            ${escapeHtml(
              item.account_details || ""
            )}
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
   APPROVE WITHDRAWAL
========================= */

async function approveWithdrawal(id) {

  const confirmed =
    confirm(
      "Approve this withdrawal?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "admin_review_withdrawal",
      {
        p_withdrawal_id: id,
        p_action: "approve",
        p_note: null
      }
    );


  if (error) {

    console.error(error);

    alert(
      "❌ Withdrawal approval failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "✅ Withdrawal approved successfully."
  );


  await loadAdminData();
}


/* =========================
   REJECT WITHDRAWAL
========================= */

async function rejectWithdrawal(id) {

  const note =
    prompt(
      "Enter the reason for rejecting this withdrawal:"
    );


  if (note === null) {
    return;
  }


  const cleanNote =
    note.trim() ||
    "Rejected by admin";


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "admin_review_withdrawal",
      {
        p_withdrawal_id: id,
        p_action: "reject",
        p_note: cleanNote
      }
    );


  if (error) {

    console.error(error);

    alert(
      "❌ Withdrawal rejection failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "❌ Withdrawal rejected.\n\n" +
    "The amount has been returned to the user's balance."
  );


  await loadAdminData();
}


/* =========================
   TASK LIST
========================= */

async function loadTasks() {

  const list =
    document.getElementById(
      "taskList"
    );


  list.innerHTML = `
    <div class="status">
      Loading tasks...
    </div>
  `;


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
        instructions,
        reward,
        task_url,
        proof_type,
        max_completions,
        current_completions,
        status,
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

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load tasks.
        <br><br>
        ${escapeHtml(error.message)}
      </div>
    `;

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML = `
      <div class="status">
        No tasks found.
      </div>
    `;

    return;
  }


  list.innerHTML =
    data.map(task => {

      const status =
        String(
          task.status || ""
        ).toLowerCase();


      const statusClass =
        status === "active"
          ? "active"
          : "inactive";


      const completed =
        Number(
          task.current_completions || 0
        );


      const maximum =
        task.max_completions === null
          ? "Unlimited"
          : Number(
              task.max_completions
            );


      return `
        <div class="task">

          <h3>
            ${escapeHtml(
              task.title
            )}
          </h3>

          <p>
            ${escapeHtml(
              task.description || ""
            )}
          </p>

          <p>
            📝 Instructions:
            <br>
            ${escapeHtml(
              task.instructions || ""
            )}
          </p>

          <p>
            🪙 Reward:
            <strong>
              ${Number(
                task.reward || 0
              )}
              Coins
            </strong>
          </p>

          <p>
            📊 Completed:
            ${completed}
            /
            ${maximum}
          </p>

          <p>
            Status:
            <strong class="${statusClass}">
              ${escapeHtml(
                task.status || ""
              )}
            </strong>
          </p>

          ${
            task.task_url
              ? `
                <p>
                  🔗
                  <a
                    href="${safeUrl(
                      task.task_url
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Task URL
                  </a>
                </p>
              `
              : ""
          }

        </div>
      `;

    }).join("");
}


/* =========================
   LOGOUT
========================= */

async function adminLogout() {

  const confirmed =
    confirm(
      "Logout from Admin Panel?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(error);

    alert(
      "Logout failed:\n\n" +
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


  if (!element) {
    return;
  }


  element.innerHTML =
    message;
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
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


/* =========================
   SAFE URL
========================= */

function safeUrl(value) {

  try {

    const url =
      new URL(
        value,
        window.location.href
      );


    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {

      return url.href;
    }


    return "#";

  } catch {

    return "#";
  }
}


/* =========================
   DATE FORMAT
========================= */

function formatDate(value) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "—";
  }


  return date.toLocaleString();
}
```
