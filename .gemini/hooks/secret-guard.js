const fs = require('fs');

function checkSecrets() {
    let inputData = '';
    try {
        inputData = fs.readFileSync(0, 'utf8');
    } catch (e) {
        // No input on stdin
        process.exit(0);
    }

    if (!inputData) {
        process.exit(0);
    }

    const input = JSON.parse(inputData);
    const toolName = input.tool_name;
    const toolInput = JSON.stringify(input.tool_input || {});

    // Common patterns for secrets
    const secretPatterns = [
        /AIza[0-9A-Za-z-_]{35}/, // Google API Key
        /TMDB_API_KEY\s*[:=]\s*['"][0-9a-f]{32}['"]/i, // TMDB Key
        /[0-9a-f]{32}/, // Generic 32-char hex (often TMDB keys)
        /firebase-adminsdk-[a-z0-9]+-[a-z0-9]+\.json/i, // Firebase Service Account file name
    ];

    let foundSecret = false;
    let secretMatch = '';

    for (const pattern of secretPatterns) {
        const match = toolInput.match(pattern);
        if (match) {
            foundSecret = true;
            secretMatch = match[0];
            break;
        }
    }

    if (foundSecret && (toolName === 'write_file' || toolName === 'replace')) {
        console.log(JSON.stringify({
            decision: 'deny',
            reason: `Security Policy: Potential secret detected in tool input (${secretMatch.substring(0, 4)}...). Please use environment variables or appsettings.json instead of hardcoding secrets.`,
            systemMessage: '🔒 SecretGuard blocked potentially sensitive data.'
        }));
        process.exit(0);
    }

    // Default allow
    console.log(JSON.stringify({ decision: 'allow' }));
}

checkSecrets();
