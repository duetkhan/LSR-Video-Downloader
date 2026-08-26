
let supabaseClient = null;
let currentUser = null;


/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  try {

    if (typeof supabase === "undefined") {
      console.error("Supabase library failed to load.");
      return;
    }

    supabaseClient = supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    await checkUser();

  } catch (error) {

    console.error(error);

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


  /* =========================
     GUEST
  ========================= */

  if (!user) {

    currentUser = null;

    updateUserBar();

    /*
      IMPORTANT:
      Guest can see tasks.
      Only starting/submitting a task requires login.
    */

    await loadTasks();

    document.getElementById("submissionList").innerHTML =
      `<div class="status">Login to see your task history.</div>`;

    return;
  }


  /* =========================
     LOGGED IN
  ========================= */

  currentUser = user;

  updateUserBar();

  await loadWallet();

  await loadTasks();

  await loadSubmissions();

}


/* =========================
   USER BAR
========================= */

async function updateUserBar() {

  const usernameElement =
    document.getElementById("username");

  const balanceElement =
    document.getElementById("balance");

  const loginButton =
    document.getElementById("loginButton");

  const signupButton =
    document.getElementById("signupButton");

  const logoutButton =
    document.getElementById("logoutButton");


  if (!currentUser) {

    usernameElement.textContent = "Guest";

    balanceElement.textContent = "0";

    loginButton.classList.remove("hidden");

    signupButton.classList.remove("hidden");

    logoutButton.classList.add("hidden");

    return;
  }


  /*
    Get username from profiles table.
  */

  let username = null;


  const { data, error } = await supabaseClient
    .from("profiles")
    .select("username, full_name")
    .eq("id", currentUser.id)
    .maybeSingle();


  if (error) {
    console.error("Profile error:", error);
  }


  if (data) {

    username =
      data.username ||
      data.full_name ||
      null;

  }


  /*
    Fallback only if profile username is empty.
    Email is NOT displayed.
  */

  if (!username) {

    username = "User";

  }


  usernameElement.textContent = username;


  loginButton.classList.add("hidden");

  signupButton.classList.add("hidden");

  logoutButton.classList.remove("hidden");

}


/* =========================
   LOGOUT
========================= */

async function logoutUser() {

  const { error } =
    await supabaseClient.auth.signOut();


  if (error) {

    console.error(error);

    alert(error.message);

    return;
  }


  currentUser = null;


  window.location.reload();

}


/* =========================
   WALLET
========================= */

async function loadWallet() {

  if (!currentUser) return;


  const { data, error } =
    await supabaseClient
      .from("wallets")
      .select(
        "balance, pending_balance, total_earned, total_withdrawn"
      )
      .eq("user_id", currentUser.id)
      .maybeSingle();


  if (error) {

    console.error("Wallet error:", error);

    document.getElementById("balance").textContent = "0";

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
   TASKS
========================= */

async function loadTasks() {

  const taskList =
    document.getElementById("taskList");


  taskList.innerHTML =
    `<div class="status">Loading tasks...</div>`;


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
            class="start-task"
            onclick="openTask(${Number(task.id)})"
          >
            ▶ Start Task
          </button>


          <div
            id="task-${Number(task.id)}"
            class="task-details hidden"
          >

            ${
              task.task_url
                ? `
                  <p>

                    <a
                      class="task-link"
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
              class="submit-task"
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


/* =========================
   OPEN TASK
========================= */

function openTask(taskId) {

  /*
    Guest can see the task,
    but must login before opening it.
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


  box.classList.toggle("hidden");

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
  } = await supabaseClient.rpc(
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
      ✅ Submitted successfully.
      Your task is now pending review.
    </div>`;


  proofElement.value = "";


  await loadWallet();

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

          <br>

          Reward:
          <span class="reward">
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

  return new Date(value)
    .toLocaleString();

}
```
