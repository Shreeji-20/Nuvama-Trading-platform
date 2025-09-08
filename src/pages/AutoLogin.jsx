import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [error, setError] = useState("");

  // Get parameters from URL
  const reqid = searchParams.get("reqid");
  const apiKey = searchParams.get("api_key") || "iBe07GpBTEbbhg"; // Default API key

  // Login form data - you can customize these values
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    api_key: apiKey,
  });

  // Nuvama login URL
  const nuvamaLoginUrl = `https://www.nuvamawealth.com/api-connect/login?api_key=${apiKey}`;

  useEffect(() => {
    if (reqid) {
      setStatus(`Auto-login initialized for request ID: ${reqid}`);
      autoFillForm(reqid);
    } else {
      setError("No request ID found in URL");
    }
  }, [reqid]);

  // Auto-fill form based on reqid
  const autoFillForm = (requestId) => {
    const predefinedLogins = {
      user1: {
        username: "your_username_1",
        password: "your_password_1",
        api_key: apiKey,
      },
      user2: {
        username: "your_username_2",
        password: "your_password_2",
        api_key: apiKey,
      },
      // Add more predefined logins as needed
    };

    if (predefinedLogins[requestId]) {
      setLoginData(predefinedLogins[requestId]);
      setStatus(`Form auto-filled for ${requestId}`);
    } else {
      setStatus(`Request ID ${requestId} found, but no predefined login data`);
    }
  };

  // Handle opening Nuvama login page with auto-fill script
  const handleOpenNuvamaLogin = () => {
    setLoading(true);
    setStatus("Opening Nuvama login page...");

    // Create the auto-fill script
    const autoFillScript = `
      // Wait for page to load
      setTimeout(() => {
        console.log('Starting multi-step auto-fill process for Nuvama...');
        
        // Step 1: Fill UserID and submit
        function fillUserIdAndSubmit() {
          const usernameField = document.querySelector('#userID');
          const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button:contains("Submit"), button:contains("Next")') || 
                              document.querySelector('button, input[type="button"]');
          
          if (usernameField) {
            console.log('Step 1: Found UserID field, filling...');
            
            // Fill username
            usernameField.value = '${loginData.username}';
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            usernameField.dispatchEvent(new Event('change', { bubbles: true }));
            usernameField.dispatchEvent(new Event('keyup', { bubbles: true }));
            
            // Highlight field
            usernameField.style.backgroundColor = '#e6ffe6';
            usernameField.style.border = '2px solid #4CAF50';
            
            console.log('UserID filled:', '${loginData.username}');
            
            // Look for submit button and click it
            if (submitButton) {
              console.log('Found submit button, clicking...');
              setTimeout(() => {
                submitButton.click();
                console.log('Submit button clicked, waiting for password form...');
                
                // Wait for password form to appear
                setTimeout(() => {
                  fillPasswordAndTotpAndProceed();
                }, 2000);
              }, 1000);
            } else {
              console.log('Submit button not found, please click manually');
              showIndicator('✅ UserID filled. Please click Submit button manually.', '#4CAF50');
            }
          } else {
            console.log('UserID field not found');
            showIndicator('❌ UserID field not found. Please fill manually.', '#f44336');
          }
        }
        
        // Step 2: Fill Password and TOTP, then proceed
        function fillPasswordAndTotpAndProceed() {
          const passwordField = document.querySelector('#password');
          const proceedButton = document.querySelector('button:contains("Proceed"), button:contains("Login"), button[type="submit"]') ||
                               document.querySelector('button, input[type="button"], input[type="submit"]');
          
          // Find TOTP fields (totp-0 to totp-6)
          const totpFields = [];
          for (let i = 0; i <= 6; i++) {
            const totpField = document.querySelector('#totp-' + i);
            if (totpField) {
              totpFields.push(totpField);
            }
          }
          
          if (passwordField) {
            console.log('Step 2: Found password field, filling...');
            
            // Fill password
            passwordField.value = '${loginData.password}';
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));
            passwordField.dispatchEvent(new Event('keyup', { bubbles: true }));
            
            // Highlight password field
            passwordField.style.backgroundColor = '#e6ffe6';
            passwordField.style.border = '2px solid #4CAF50';
            
            console.log('Password filled');
            
            // Highlight TOTP fields
            if (totpFields.length > 0) {
              console.log('Found ' + totpFields.length + ' TOTP fields, highlighting...');
              totpFields.forEach((field, index) => {
                field.style.backgroundColor = '#fff3cd';
                field.style.border = '2px solid #ffc107';
                field.style.boxShadow = '0 0 5px #ffc107';
              });
              
              showIndicator(\`
                <div style="font-weight: bold; margin-bottom: 8px;">✅ Step 2 Ready!</div>
                <div style="margin-bottom: 5px;">🔑 Password: Filled</div>
                <div style="margin-bottom: 8px;">📱 TOTP fields highlighted (\${totpFields.length} found)</div>
                <div style="font-size: 11px; padding: 5px; background: rgba(255,255,255,0.2); border-radius: 3px;">
                  Use Authenticator extension to fill TOTP, then click Proceed
                </div>
              \`, '#4CAF50');
              
              // Auto-click proceed button after TOTP is likely filled (optional - can be disabled)
              // Uncomment the following lines if you want auto-proceed after TOTP
              /*
              setTimeout(() => {
                if (proceedButton && totpFields.every(field => field.value.length > 0)) {
                  console.log('TOTP appears filled, clicking Proceed...');
                  proceedButton.click();
                  showIndicator('🚀 Proceeding to get auth token...', '#2196F3');
                }
              }, 10000); // Wait 10 seconds for TOTP to be filled
              */
              
            } else {
              console.log('No TOTP fields found');
              showIndicator('✅ Password filled. Please enter TOTP and click Proceed.', '#4CAF50');
            }
            
            // Highlight proceed button if found
            if (proceedButton) {
              proceedButton.style.backgroundColor = '#2196F3';
              proceedButton.style.color = 'white';
              proceedButton.style.border = '2px solid #1976D2';
              proceedButton.style.boxShadow = '0 0 10px #2196F3';
            }
            
          } else {
            console.log('Password field not found, retrying...');
            // Retry after 2 seconds
            setTimeout(() => {
              fillPasswordAndTotpAndProceed();
            }, 2000);
          }
        }
        
        // Helper function to show indicators
        function showIndicator(message, color) {
          // Remove existing indicator
          const existingIndicator = document.querySelector('#nuvama-auto-indicator');
          if (existingIndicator) {
            existingIndicator.remove();
          }
          
          const indicator = document.createElement('div');
          indicator.id = 'nuvama-auto-indicator';
          indicator.innerHTML = message;
          indicator.style.cssText = \`
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, \${color}, \${color}dd);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 9999;
            max-width: 280px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
          \`;
          document.body.appendChild(indicator);
          
          // Auto-remove after 15 seconds
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 15000);
        }
        
        // Start the process
        fillUserIdAndSubmit();
        
      }, 2000);
    `;

    // Open the Nuvama login page
    const newWindow = window.open(nuvamaLoginUrl, "_blank");

    if (newWindow) {
      setStatus("Nuvama login page opened. Auto-fill script will run...");

      // Inject the auto-fill script after page loads
      setTimeout(() => {
        try {
          newWindow.eval(autoFillScript);
        } catch (e) {
          console.log(
            "Could not inject script (CORS limitation). Manual login required."
          );
          setStatus(
            "Page opened. Please login manually and use Authenticator for TOTP."
          );
        }
      }, 3000);

      // Listen for window close or URL changes to detect login completion
      const checkInterval = setInterval(() => {
        try {
          if (newWindow.closed) {
            clearInterval(checkInterval);
            setStatus("Login window closed. Check if login was successful.");
            setLoading(false);
            return;
          }

          // Check if URL changed (indicating successful login)
          const currentUrl = newWindow.location.href;
          if (currentUrl !== nuvamaLoginUrl && !currentUrl.includes("login")) {
            clearInterval(checkInterval);
            setStatus("Login appears successful! Checking for auth token...");

            // Try to extract token from URL
            const urlParams = new URLSearchParams(newWindow.location.search);
            const token =
              urlParams.get("request_id") ||
              urlParams.get("authToken") ||
              urlParams.get("access_token") ||
              urlParams.get("auth_token");

            if (token) {
              setAuthToken(token);
              localStorage.setItem("authToken", token);
              setStatus("Auth token extracted successfully!");
              newWindow.close();
            }
            setLoading(false);
          }
        } catch (e) {
          // CORS error - can't access window location
          // This is expected for external domains
        }
      }, 1000);

      // Stop checking after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!newWindow.closed) {
          setStatus("Auto-monitoring stopped. Please complete login manually.");
        }
        setLoading(false);
      }, 300000);
    } else {
      setError(
        "Could not open login page. Please check popup blocker settings."
      );
      setLoading(false);
    }
  };

  // Direct navigation method (fallback)
  const handleDirectNavigation = () => {
    const loginUrl = `${nuvamaLoginUrl}&username=${encodeURIComponent(
      loginData.username
    )}&password=${encodeURIComponent(loginData.password)}`;
    window.open(loginUrl, "_blank");
    setStatus("Opened Nuvama login page with pre-filled URL parameters.");
  };

  // Extract token from current URL (if redirected back)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl =
      urlParams.get("token") ||
      urlParams.get("authToken") ||
      urlParams.get("access_token") ||
      urlParams.get("auth_token");

    if (tokenFromUrl) {
      setAuthToken(tokenFromUrl);
      setStatus("Auth token extracted from URL!");
      localStorage.setItem("authToken", tokenFromUrl);
    }
  }, []);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-light-card-gradient dark:bg-dark-card-gradient rounded-xl shadow-light-lg dark:shadow-dark-xl border border-light-border dark:border-dark-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Nuvama Auto Login
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Request ID: {reqid || "Not provided"}
          </p>
          <p className="text-light-text-muted dark:text-dark-text-muted text-xs mt-1">
            API Key: {apiKey}
          </p>
        </div>

        {/* Status Messages */}
        {status && (
          <div className="mb-4 p-3 bg-light-info/20 dark:bg-dark-info/20 border border-light-info dark:border-dark-info rounded-lg">
            <p className="text-light-text-primary dark:text-dark-text-primary text-sm">
              {status}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-light-error/20 dark:bg-dark-error/20 border border-light-error dark:border-dark-error rounded-lg">
            <p className="text-light-error dark:text-dark-error text-sm">
              {error}
            </p>
          </div>
        )}

        {authToken && (
          <div className="mb-4 p-3 bg-light-success/20 dark:bg-dark-success/20 border border-light-success dark:border-dark-success rounded-lg">
            <p className="text-light-success dark:text-dark-success text-sm font-medium">
              Auth Token Acquired!
            </p>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs mt-1 break-all">
              {authToken}
            </p>
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Username
            </label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
              placeholder="Enter Nuvama username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
              placeholder="Enter Nuvama password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              API Key
            </label>
            <input
              type="text"
              value={loginData.api_key}
              onChange={(e) => handleInputChange("api_key", e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent"
              placeholder="API Key"
            />
          </div>

          {/* TOTP Notice */}
          <div className="p-3 bg-light-warning/20 dark:bg-dark-warning/20 border border-light-warning dark:border-dark-warning rounded-lg">
            <p className="text-light-warning dark:text-dark-warning text-sm">
              📱 For TOTP: Use your Authenticator Chrome extension when prompted
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleOpenNuvamaLogin}
              disabled={loading || !loginData.username || !loginData.password}
              className="w-full px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Opening Nuvama Login..." : "🚀 Auto Login to Nuvama"}
            </button>

            <button
              onClick={handleDirectNavigation}
              disabled={!loginData.username || !loginData.password}
              className="w-full px-4 py-2 bg-light-info dark:bg-dark-info text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔗 Open Nuvama Login (Manual)
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 bg-light-muted dark:bg-dark-muted text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
          <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            How it works:
          </h4>
          <ul className="text-xs text-light-text-secondary dark:text-dark-text-secondary space-y-1">
            <li>• Fill username and password above</li>
            <li>• Click "Auto Login" to open Nuvama with auto-filled fields</li>
            <li>• Use Authenticator extension for TOTP when prompted</li>
            <li>• Auth token will be extracted automatically</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-light-text-muted dark:text-dark-text-muted">
              Debug Information
            </summary>
            <div className="mt-2 space-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
              <p>Request ID: {reqid || "None"}</p>
              <p>API Key: {apiKey}</p>
              <p>Nuvama URL: {nuvamaLoginUrl}</p>
              <p>Auth Token: {authToken ? "Present" : "Not acquired"}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AutoLogin;
