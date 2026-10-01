import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "savazai_atelier_stateless_captcha_secret_key_2026";

export interface CaptchaChallenge {
  question: string;
  token: string;
}

export interface CaptchaValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Generates a stateless, mathematical arithmetic challenge signed with HMAC-SHA256.
 * The solution is never exposed to the client in plaintext.
 */
export function generateCaptchaChallenge(): CaptchaChallenge {
  // Generate friendly arithmetic numbers
  const isAddition = Math.random() > 0.3; // 70% addition, 30% subtraction
  const num1 = Math.floor(Math.random() * 20) + 1; // 1 to 20
  const num2 = Math.floor(Math.random() * 10) + 1; // 1 to 10

  let question = "";
  let solution = 0;

  if (isAddition || num1 < num2) {
    question = `What is ${num1} + ${num2}?`;
    solution = num1 + num2;
  } else {
    question = `What is ${num1} - ${num2}?`;
    solution = num1 - num2;
  }

  const solutionStr = String(solution);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const nonce = crypto.randomBytes(8).toString("hex");

  // Hash the solution with nonce so it cannot be extracted or reversed
  const solutionHash = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(`${solutionStr}:${nonce}`)
    .digest("hex");

  // Sign the payload (solutionHash + expiresAt + nonce)
  const payloadToSign = `${solutionHash}:${expiresAt}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payloadToSign)
    .digest("hex");

  // Token: Base64(solutionHash:expiresAt:nonce:signature)
  const token = Buffer.from(
    `${solutionHash}:${expiresAt}:${nonce}:${signature}`
  ).toString("base64");

  return {
    question,
    token,
  };
}

/**
 * Validates the user's submitted answer against the signed CAPTCHA token.
 */
export function verifyCaptchaChallenge(
  token: string | null | undefined,
  answer: string | number | null | undefined
): CaptchaValidationResult {
  if (!token || answer === undefined || answer === null || String(answer).trim() === "") {
    return { valid: false, error: "Please complete the CAPTCHA verification challenge." };
  }

  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parts = raw.split(":");
    if (parts.length !== 4) {
      return { valid: false, error: "Malformed CAPTCHA challenge token." };
    }

    const [solutionHash, expiresAtStr, nonce, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false, error: "CAPTCHA challenge has expired. Please refresh the challenge." };
    }

    // Verify token HMAC signature
    const payloadToSign = `${solutionHash}:${expiresAtStr}:${nonce}`;
    const expectedSignature = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(payloadToSign)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, error: "Invalid CAPTCHA signature." };
    }

    // Verify user answer
    const cleanedAnswer = String(answer).trim();
    const candidateHash = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(`${cleanedAnswer}:${nonce}`)
      .digest("hex");

    const candBuf = Buffer.from(candidateHash);
    const targetBuf = Buffer.from(solutionHash);
    if (candBuf.length !== targetBuf.length || !crypto.timingSafeEqual(candBuf, targetBuf)) {
      return { valid: false, error: "Incorrect CAPTCHA answer. Please try again." };
    }

    return { valid: true };
  } catch (err) {
    console.error("[CaptchaValidator] Validation error:", err);
    return { valid: false, error: "Could not validate CAPTCHA challenge." };
  }
}
