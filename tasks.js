let supabaseClient = null;
let currentUser = null;


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  try {

    if (typeof supabase === "undefined") {
      showUserStatus("Supabase library failed to load.");
      return;
    }

    if (
      typeof SUPABASE_URL === "undefined" ||
      typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
    ) {
      showUserStatus("Supabase configuration is missing.");
      return;
    }

    supabaseClient = supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    /*
     * Check current login session.
     *
     * Supabase keeps the browser session automatically,
     * so the user does not need to login on every visit.
     */

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (session && session.user) {

      currentUser = session.user;

      updateLoggedInUI();

      await loadWallet();
      await loadSubmissions();

    } else {

      currentUser = null;

      updateLoggedOutUI();

    }

    /*
     * Tasks are public.
     * Logged-out users can see them.
     */

    await loadTasks();


    /*
     * Listen for login/logout changes.
     */

    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {

        if (session && session.user) {

          currentUser = session.user;

          updateLoggedInUI();

          await loadWallet();
          await loadSubmissions();

        } else {

          currentUser = null;

          updateLoggedOutUI();

          document.getElementById("balance").textContent = "0";

          document.getElementById("submissionList").innerHTML =
            `<div class="status">
              Login to see your task history.
            </div>`;

        }

      }
    );


  } catch (error) {

    console.error(error);

    showUserStatus(
      "Unable to connect to the task system."
    );

  }

});


/* =========================
   UI - LOGGED OUT
========================= */

function updateLoggedOutUI() {

  const username =
    document.getElementById("username");

  const loginButton =
    document.getElementById("loginButton");

  const signupButton =
    document.getElementById("signupButton");

  const logoutButton =
    document.getElementById("logoutButton");


  if (username) {
    username.textContent = "Guest";
  }

  if (loginButton) {
    loginButton.classList.remove("hidden");
  }

  if (signupButton) {
    signupButton.classList.remove("hidden");
  }

  if (logoutButton) {
    logoutButton.classList.add("hidden");
  }


  showUserStatus(
    `You are not logged in. Start a task and login when required.`
  );

}


/* =========================
   UI - LOGGED IN
========================= */

function updateLoggedInUI() {

  if (!currentUser) return;


  const usernameElement =
    document.getElementById("username");

  const loginButton =
    document.getElementById("loginButton");

  const signupButton =
    document.getElementById("signupButton");

  const logoutButton =
    document.getElementById("logoutButton");


  /*
   * Username comes from Supabase Auth metadata.
   */

  const metadata =
    currentUser.user_metadata || {};

  const username =
    metadata.username ||
    currentUser.email ||
    "User";


  if (usernameElement) {
    usernameElement.textContent = username;
  }


  if (loginButton) {
    loginButton.classList.add("hidden");
  }

  if (signupButton) {
    signupButton.classList.add("hidden");
  }

  if (logoutButton) {
    logoutButton.classList.remove("hidden");
  }


  showUserStatus(
    `Logged in as: ${escapeHtml(username)}`
  );

}


/* =========================
   LOGOUT
========================= */

async function logoutUser() {

  if (!supabaseClient) return;


  const { error } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(error);

    alert(
      "Unable to logout: " +
      error.message
    );

    return;
  }


  /*
   * Supabase removes the local auth session.
   */

  currentUser = null;

  updateLoggedOutUI();

  document.getElementById("balance").textContent = "0";

  document.getElementById("submissionList").innerHTML =
    `<div class="status">
      Login to see your task history.
    </div>`;

}


/* =========================
   WALLET
========================= */

async function loadWallet() {

  if (!currentUser) return;


  const { data, error } =
    await supabaseClient
      .from("wallets")
      .select(`
        balance,
        pending_balance,
        total_earned,
        total_withdrawn
      `)
      .eq("user_id", currentUser.id)
      .maybeSingle();


  if (error) {

    console.error("Wallet error:", error);

    return;
  }


  if (!data) {

    document.getElementById("balance").textContent = "0";

    return;
  }


  const balance =
    Number(data.balance || 0);


  document.getElementById("balance").textContent =
    balance;

}


/* =========================
   LOAD TASKS
========================= */

async function loadTasks() {

  const taskList =
    document.getElementById("taskList");


  if (!taskList) return;


  taskList.innerHTML =
    `<div class="status">
      Loading tasks...
    </div>`;


  const { data, error } =
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
      .eq("status", "active")
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error("Task loading error:", error);

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

      const taskId =
        Number(task.id);


      let remaining =
        "Unlimited";


      if (task.max_completions !== null) {

        remaining =
          Math.max(
            0,
            Number(task.max_completions) -
            Number(task.current_completions || 0)
          );

      }


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
              ${Number(task.reward || 0)} Coins
            </span>
          </p>


          <p>
            👥 Remaining:
            ${remaining}
          </p>


          <button
            class="start-task"
            onclick="startTask(${taskId})"
          >
            ▶ Start Task
          </button>


          <div
            id="task-${taskId}"
            class="task-details hidden"
          >

            ${
              task.task_url
                ? `
                  <a
                    class="task-link"
                    href="${safeUrl(task.task_url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 Open Task
                  </a>
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
              id="proof-${taskId}"
              placeholder="Enter your proof here..."
            ></textarea>


            <button
              class="submit-task"
              onclick="submitTask(${taskId})"
            >
              ✅ Submit Task
            </button>


            <div
              id="result-${taskId}"
            ></div>

          </div>

        </div>

      `;

    }).join("");

}


/* =========================
   START TASK
========================= */

async function startTask(taskId) {

  /*
   * IMPORTANT:
   * Tasks remain visible to everyone.
   *
   * Login is required only when the user
   * actually wants to start the task.
   */

  if (!currentUser) {

    const login =
      confirm(
        "You need to login to start this task.\n\n" +
        "Press OK to Login.\n" +
        "Press Cancel to Sign Up."
      );


    if (login) {

      window.location.href =
        "login.html";

    } else {

      window.location.href =
        "signup.html";

    }

    return;
  }


  const box =
    document.getElementById(
      `task-${taskId}`
    );


  if (!box) return;


  box.classList.toggle("hidden");

}


/* =========================
   SUBMIT TASK
========================= */

async function submitTask(taskId) {

  if (!currentUser) {

    alert(
      "Please login before submitting a task."
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


  const { data, error } =
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
        ${escapeHtml(error.message)}
      </div>`;

    return;
  }


  resultElement.innerHTML =
    `<div class="status">
      ✅ Task submitted successfully.
      <br>
      Your submission is pending review.
    </div>`;


  if (proofElement) {
    proofElement.value = "";
  }


  await loadSubmissions();

}


/* =========================
   TASK HISTORY
========================= */

async function loadSubmissions() {

  if (!currentUser) return;


  const submissionList =
    document.getElementById(
      "submissionList"
    );


  if (!submissionList) return;


  const { data, error } =
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

    console.error(
      "Submission history error:",
      error
    );

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
        item.tasks?.title ||
        "Task";


      return `

        <div class="history-item">

          <strong>
            ${escapeHtml(title)}
          </strong>

          <br><br>

          Reward:

          <span class="reward">
            ${Number(item.reward || 0)}
            Coins
          </span>

          <br>

          Status:

          <strong>
            ${escapeHtml(
              item.status || ""
            )}
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

    }).join("");

}


/* =========================
   STATUS
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


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================
   SAFE URL
========================= */

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


/* =========================
   DATE
========================= */

function formatDate(value) {

  if (!value) return "";

  return new Date(value)
    .toLocaleString();

}
