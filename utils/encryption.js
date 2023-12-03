const crypto = require("crypto");

const generateKey = () => {
  const encryptionKey = crypto.randomBytes(32).toString("hex");

  return encryptionKey;
};

const encryptText = (text, key) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let ciphertext = cipher.update(text, "utf8", "hex");
    ciphertext += cipher.final("hex");
    return { ciphertext, iv: iv.toString("hex") };
  } catch (error) {
    throw error;
  }
};

const decryptText = (cipherText, key, iv) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decryptedText = decipher.update(cipherText, "hex", "utf8");
  decryptedText += decipher.final("utf8");
  return decryptedText;
};

module.exports = {
  generateKey,
  encryptText,
  decryptText,
};
