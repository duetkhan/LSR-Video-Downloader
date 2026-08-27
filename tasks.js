
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


      if (
        typeof SUPABASE_URL === "undefined" ||
        typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
      ) {

        showUserStatus(
          "Supabase configuration is missing."
        );

        return;
      }


      supabaseClient =
        supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        );


      supabaseClient.auth.onAuthStateChange(
        (event, session) => {

          console.log(
            "Auth event:",
            event
          );


          if (
            event === "SIGNED_OUT" ||
            !session
          ) {

            currentUser = null;

            resetGuestUI();

          }

        }
      );


      await checkUser();


    } catch (error) {

      console.error(error);

      showUserStatus(
        "Unable to connect to the task system."
      );

    }

  }
);


/* =========================
   AUTH CHECK
========================= */

async function checkUser() {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      data: {
        user
      },
      error
    } =
      await supabaseClient.auth.getUser();


    if (error) {

      console.error(
        "Auth check error:",
        error
      );

      currentUser = null;

      resetGuestUI();

      return;
    }


    if (!user) {

      currentUser = null;

      resetGuestUI();


      const taskList =
        document.getElementById(
          "taskList"
        );


      if (taskList) {

        taskList.innerHTML =
          `<div class="status">
            Please login first to access Micro Tasks.
          </div>`;

      }


      const submissionList =
        document.getElementById(
          "submissionList"
        );


      if (submissionList) {

        submissionList.innerHTML =
          `<div class="status">
            Login required.
          </div>`;

      }


      return;
    }


    currentUser = user;


    showUserStatus(
      `Logged in as:
       ${escapeHtml(
         user.email || "User"
       )}`
    );


    await loadProfile();

    await loadWallet();

    await loadTasks();

    await loadSubmissions();

    await loadWithdrawals();


    updateAuthButtons(true);


  } catch (error) {

    console.error(
      "checkUser error:",
      error
    );

    currentUser = null;

    resetGuestUI();

  }

}


/* =========================
   RESET GUEST UI
========================= */

function resetGuestUI() {

  const usernameElement =
    document.getElementById(
      "username"
    );


  if (usernameElement) {

    usernameElement.textContent =
      "Guest";

  }


  const balanceElement =
    document.getElementById(
      "balance"
    );


  if (balanceElement) {

    balanceElement.textContent =
      "0";

  }


  const withdrawBalance =
    document.getElementById(
      "withdrawBalance"
    );


  if (withdrawBalance) {

    withdrawBalance.textContent =
      "0";

  }


  updateAuthButtons(false);

}


/* =========================
   PROFILE / USERNAME
========================= */

async function loadProfile() {

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("username")
      .eq(
        "id",
        currentUser.id
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Profile error:",
      error
    );


    const usernameElement =
      document.getElementById(
        "username"
      );


    if (usernameElement) {

      usernameElement.textContent =
        currentUser.email
          ? currentUser.email.split("@")[0]
          : "User";

    }


    return;
  }


  const usernameElement =
    document.getElementById(
      "username"
    );


  if (!usernameElement) {
    return;
  }


  if (
    data &&
    data.username
  ) {

    usernameElement.textContent =
      data.username;

  } else {

    usernameElement.textContent =
      currentUser.email
        ? currentUser.email.split("@")[0]
        : "User";

  }

}


/* =========================
   AUTH BUTTONS
========================= */

function updateAuthButtons(
  loggedIn
) {

  const loginButton =
    document.getElementById(
      "loginButton"
    );


  const signupButton =
    document.getElementById(
      "signupButton"
    );


  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if (loggedIn) {

    if (loginButton) {

      loginButton.classList.add(
        "hidden"
      );

    }


    if (signupButton) {

      signupButton.classList.add(
        "hidden"
      );

    }


    if (logoutButton) {

      logoutButton.classList.remove(
        "hidden"
      );

      logoutButton.disabled =
        false;

      logoutButton.textContent =
        "Logout";

    }


  } else {

    if (loginButton) {

      loginButton.classList.remove(
        "hidden"
      );

    }


    if (signupButton) {

      signupButton.classList.remove(
        "hidden"
      );

    }


    if (logoutButton) {

      logoutButton.classList.add(
        "hidden"
      );

      logoutButton.disabled =
        false;

      logoutButton.textContent =
        "Logout";

    }

  }

}


