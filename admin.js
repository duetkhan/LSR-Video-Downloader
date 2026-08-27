let supabaseClient = null;
let adminUser = null;
let adminProfile = null;


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  try {

    showAccess("Checking admin access...");


    /* Check Supabase library */

    if (typeof supabase === "undefined") {

      showAccess(`
        ❌ Supabase library failed to load.
        <br><br>
        Please refresh the page.
      `);

      return;
    }


    /* Check config */

    if (
      typeof SUPABASE_URL === "undefined" ||
      typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
    ) {

      showAccess(`
        ❌ Supabase configuration is missing.
        <br><br>
        Check supabase-config.js
      `);

      return;
    }


    /* Create Supabase client */

    supabaseClient =
      supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );


    /* Check admin */

    await checkAdmin();

  } catch (error) {

    console.error(
      "Admin initialization error:",
      error
    );

    showAccess(`
      ❌ Unable to load admin panel.
      <br><br>
      ${escapeHtml(
        error?.message ||
        "Unknown error"
      )}
    `);
  }

});


/* =========================================================
   CHECK ADMIN
========================================================= */

async function checkAdmin() {

  if (!supabaseClient) {

    showAccess(
      "Supabase is not initialized."
    );

    return;
  }


  showAccess(
    "Checking admin access..."
  );


  /* -------------------------------------------------------
     Get current session
  ------------------------------------------------------- */

  const {
    data: sessionData,
    error: sessionError
  } =
    await supabaseClient.auth.getSession();


  if (sessionError) {

    console.error(
      "Session error:",
      sessionError
    );

    showAccess(`
      ❌ Unable to check login.
      <br><br>
      ${escapeHtml(
        sessionError.message
      )}
    `);

    return;
  }


  const session =
    sessionData?.session;


  const user =
    session?.user;


  /* -------------------------------------------------------
     Not logged in
  ------------------------------------------------------- */

  if (!user) {

    adminUser = null;
    adminProfile = null;

    hideAdminPanel();

    showAccess(`
      ⛔ You are not logged in.
      <br><br>

      <a
        href="login.html"
        style="
          display:inline-block;
          padding:10px 15px;
          background:#2563eb;
          color:#fff;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Login
      </a>
    `);

    return;
  }


  adminUser = user;


  /* -------------------------------------------------------
     Load profile
  ------------------------------------------------------- */

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

    hideAdminPanel();

    showAccess(`
      ❌ Unable to verify admin account.
      <br><br>

      ${escapeHtml(
        profileError.message
      )}

      <br><br>

      <small>
        Make sure your profile exists and
        your account has admin access.
      </small>
    `);

    return;
  }


  if (!profile) {

    hideAdminPanel();

    showAccess(`
      ❌ Admin profile not found.
      <br><br>

      Your login account does not have
      a matching profile.
    `);

    return;
  }


  /* -------------------------------------------------------
     Check admin flag
  ------------------------------------------------------- */

  if (profile.is_admin !== true) {

    adminProfile = profile;

    hideAdminPanel();

    showAccess(`
      ⛔ Access denied.
      <br><br>

      This account is not an administrator.

      <br><br>

      <strong>
        ${escapeHtml(
          user.email || "User"
        )}
      </strong>
    `);

    return;
  }


  /* -------------------------------------------------------
     ADMIN VERIFIED
  ------------------------------------------------------- */

  adminProfile = profile;


  showAdminPanel();


  const adminName =
    document.getElementById(
      "adminName"
    );


  if (adminName) {

    adminName.textContent =
      profile.username ||
      user.email?.split("@")[0] ||
      "Admin";
  }


  const adminEmail =
    document.getElementById(
      "adminEmail"
    );


  if (adminEmail) {

    adminEmail.textContent =
      user.email || "";
  }


  showAccess("");


  await loadAdminData();

}


/* =========================================================
   SHOW ADMIN PANEL
========================================================= */

