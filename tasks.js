```javascript
let supabaseClient = null;
let currentUser = null;


/* =========================
   START
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      if (typeof supabase === "undefined") {

        showUserStatus(
          "Supabase library failed to load."
        );

        return;
      }


      supabaseClient =
        supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        );


      await checkUser();


      /* Keep UI updated after login/logout */

      supabaseClient.auth.onAuthStateChange(
        async () => {

          setTimeout(
            checkUser,
            0
          );

        }
      );


    } catch (error) {

      console.error(error);

      showUserStatus(
        "Unable to connect to the task system."
      );

    }

  }
);


/* =========================
   AUTH
   ========================= */

async function checkUser() {

  const {
    data: {
      user
    },
    error
  } =
    await supabaseClient.auth.getUser();


  if (error) {
    console.error(error);
  }


  /*
    IMPORTANT:
    Tasks must load for guests too.
  */

  currentUser =
    user || null;


  await loadTasks();


  /* =========================
     GUEST
     ========================= */

  if (!user) {

    updateUserBox(
      "Guest",
      "",
      0,
      false
    );


    const submissionList =
      document.getElementById(
        "submissionList"
      );


    if (submissionList) {

      submissionList.innerHTML =
        `<div class="status">
          Login to view your task history.
        </div>`;

    }


    return;
  }


  /* =========================
     LOGGED IN
     ========================= */

  let username = "";


  /*
    Get username from profiles
  */

  const {
    data: profile,
    error: profileError
  } =
    await supabaseClient
      .from("profiles")
      .select(
        "username, full_name"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();


  if (profileError) {

    console.error(
      "Profile error:",
      profileError
    );

  }


  if (profile) {

    username =
      profile.username ||
      profile.full_name ||
      "";

  }


  /*
    Fallback
  */

  if (!username) {

    username =
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      (
        user.email
          ? user.email.split("@")[0]
          : "User"
      );

  }


  await loadWallet();


  const balanceElement =
    document.getElementById(
      "balance"
    );


  const balance =
    balanceElement
      ? Number(
          balanceElement.textContent || 0
        )
      : 0;


  updateUserBox(
    username,
    user.email || "",
    balance,
    true
  );


  await loadSubmissions();

}


/* =========================
   USER BOX
   ========================= */

function updateUserBox(
  username,
  email,
  balance,
  loggedIn
) {

  const usernameElement =
    document.getElementById(
      "displayUsername"
    );

  const emailElement =
    document.getElementById(
      "displayEmail"
    );

  const balanceElement =
    document.getElementById(
      "balance"
    );

  const guestButtons =
    document.getElementById(
      "guestButtons"
    );

  const userButtons =
    document.getElementById(
      "userButtons"
    );


  if (usernameElement) {

    usernameElement.textContent =
      username || "Guest";

  }


  if (emailElement) {

    if (loggedIn && email) {

      emailElement.textContent =
        email;

      emailElement.style.display =
        "block";

    } else {

      emailElement.textContent =
        "";

      emailElement.style.display =
        "none";

    }

  }


  if (balanceElement) {

    balanceElement.textContent =
      Number(balance || 0);

  }


  if (guestButtons) {

    guestButtons.style.display =
      loggedIn
        ? "none"
        : "flex";

  }


  if (userButtons) {

    userButtons.style.display =
      loggedIn
        ? "flex"
        : "none";

  }

}


/* =========================
   LOGOUT
   ========================= */

async function logoutUser() {

  if (!supabaseClient) return;


  const {
    error
  } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(error);

    alert(
      "Logout failed: " +
      error.message
    );

    return;
  }


  currentUser = null;


  updateUserBox(
    "Guest",
    "",
    0,
    false
  );


  const submissionList =
    document.getElementById(
      "submissionList"
    );


  if (submissionList) {

    submissionList.innerHTML =
      `<div class="status">
        Login to view your task history.
      </div>`;

  }

}


/* =========================
   WALLET
   ========================= */

async function loadWallet() {

  if (!currentUser) return;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("wallets")
      .select(
        "balance, pending_balance, total_earned, total_withdrawn"
      )
      .eq(
        "user_id",
        currentUser.id
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Wallet error:",
      error
    );

    return;
  }


  const balance =
    Number(
      data?.balance || 0
    );


  const balanceElement =
    document.getElementById(
      "balance"
    );


  if (balanceElement) {

    balanceElement.textContent =
      balance;

  }

}


/* =========================
   TASKS
   ========================= */

async function loadTasks() {

  const taskList =
    document.getElementById(
      "taskList"
    );


  if (!taskList) return;


  taskList.innerHTML =
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
        instructions,
        reward,
        task_url,
        proof_type,
        max_completions,
        current_completions,
        status
      `)
      .eq(
        "status",
        "active"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    taskList.innerHTML =
      `<div class="status">
        Unable to load tasks.
      </div>`;

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    taskList.innerHTML =
      `<div class="status">
        No tasks available right now.
      </div>`;

    return;
  }


  taskList.innerHTML =
    data.map(
      task => {

        const remaining =
          task.max_completions === null
            ? "Unlimited"
            : Math.max(
                0,
                Number(
                  task.max_completions
                ) -
                Number(
                  task.current_completions || 0
                )
              );


        return `
          <div class="task-card">

            <h3>
              ${escapeHtml(task.title)}
            </h3>

            <p>
              ${escapeHtml(
                task.description || ""
              )}
            </p>

            <p>
              🎁 Reward:
              <span class="reward">
                ${Number(task.reward)}
                Coins
              </span>
            </p>

            <p>
              👥 Remaining:
              ${remaining}
            </p>


            <button
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

      }
    ).join("");

}


/* =========================
   OPEN TASK
   ========================= */

function openTask(taskId) {

  /*
    Guest:
    show task list, but require login
    when trying to start.
  */

  if (!currentUser) {

    window.location.href =
      "login.html";

    return;
  }


  const box =
    document.getElementById(
      `task-${taskId}`
    );


  if (!box) return;


  box.classList.toggle(
    "hidden"
  );

}


/* =========================
   SUBMIT TASK
   ========================= */

async function submitTask(taskId) {

  if (!currentUser) {

    window.location.href =
      "login.html";

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

    resultElement.innerHTML =
      `<div class="status">
        Please enter your proof.
      </div>`;

    return;
  }


  resultElement.innerHTML =
    `<div class="status">
      Submitting...
    </div>`;


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "submit_task",
      {
        p_task_id: taskId,
        p_proof: proof
      }
    );


  if (error) {

    console.error(error);

    resultElement.innerHTML =
      `<div class="status">
        ${escapeHtml(
          error.message
        )}
      </div>`;

    return;
  }


  resultElement.innerHTML =
    `<div class="status">
      ✅ Submitted successfully.
      Your task is now pending review.
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
    document.getElementById(
      "submissionList"
    );


  if (!submissionList) return;


  const {
    data,
    error
  } =
    await supabaseClient
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
      .eq(
        "user_id",
        currentUser.id
      )
      .order(
        "submitted_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    submissionList.innerHTML =
      `<div class="status">
        Unable to load task history.
      </div>`;

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    submissionList.innerHTML =
      `<div class="status">
        No task submissions yet.
      </div>`;

    return;
  }


  submissionList.innerHTML =
    data.map(
      item => {

        const title =
          item.tasks?.title ||
          "Task";


        return `
          <div class="status">

            <strong>
              ${escapeHtml(title)}
            </strong>

            <br>

            Reward:
            <span class="coin">
              ${Number(item.reward)}
              Coins
            </span>

            <br>

            Status:
            <strong>
              ${escapeHtml(item.status)}
            </strong>

            <br>

            Submitted:
            ${formatDate(
              item.submitted_at
            )}

            ${
              item.review_note
                ? `
                  <br>
                  Note:
                  ${escapeHtml(
                    item.review_note
                  )}
                `
                : ""
            }

          </div>
        `;

      }
    ).join("");

}


/* =========================
   HELPERS
   ========================= */

function showUserStatus(message) {

  const element =
    document.getElementById(
      "userStatus"
    );


  if (element) {

    element.innerHTML =
      message;

  }

}


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


function formatDate(value) {

  if (!value) return "";


  return new Date(
    value
  ).toLocaleString();

}
```
