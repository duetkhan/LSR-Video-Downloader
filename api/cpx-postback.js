import crypto from "crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const CPX_APP_SECURE_HASH =
  process.env.CPX_APP_SECURE_HASH;


/*
  MD5 helper
*/
function md5(value) {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
}


/*
  Get CPX data
  Supports GET and POST
*/
function getData(req) {

  // GET request
  if (req.method === "GET") {
    return req.query || {};
  }

  // POST request
  return req.body || {};
}


/*
  Main handler
*/
export default async function handler(req, res) {

  /*
    CPX postback can be received
    through GET or POST
  */
  if (
    req.method !== "GET" &&
    req.method !== "POST"
  ) {
    return res
      .status(405)
      .send("Method Not Allowed");
  }


  try {

    const body = getData(req);


    /*
      CPX status
      1 = completed / credit
      2 = reversed / cancelled
    */
    const status =
      Number(body.status);


    /*
      Transaction ID
    */
    const transId =
      String(body.trans_id || "");


    /*
      Supabase User ID
    */
    const userId =
      String(body.user_id || "");


    /*
      IMPORTANT:
      CPX may send amount_local as:

      1000
      1000.0000

      Our Supabase RPC expects BIGINT.

      Therefore convert it safely
      into an integer.
    */
    const amountLocal =
      Math.round(
        Number(body.amount_local || 0)
      );


    /*
      Publisher earning in USD
    */
    const amountUsd =
      Number(body.amount_usd || 0);


    /*
      Optional offer ID
    */
    const offerId =
      body.offer_id
        ? String(body.offer_id)
        : null;


    /*
      Optional sub ID 1
    */
    const subId =
      body.sub_id
        ? String(body.sub_id)
        : null;


    /*
      Optional sub ID 2
    */
    const subId2 =
      body.sub_id_2
        ? String(body.sub_id_2)
        : null;


    /*
      Transaction type
      complete / bonus / etc.
    */
    const transactionType =
      body.type
        ? String(body.type)
        : null;


    /*
      User click IP
    */
    const ipClick =
      body.ip_click
        ? String(body.ip_click)
        : null;


    /*
      Secure hash sent by CPX
    */
    const receivedHash =
      String(body.hash || "");


    /*
      Check server environment variables
    */
    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !CPX_APP_SECURE_HASH
    ) {

      console.error(
        "Missing server environment variables"
      );

      return res
        .status(500)
        .send(
          "Server configuration error"
        );
    }


    /*
      Check required CPX parameters
    */
    if (
      !transId ||
      !userId ||
      !receivedHash
    ) {

      return res
        .status(400)
        .send(
          "Missing required parameters"
        );
    }


    /*
      Validate amounts
    */
    if (
      !Number.isFinite(amountLocal) ||
      !Number.isInteger(amountLocal) ||
      amountLocal < 0
    ) {

      console.error(
        "Invalid amount_local:",
        body.amount_local
      );

      return res
        .status(400)
        .send(
          "Invalid amount_local"
        );
    }


    if (
      !Number.isFinite(amountUsd) ||
      amountUsd < 0
    ) {

      console.error(
        "Invalid amount_usd:",
        body.amount_usd
      );

      return res
        .status(400)
        .send(
          "Invalid amount_usd"
        );
    }


    /*
      CPX Secure Hash

      MD5(
        trans_id
        -
        APP_SECURE_HASH
      )
    */
    const expectedHash =
      md5(
        transId +
        "-" +
        CPX_APP_SECURE_HASH
      );


    /*
      Timing-safe hash comparison
    */
    const receivedBuffer =
      Buffer.from(
        receivedHash,
        "utf8"
      );

    const expectedBuffer =
      Buffer.from(
        expectedHash,
        "utf8"
      );


    if (
      receivedBuffer.length !==
      expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {

      console.error(
        "Invalid CPX secure hash"
      );

      return res
        .status(403)
        .send(
          "Invalid secure hash"
        );
    }


    /*
      Validate CPX status
    */
    if (
      status !== 1 &&
      status !== 2
    ) {

      return res
        .status(400)
        .send(
          "Invalid status"
        );
    }


    /*
      Send transaction to Supabase RPC
    */
    const rpcResponse =
      await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/cpx_process_transaction`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_SERVICE_ROLE_KEY,

            "Authorization":
              `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },

          body: JSON.stringify({

            p_trans_id:
              transId,

            p_user_id:
              userId,

            p_status:
              status,

            p_amount_local:
              amountLocal,

            p_amount_usd:
              amountUsd,

            p_offer_id:
              offerId,

            p_sub_id:
              subId,

            p_sub_id_2:
              subId2,

            p_transaction_type:
              transactionType,

            p_ip_click:
              ipClick
          })
        }
      );


    /*
      Read Supabase response
    */
    const rpcText =
      await rpcResponse.text();


    /*
      Supabase RPC failed
    */
    if (!rpcResponse.ok) {

      console.error(
        "Supabase RPC error:",
        rpcText
      );

      return res
        .status(500)
        .send(
          "Database processing failed"
        );
    }


    /*
      Parse RPC result
    */
    let rpcResult;

    try {

      rpcResult =
        JSON.parse(rpcText);

    } catch {

      rpcResult =
        rpcText;
    }


    /*
      Log successful transaction
    */
    console.log(
      "CPX postback processed:",
      {
        transId,
        userId,
        status,
        amountLocal,
        amountUsd,
        rpcResult
      }
    );


    /*
      CPX successfully received
    */
    return res
      .status(200)
      .send("OK");


  } catch (error) {

    console.error(
      "CPX postback error:",
      error
    );

    return res
      .status(500)
      .send(
        "Internal server error"
      );
  }
}