function showAdminPanel() {

  const accessStatus =
    document.getElementById(
      "accessStatus"
    );


  if (accessStatus) {

    accessStatus.classList.add(
      "hidden"
    );
  }


  const adminPanel =
    document.getElementById(
      "adminPanel"
    );


  if (adminPanel) {

    adminPanel.classList.remove(
      "hidden"
    );
  }

}


/* =========================================================
   HIDE ADMIN PANEL
========================================================= */

function hideAdminPanel() {

  const adminPanel =
    document.getElementById(
      "adminPanel"
    );


  if (adminPanel) {

    adminPanel.classList.add(
      "hidden"
    );
  }

}


/* =========================================================
   LOAD ADMIN DATA
========================================================= */

async function loadAdminData() {

  try {

    await Promise.all([
      loadSubmissions(),
      loadWithdrawals(),
      loadTasks()
    ]);

  } catch (error) {

    console.error(
      "Admin data error:",
      error
    );
  }

}


/* =========================================================
   TASK MANAGEMENT
========================================================= */

async function loadTasks() {

  const list =
    document.getElementById(
      "taskList"
    );


  if (!list) {
    return;
  }


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
        execution_mode,
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

    console.error(
      "Load tasks error:",
      error
    );

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load tasks.
        <br><br>
        ${escapeHtml(
          error.message
        )}
      </div>
    `;

    return;
  }


  let html = `

    <div class="task-admin-form">

      <h3>
        ➕ Add New Task
      </h3>

      <input
        id="newTaskTitle"
        type="text"
        placeholder="Task title"
      >

      <textarea
        id="newTaskDescription"
        placeholder="Task description"
      ></textarea>

      <textarea
        id="newTaskInstructions"
        placeholder="Task instructions"
      ></textarea>

      <input
        id="newTaskReward"
        type="number"
        min="1"
        placeholder="Reward coins"
      >

      <input
        id="newTaskUrl"
        type="url"
        placeholder="Task URL (optional)"
      >

      <select id="newTaskProofType">

        <option value="text">
          Text Proof
        </option>

        <option value="link">
          Link Proof
        </option>

        <option value="attachment">
          Attachment Proof (Image/Screenshot)
        </option>

      </select>

      <select id="newTaskExecutionMode">

        <option value="one_time">
          One User - One Execution
        </option>

        <option value="multiple">
          Multiple Times
        </option>

      </select>

      <input
        id="newTaskMax"
        type="number"
        min="1"
        placeholder="Maximum completions (blank = unlimited)"
      >

      <button
        class="approve"
        onclick="createTask()"
      >
        ➕ Create Task
      </button>

      <div id="taskCreateMessage"></div>

    </div>

    <hr>

  `;


  if (
    !data ||
    data.length === 0
  ) {

    html += `
      <div class="status">
        No tasks found.
      </div>
    `;

    list.innerHTML = html;

    return;
  }


  html += data.map(task => {

    const active =
      task.status === "active";


    const max =
      task.max_completions === null
        ? "Unlimited"
        : Number(
            task.max_completions
          );


    const executionMode =
      task.execution_mode === "one_time"
        ? "One User - One Execution"
        : "Multiple Times";


    return `

      <div
        class="task-admin-card"
        id="admin-task-${Number(task.id)}"
      >

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
          🪙 Reward:
          <strong>
            ${Number(
              task.reward || 0
            )}
            Coins
          </strong>
        </p>

        <p>
          📊 Completions:
          ${Number(
            task.current_completions || 0
          )}
          /
          ${max}
        </p>

        <p>
          ⚙️ Execution:
          <strong>
            ${escapeHtml(
              executionMode
            )}
          </strong>
        </p>

        <p>
          🧾 Proof:
          <strong>
            ${
              task.proof_type === "attachment"
                ? "Attachment"
                : task.proof_type === "link"
                  ? "Link"
                  : "Text"
            }
          </strong>
        </p>

        <p>
          Status:
          <strong>
            ${escapeHtml(
              task.status
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
                  Open Task
                </a>
              </p>
            `
            : ""
        }

        <button
          onclick="editTask(${Number(task.id)})"
        >
          ✏️ Edit
        </button>

        <button
          onclick="toggleTaskStatus(
            ${Number(task.id)},
            '${active ? "inactive" : "active"}'
          )"
        >
          ${
            active
              ? "🔴 Deactivate"
              : "🟢 Activate"
          }
        </button>

        <button
          class="reject"
          onclick="deleteTask(${Number(task.id)})"
        >
          🗑️ Delete
        </button>


        <div
          id="edit-${Number(task.id)}"
          class="hidden"
        >

          <hr>

          <input
            id="edit-title-${Number(task.id)}"
            value="${escapeAttribute(
              task.title
            )}"
            placeholder="Task title"
          >

          <textarea
            id="edit-description-${Number(task.id)}"
            placeholder="Description"
          >${escapeHtml(
            task.description || ""
          )}</textarea>

          <textarea
            id="edit-instructions-${Number(task.id)}"
            placeholder="Instructions"
          >${escapeHtml(
            task.instructions || ""
          )}</textarea>

          <input
            id="edit-reward-${Number(task.id)}"
            type="number"
            min="1"
            value="${Number(
              task.reward || 0
            )}"
            placeholder="Reward"
          >

          <input
            id="edit-url-${Number(task.id)}"
            type="url"
            value="${escapeAttribute(
              task.task_url || ""
            )}"
            placeholder="Task URL"
          >

          <select
            id="edit-proof-${Number(task.id)}"
          >

            <option
              value="text"
              ${
                task.proof_type === "text"
                  ? "selected"
                  : ""
              }
            >
              Text Proof
            </option>

            <option
              value="link"
              ${
                task.proof_type === "link"
                  ? "selected"
                  : ""
              }
            >
              Link Proof
            </option>

            <option
              value="attachment"
              ${
                task.proof_type === "attachment"
                  ? "selected"
                  : ""
              }
            >
              Attachment Proof (Image/Screenshot)
            </option>

          </select>


          <select
            id="edit-execution-${Number(task.id)}"
          >

            <option
              value="one_time"
              ${
                task.execution_mode === "one_time"
                  ? "selected"
                  : ""
              }
            >
              One User - One Execution
            </option>

            <option
              value="multiple"
              ${
                task.execution_mode !== "one_time"
                  ? "selected"
                  : ""
              }
            >
              Multiple Times
            </option>

          </select>


          <input
            id="edit-max-${Number(task.id)}"
            type="number"
            min="1"
            value="${
              task.max_completions === null
                ? ""
                : Number(
                    task.max_completions
                  )
            }"
            placeholder="Maximum completions"
          >

          <br>

          <button
            class="approve"
            onclick="saveTask(${Number(task.id)})"
          >
            💾 Save Changes
          </button>

          <button
            onclick="cancelEdit(${Number(task.id)})"
          >
            Cancel
          </button>

          <div
            id="edit-message-${Number(task.id)}"
          ></div>

        </div>

      </div>

    `;

  }).join("");


  list.innerHTML = html;

}


