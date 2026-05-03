const suspiciousSqlPatterns = [
  /'/,
  /--/,
  /;/,
  /\/\*/,
  /\bOR\b/i,
  /\bUNION\b/i,
  /\bSELECT\b/i,
  /\bDROP\b/i
];

function isSuspiciousInput(value) {
  if (typeof value !== 'string') {
    return false;
  }

  return suspiciousSqlPatterns.some(pattern => pattern.test(value));
}

module.exports = {
  isSuspiciousInput
};
