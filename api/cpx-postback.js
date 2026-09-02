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


export default async function handler(req, res) {

  // Only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }


  try {

    const body = req.body || {};


    /*
      CPX parameters
    */

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


    /*
      Basic validation
    */

    if (
      !transId ||
      !userId ||
      !receivedHash ||
      !CPX_APP_SECURE_HASH
    ) {

      return res.status(400).json({
        success: false,
        error: "Missing required parameters"
      });

    }


    /*
      CPX secure hash:
      MD5(trans_id + "-" + app_secure_hash)
    */

    const expectedHash =
      md5(
        transId +
        "-" +
        CPX_APP_SECURE_HASH
      );


    /*
      Constant-time hash comparison
    */

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

      return res.status(403).json({
        success: false,
        error: "Invalid secure hash"
      });

    }


    /*
      Only accept known CPX statuses
    */

    if (
      status !== 1 &&
      status !== 2
    ) {

      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });

    }


    /*
      Call secure Supabase RPC
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


    const rpcText =
      await rpcResponse.text();


    if (!rpcResponse.ok) {

      console.error(
        "Supabase RPC error:",
        rpcText
      );

      return res.status(500).json({
        success: false,
        error: "Database processing failed"
      });

    }


    let rpcResult;

    try {
      rpcResult =
        JSON.parse(rpcText);
    } catch {
      rpcResult =
        rpcText;
    }


    /*
      Success response to CPX
    */

    return res.status(200).json({
      success: true,
      result: rpcResult
    });


  } catch (error) {

    console.error(
      "CPX postback error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });

  }

}