/* =========================================================
   CREATE TASK
========================================================= */

async function createTask() {

  const titleElement =
    document.getElementById(
      "newTaskTitle"
    );

  const descriptionElement =
    document.getElementById(
      "newTaskDescription"
    );

  const instructionsElement =
    document.getElementById(
      "newTaskInstructions"
    );

  const rewardElement =
    document.getElementById(
      "newTaskReward"
    );

  const urlElement =
    document.getElementById(
      "newTaskUrl"
    );

  const proofElement =
    document.getElementById(
      "newTaskProofType"
    );

  const executionModeElement =
    document.getElementById(
      "newTaskExecutionMode"
    );

  const maxElement =
    document.getElementById(
      "newTaskMax"
    );


  if (
    !titleElement ||
    !descriptionElement ||
    !instructionsElement ||
    !rewardElement ||
    !urlElement ||
    !proofElement ||
    !executionModeElement ||
    !maxElement
  ) {

    alert(
      "Task form is not ready."
    );

    return;
  }


  const title =
    titleElement.value.trim();


  const description =
    descriptionElement.value.trim();


  const instructions =
    instructionsElement.value.trim();


  const reward =
    Number(
      rewardElement.value
    );


  const taskUrl =
    urlElement.value.trim();


  const proofType =
    proofElement.value;


  const executionMode =
    executionModeElement.value;


  const maxValue =
    maxElement.value.trim();


  const maxCompletions =
    maxValue === ""
      ? null
      : Number(maxValue);


  const message =
    document.getElementById(
      "taskCreateMessage"
    );


  if (!title) {

    message.innerHTML = `
      <div class="status">
        Enter a task title.
      </div>
    `;

    return;
  }


  if (
    !Number.isInteger(reward) ||
    reward <= 0
  ) {

    message.innerHTML = `
      <div class="status">
        Enter a valid reward.
      </div>
    `;

    return;
  }


  if (
    maxCompletions !== null &&
    (
      !Number.isInteger(
        maxCompletions
      ) ||
      maxCompletions <= 0
    )
  ) {

    message.innerHTML = `
      <div class="status">
        Enter a valid maximum completion value.
      </div>
    `;

    return;
  }


  if (
    ![
      "text",
      "link",
      "attachment"
    ].includes(proofType)
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid proof type.
      </div>
    `;

    return;
  }


  if (
    ![
      "one_time",
      "multiple"
    ].includes(executionMode)
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid execution mode.
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="status">
      Creating task...
    </div>
  `;


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_create_task",
      {
        p_title: title,
        p_description: description,
        p_instructions: instructions,
        p_reward: reward,
        p_task_url:
          taskUrl || null,
        p_proof_type:
          proofType,
        p_execution_mode:
          executionMode,
        p_max_completions:
          maxCompletions
      }
    );


  if (error) {

    console.error(
      "Create task error:",
      error
    );

    message.innerHTML = `
      <div class="status">
        ❌ ${escapeHtml(
          error.message
        )}
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="status">
      ✅ Task created successfully.
    </div>
  `;


  titleElement.value = "";
  descriptionElement.value = "";
  instructionsElement.value = "";
  rewardElement.value = "";
  urlElement.value = "";
  maxElement.value = "";


  await loadTasks();

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(id) {

  const box =
    document.getElementById(
      `edit-${id}`
    );


  if (box) {

    box.classList.remove(
      "hidden"
    );
  }

}


function cancelEdit(id) {

  const box =
    document.getElementById(
      `edit-${id}`
    );


  if (box) {

    box.classList.add(
      "hidden"
    );
  }

}


/* =========================================================
   SAVE TASK
========================================================= */

async function saveTask(id) {

  const title =
    document.getElementById(
      `edit-title-${id}`
    ).value.trim();


  const description =
    document.getElementById(
      `edit-description-${id}`
    ).value.trim();


  const instructions =
    document.getElementById(
      `edit-instructions-${id}`
    ).value.trim();


  const reward =
    Number(
      document.getElementById(
        `edit-reward-${id}`
      ).value
    );


  const taskUrl =
    document.getElementById(
      `edit-url-${id}`
    ).value.trim();


  const proofType =
    document.getElementById(
      `edit-proof-${id}`
    ).value;


  const executionMode =
    document.getElementById(
      `edit-execution-${id}`
    ).value;


  const maxValue =
    document.getElementById(
      `edit-max-${id}`
    ).value.trim();


  const maxCompletions =
    maxValue === ""
      ? null
      : Number(maxValue);


  const message =
    document.getElementById(
      `edit-message-${id}`
    );


  if (!title) {

    message.innerHTML = `
      <div class="status">
        Title is required.
      </div>
    `;

    return;
  }


  if (
    !Number.isInteger(reward) ||
    reward <= 0
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid reward.
      </div>
    `;

    return;
  }


  if (
    maxCompletions !== null &&
    (
      !Number.isInteger(
        maxCompletions
      ) ||
      maxCompletions <= 0
    )
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid maximum completions.
      </div>
    `;

    return;
  }


  if (
    ![
      "text",
      "link",
      "attachment"
    ].includes(proofType)
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid proof type.
      </div>
    `;

    return;
  }


  if (
    ![
      "one_time",
      "multiple"
    ].includes(executionMode)
  ) {

    message.innerHTML = `
      <div class="status">
        Invalid execution mode.
      </div>
    `;

    return;
  }


  message.innerHTML = `
    <div class="status">
      Saving...
    </div>
  `;


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_update_task",
      {
        p_task_id: id,
        p_title: title,
        p_description:
          description,
        p_instructions:
          instructions,
        p_reward: reward,
        p_task_url:
          taskUrl || null,
        p_proof_type:
          proofType,
        p_execution_mode:
          executionMode,
        p_max_completions:
          maxCompletions
      }
    );


  if (error) {

    console.error(
      "Update task error:",
      error
    );

    message.innerHTML = `
      <div class="status">
        ❌ ${escapeHtml(
          error.message
        )}
      </div>
    `;

    return;
  }


  alert(
    "✅ Task updated successfully."
  );


  await loadTasks();

}


/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */

async function toggleTaskStatus(
  id,
  newStatus
) {

  const action =
    newStatus === "active"
      ? "activate"
      : "deactivate";


  if (
    !confirm(
      `${action.toUpperCase()} this task?`
    )
  ) {

    return;
  }


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_set_task_status",
      {
        p_task_id: id,
        p_status: newStatus
      }
    );


  if (error) {

    console.error(
      "Task status error:",
      error
    );

    alert(
      "❌ Status change failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    newStatus === "active"
      ? "🟢 Task activated."
      : "🔴 Task deactivated."
  );


  await loadTasks();

}


/* =========================================================
   DELETE TASK
========================================================= */

async function deleteTask(id) {

  if (
    !confirm(
      "Delete this task?\n\n" +
      "This action cannot be undone."
    )
  ) {

    return;
  }


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_delete_task",
      {
        p_task_id: id
      }
    );


  if (error) {

    console.error(
      "Delete task error:",
      error
    );

    alert(
      "❌ Delete failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "🗑️ Task deleted successfully."
  );


  await loadTasks();

}


/* =========================================================
   TASK SUBMISSIONS
========================================================= */

async function loadSubmissions() {

  const list =
    document.getElementById(
      "submissionList"
    );


  if (!list) {
    return;
  }


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
      .eq(
        "status",
        "pending"
      )
      .order(
        "submitted_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Submissions error:",
      error
    );

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load submissions.
        <br><br>
        ${escapeHtml(
          error.message
        )}
      </div>
    `;

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

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


      const proof =
        item.proof ||
        "";


      const isAttachment =
        proof.startsWith(
          "http://"
        ) ||
        proof.startsWith(
          "https://"
        );


      return `
        <div class="submission">

          <h3>
            📋 ${escapeHtml(title)}
          </h3>

          <p>
            👤 User ID:
            <br>
            <small>
              ${escapeHtml(
                item.user_id
              )}
            </small>
          </p>

          <p>
            🪙 Reward:
            <strong>
              ${Number(
                item.reward || 0
              )}
              Coins
            </strong>
          </p>

          <p>
            📅 Submitted:
            ${formatDate(
              item.submitted_at
            )}
          </p>

          <div class="proof">

            <strong>
              Proof:
            </strong>

            <br><br>

            ${
              isAttachment
                ? `
                  <a
                    href="${safeUrl(
                      proof
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="${safeUrl(
                        proof
                      )}"
                      alt="Task proof attachment"
                      style="
                        max-width:100%;
                        max-height:500px;
                        border-radius:8px;
                        display:block;
                        margin-bottom:10px;
                      "
                    >
                  </a>

                  <a
                    href="${safeUrl(
                      proof
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🖼️ Open Full Image
                  </a>
                `
                : escapeHtml(
                    proof ||
                    "No proof provided."
                  )
            }

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


/* =========================================================
   APPROVE SUBMISSION
========================================================= */

async function approveSubmission(id) {

  if (
    !confirm(
      "Approve this task submission?"
    )
  ) {

    return;
  }


  const {
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
    "✅ Task approved.\n\n" +
    "Reward added to user's balance."
  );


  await loadAdminData();

}


/* =========================================================
   REJECT SUBMISSION
========================================================= */

async function rejectSubmission(id) {

  const note =
    prompt(
      "Enter rejection reason:"
    );


  if (note === null) {
    return;
  }


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_review_submission",
      {
        p_submission_id: id,
        p_action: "reject",
        p_note:
          note.trim() ||
          "Rejected by admin"
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


/* =========================================================
   WITHDRAWALS
========================================================= */

async function loadWithdrawals() {

  const list =
    document.getElementById(
      "withdrawalList"
    );


  if (!list) {
    return;
  }


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
      .eq(
        "status",
        "pending"
      )
      .order(
        "requested_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Withdrawals error:",
      error
    );

    list.innerHTML = `
      <div class="status">
        ❌ Unable to load withdrawals.
        <br><br>
        ${escapeHtml(
          error.message
        )}
      </div>
    `;

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

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
            ${Number(
              item.amount || 0
            )}
            Coins
          </h3>

          <p>
            👤 User ID:
            <br>
            <small>
              ${escapeHtml(
                item.user_id
              )}
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
            ${formatDate(
              item.requested_at
            )}
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


/* =========================================================
   APPROVE WITHDRAWAL
========================================================= */

async function approveWithdrawal(id) {

  if (
    !confirm(
      "Approve this withdrawal?"
    )
  ) {

    return;
  }


  const {
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
      "❌ Approval failed:\n\n" +
      error.message
    );

    return;
  }


  alert(
    "✅ Withdrawal approved."
  );


  await loadAdminData();

}


/* =========================================================
   REJECT WITHDRAWAL
========================================================= */

async function rejectWithdrawal(id) {

  const note =
    prompt(
      "Enter rejection reason:"
    );


  if (note === null) {
    return;
  }


  const {
    error
  } =
    await supabaseClient.rpc(
      "admin_review_withdrawal",
      {
        p_withdrawal_id: id,
        p_action: "reject",
        p_note:
          note.trim() ||
          "Rejected by admin"
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
    "❌ Withdrawal rejected.\n\n" +
    "Amount returned to user's balance."
  );


  await loadAdminData();

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

async function adminLogout() {

  if (
    !confirm(
      "Logout from Admin Panel?"
    )
  ) {

    return;
  }


  const button =
    document.getElementById(
      "adminLogoutButton"
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "Logging out...";
  }


  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Admin logout error:",
        error
      );

      alert(
        "Logout failed:\n\n" +
        error.message
      );

      if (button) {

        button.disabled = false;

        button.textContent =
          "Logout";
      }

      return;
    }


    adminUser = null;
    adminProfile = null;


    window.location.replace(
      "login.html"
    );

  } catch (error) {

    console.error(
      "Logout exception:",
      error
    );

    alert(
      "Logout failed. Please try again."
    );


    if (button) {

      button.disabled = false;

      button.textContent =
        "Logout";
    }

  }

}


/* =========================================================
   ACCESS MESSAGE
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

  return escapeHtml(value);

}


/* =========================================================
   SAFE URL
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

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


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

function setupAuthListener() {

  if (!supabaseClient) {
    return;
  }


  supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

      console.log(
        "Auth event:",
        event
      );


      if (
        event === "SIGNED_OUT"
      ) {

        adminUser = null;
        adminProfile = null;

        window.location.replace(
          "login.html"
        );

      }

    }
  );

}


/* =========================================================
   SETUP AUTH LISTENER AFTER LOAD
========================================================= */

const originalInit =
  window.initAdmin;


if (
  typeof originalInit ===
  "function"
) {

  /* Nothing */

}