/* =========================
   LOGOUT
========================= */

async function logoutUser() {

  console.log(
    "Logout button clicked"
  );


  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if (logoutButton) {

    logoutButton.disabled =
      true;

    logoutButton.textContent =
      "Logging out...";

  }


  try {

    if (!supabaseClient) {

      currentUser = null;

      resetGuestUI();

      window.location.replace(
        "login.html"
      );

      return;

    }


    const {
      error
    } =
      await supabaseClient.auth.signOut({
        scope: "local"
      });


    if (error) {

      console.error(
        "Logout error:",
        error
      );


      currentUser = null;

      resetGuestUI();


      alert(
        "Logout failed: " +
        error.message
      );


      if (logoutButton) {

        logoutButton.disabled =
          false;

        logoutButton.textContent =
          "Logout";

      }


      return;

    }


    currentUser = null;

    resetGuestUI();


    window.location.replace(
      "login.html"
    );


  } catch (error) {

    console.error(
      "Logout exception:",
      error
    );


    currentUser = null;

    resetGuestUI();


    window.location.replace(
      "login.html"
    );

  }

}


window.logoutUser =
  logoutUser;


/* =========================
   WALLET
========================= */

async function loadWallet() {

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("wallets")
      .select(`
        balance,
        pending_balance,
        total_earned,
        total_withdrawn
      `)
      .eq(
        "user_id",
        currentUser.id
      )
      .single();


  if (error) {

    console.error(
      "Wallet error:",
      error
    );

    return;
  }


  const balance =
    Number(
      data.balance || 0
    );


  const balanceElement =
    document.getElementById(
      "balance"
    );


  if (balanceElement) {

    balanceElement.textContent =
      balance;

  }


  const withdrawBalance =
    document.getElementById(
      "withdrawBalance"
    );


  if (withdrawBalance) {

    withdrawBalance.textContent =
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


  if (!taskList) {
    return;
  }


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

    console.error(
      "Tasks error:",
      error
    );


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
    data.map(task => {

      const remaining =
        task.max_completions === null
          ? "Unlimited"
          : Math.max(
              0,
              Number(
                task.max_completions
              ) -
              Number(
                task.current_completions ||
                0
              )
            );


      let proofArea = "";


      /* ---------------------------------
         TEXT PROOF
      --------------------------------- */

      if (
        task.proof_type === "text"
      ) {

        proofArea = `
          <textarea
            id="proof-${Number(task.id)}"
            rows="4"
            placeholder="Enter your proof here..."
          ></textarea>
        `;

      }


      /* ---------------------------------
         LINK PROOF
      --------------------------------- */

      else if (
        task.proof_type === "link"
      ) {

        proofArea = `
          <input
            id="proof-${Number(task.id)}"
            type="url"
            placeholder="Enter your proof link..."
          >
        `;

      }


      /* ---------------------------------
         ATTACHMENT PROOF
      --------------------------------- */

      else if (
        task.proof_type === "attachment"
      ) {

        proofArea = `
          <input
            id="proof-${Number(task.id)}"
            type="file"
            accept="image/*"
          >

          <small>
            Upload a screenshot or image as proof.
          </small>
        `;

      }


      return `
        <div class="task-card">

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
            🎁 Reward:
            <span class="reward">
              ${Number(
                task.reward
              )}
              Coins
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
            class="hidden"
          >

            ${
              task.task_url
                ? `
                  <p>
                    <a
                      class="task-link"
                      href="${safeUrl(
                        task.task_url
                      )}"
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


            <p>
              <strong>
                Proof Type:
              </strong>
              ${escapeHtml(
                task.proof_type || "text"
              )}
            </p>


            ${proofArea}


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

function openTask(
  taskId
) {

  const box =
    document.getElementById(
      `task-${taskId}`
    );


  if (!box) {
    return;
  }


  box.classList.toggle(
    "hidden"
  );

}


/* =========================
   SUBMIT TASK
========================= */

async function submitTask(
  taskId
) {

  if (!currentUser) {

    alert(
      "Please login first."
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


  /* ---------------------------------
     FIND TASK
  --------------------------------- */

  const {
    data: task,
    error: taskError
  } =
    await supabaseClient
      .from("tasks")
      .select(`
        id,
        proof_type
      `)
      .eq(
        "id",
        taskId
      )
      .maybeSingle();


  if (taskError) {

    console.error(
      "Task lookup error:",
      taskError
    );

    if (resultElement) {

      resultElement.innerHTML =
        `<div class="status">
          Unable to verify task.
        </div>`;

    }

    return;
  }


  if (!task) {

    if (resultElement) {

      resultElement.innerHTML =
        `<div class="status">
          Task not found.
        </div>`;

    }

    return;
  }


  const proofType =
    task.proof_type || "text";


  /* ---------------------------------
     TEXT / LINK PROOF
  --------------------------------- */

  if (
    proofType === "text" ||
    proofType === "link"
  ) {

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


    if (
      proofType === "link"
    ) {

      if (!safeProofUrl(proof)) {

        if (resultElement) {

          resultElement.innerHTML =
            `<div class="status">
              Please enter a valid HTTP/HTTPS proof link.
            </div>`;

        }

        return;
      }

    }


    if (resultElement) {

      resultElement.innerHTML =
        `<div class="status">
          Submitting...
        </div>`;

    }


    const {
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

      console.error(
        "Submit task error:",
        error
      );


      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            ${escapeHtml(
              error.message
            )}
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

    return;
  }


  /* ---------------------------------
     ATTACHMENT PROOF
  --------------------------------- */

  if (
    proofType === "attachment"
  ) {

    const file =
      proofElement?.files?.[0];


    if (!file) {

      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            Please select a screenshot or image.
          </div>`;

      }

      return;
    }


    if (
      !file.type ||
      !file.type.startsWith(
        "image/"
      )
    ) {

      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            Only image files are allowed.
          </div>`;

      }

      return;
    }


    /*
      5 MB maximum.
    */

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            Image must be 5 MB or smaller.
          </div>`;

      }

      return;
    }


    if (resultElement) {

      resultElement.innerHTML =
        `<div class="status">
          Uploading proof...
        </div>`;

    }


    try {

      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      const fileName =
        `${currentUser.id}/` +
        `${taskId}/` +
        `${Date.now()}.` +
        extension;


      const {
        error: uploadError
      } =
        await supabaseClient
          .storage
          .from("task-proofs")
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      if (uploadError) {

        console.error(
          "Proof upload error:",
          uploadError
        );


        if (resultElement) {

          resultElement.innerHTML =
            `<div class="status">
              ❌ Proof upload failed.
              <br><br>
              ${escapeHtml(
                uploadError.message
              )}
            </div>`;

        }

        return;
      }


      /*
        Store the storage path as proof.
        Admin can use this path to access
        the uploaded image.
      */

      const proofPath =
        fileName;


      const {
        error: submitError
      } =
        await supabaseClient.rpc(
          "submit_task",
          {
            p_task_id: taskId,
            p_proof: proofPath
          }
        );


      if (submitError) {

        console.error(
          "Submit attachment error:",
          submitError
        );


        /*
          Remove uploaded file if
          submission itself failed.
        */

        await supabaseClient
          .storage
          .from("task-proofs")
          .remove([
            fileName
          ]);


        if (resultElement) {

          resultElement.innerHTML =
            `<div class="status">
              ❌ ${escapeHtml(
                submitError.message
              )}
            </div>`;

        }

        return;
      }


      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            ✅ Screenshot submitted successfully.
            Your task is now pending review.
          </div>`;

      }


      if (proofElement) {

        proofElement.value = "";

      }


      await loadSubmissions();


    } catch (error) {

      console.error(
        "Attachment submission error:",
        error
      );


      if (resultElement) {

        resultElement.innerHTML =
          `<div class="status">
            ❌ Unable to submit attachment.
            <br><br>
            ${escapeHtml(
              error?.message ||
              "Unknown error"
            )}
          </div>`;

      }

    }


    return;
  }


  if (resultElement) {

    resultElement.innerHTML =
      `<div class="status">
        Invalid proof type.
      </div>`;

  }

}


/* =========================
   SUBMISSIONS
========================= */

async function loadSubmissions() {

  if (!currentUser) {
    return;
  }


  const submissionList =
    document.getElementById(
      "submissionList"
    );


  if (!submissionList) {
    return;
  }


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

    console.error(
      "Submission error:",
      error
    );


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
            ${Number(
              item.reward
            )}
            Coins
          </span>

          <br>

          Status:
          <strong>
            ${escapeHtml(
              item.status
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
   WITHDRAWAL
========================= */

async function requestWithdrawal() {

  if (!currentUser) {

    alert(
      "Please login first."
    );

    return;
  }


  const methodElement =
    document.getElementById(
      "withdrawMethod"
    );


  const accountElement =
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


  const method =
    methodElement
      ? methodElement.value
      : "";


  const accountDetails =
    accountElement
      ? accountElement.value.trim()
      : "";


  const amount =
    amountElement
      ? Number(
          amountElement.value
        )
      : 0;


  if (!method) {

    if (message) {

      message.innerHTML =
        `<div class="status">
          Select a payment method.
        </div>`;

    }

    return;
  }


  if (!accountDetails) {

    if (message) {

      message.innerHTML =
        `<div class="status">
          Enter your payment account.
        </div>`;

    }

    return;
  }


  if (
    !Number.isInteger(amount) ||
    amount <= 0
  ) {

    if (message) {

      message.innerHTML =
        `<div class="status">
          Enter a valid withdrawal amount.
        </div>`;

    }

    return;
  }


  /* ---------------------------------
     MINIMUM WITHDRAWAL
  --------------------------------- */

  if (
    amount < 110
  ) {

    if (message) {

      message.innerHTML =
        `<div class="status">
          Minimum withdrawal is 110 Coins.
        </div>`;

    }

    return;
  }


  if (message) {

    message.innerHTML =
      `<div class="status">
        Processing withdrawal...
      </div>`;

  }


  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "request_withdrawal",
      {
        p_amount: amount,
        p_method: method,
        p_account_details:
          accountDetails
      }
    );


  if (error) {

    console.error(
      "Withdrawal error:",
      error
    );


    if (message) {

      message.innerHTML =
        `<div class="status">
          ${escapeHtml(
            error.message
          )}
        </div>`;

    }

    return;
  }


  if (message) {

    message.innerHTML =
      `<div class="status">
        ✅ Withdrawal request
        submitted successfully.
      </div>`;

  }


  if (amountElement) {

    amountElement.value = "";

  }


  if (accountElement) {

    accountElement.value = "";

  }


  await loadWallet();

  await loadWithdrawals();

}


/* =========================
   WITHDRAWAL HISTORY
========================= */

async function loadWithdrawals() {

  if (!currentUser) {
    return;
  }


  const list =
    document.getElementById(
      "withdrawalList"
    );


  if (!list) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
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
      .eq(
        "user_id",
        currentUser.id
      )
      .order(
        "requested_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Withdrawal history error:",
      error
    );


    list.innerHTML =
      `<div class="status">
        Unable to load withdrawals.
      </div>`;


    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

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

          💸
          ${Number(
            item.amount
          )}
          Coins

          <br><br>

          Method:
          ${escapeHtml(
            item.method
          )}

          <br>

          Status:
          <strong>
            ${escapeHtml(
              item.status
            )}
          </strong>

          <br>

          Requested:
          ${formatDate(
            item.requested_at
          )}

          ${
            item.admin_note
              ? `
                <br>
                Admin note:
                ${escapeHtml(
                  item.admin_note
                )}
              `
              : ""
          }

        </div>
      `;

    }).join("");

}


/* =========================
   USER STATUS
========================= */

function showUserStatus(
  message
) {

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

function escapeHtml(
  value
) {

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

function safeUrl(
  value
) {

  try {

    const url =
      new URL(
        value,
        window.location.href
      );


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
   SAFE PROOF URL
========================= */

function safeProofUrl(
  value
) {

  try {

    const url =
      new URL(value);


    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );

  } catch {

    return false;

  }

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(
  value
) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return date.toLocaleString();

}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openTask =
  openTask;

window.submitTask =
  submitTask;

window.requestWithdrawal =
  requestWithdrawal;

window.logoutUser =
  logoutUser;
