import crypto from "crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const CPX_APP_SECURE_HASH =
  process.env.CPX_APP_SECURE_HASH;


function md5(value) {
  return crypto
    .createHash("md5")
    .update(value)
    .digest("hex");
}


function getData(req) {
  // GET request
  if (req.method === "GET") {
    return req.query || {};
  }

  // POST request
  return req.body || {};
}


export default async function handler(req, res) {

  // CPX postback can be received through GET or POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {

    const body = getData(req);

    const status =
      Number(body.status);

    const transId =
      String(body.trans_id || "");

    const userId =
      String(body.user_id || "");

    const amountLocal =
      String(body.amount_local || "0");

    const amountUsd =
      Number(body.amount_usd || 0);

    const offerId =
      body.offer_id
        ? String(body.offer_id)
        : null;

    const subId =
      body.sub_id
        ? String(body.sub_id)
        : null;

    const subId2 =
      body.sub_id_2
        ? String(body.sub_id_2)
        : null;

    const transactionType =
      body.type
        ? String(body.type)
        : null;

    const ipClick =
      body.ip_click
        ? String(body.ip_click)
        : null;

    const receivedHash =
      String(body.hash || "");


    // Check required environment variables
    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !CPX_APP_SECURE_HASH
    ) {
      console.error(
        "Missing server environment variables"
      );

      return res.status(500).send("Server configuration error");
    }


    // Check required CPX parameters
    if (
      !transId ||
      !userId ||
      !receivedHash
    ) {
      return res.status(400).send(
        "Missing required parameters"
      );
    }


    // CPX secure hash:
    // MD5(trans_id-APP_SECURE_HASH)

    const expectedHash =
      md5(
        transId +
        "-" +
        CPX_APP_SECURE_HASH
      );


    // Timing-safe hash comparison
    const receivedBuffer =
      Buffer.from(receivedHash);

    const expectedBuffer =
      Buffer.from(expectedHash);

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

      return res.status(403).send(
        "Invalid secure hash"
      );
    }


    // CPX status:
    // 1 = completed / credit
    // 2 = reversed / chargeback

    if (
      status !== 1 &&
      status !== 2
    ) {
      return res.status(400).send(
        "Invalid status"
      );
    }


    // Send transaction to Supabase RPC

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


    const rpcText =
      await rpcResponse.text();


    if (!rpcResponse.ok) {

      console.error(
        "Supabase RPC error:",
        rpcText
      );

      return res.status(500).send(
        "Database processing failed"
      );
    }


    let rpcResult;

    try {
      rpcResult =
        JSON.parse(rpcText);
    } catch {
      rpcResult =
        rpcText;
    }


    console.log(
      "CPX postback processed:",
      {
        transId,
        userId,
        status,
        amountLocal,
        rpcResult
      }
    );


    // CPX successfully received
    return res.status(200).send("OK");


  } catch (error) {

    console.error(
      "CPX postback error:",
      error
    );

    return res.status(500).send(
      "Internal server error"
    );
  }
}
