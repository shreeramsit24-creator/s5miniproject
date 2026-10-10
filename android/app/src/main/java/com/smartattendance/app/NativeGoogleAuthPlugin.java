package com.smartattendance.app;

import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {

    @PluginMethod
    public void signIn(PluginCall call) {
        String clientId = call.getString("clientId", "652946018589-ncmoasimhfq3ekdkof9vlbkqettnrstm.apps.googleusercontent.com");

        try {
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestIdToken(clientId)
                    .requestEmail()
                    .build();

            GoogleSignInClient client = GoogleSignIn.getClient(getActivity(), gso);
            // Sign out in background to ensure account chooser dialog appears cleanly without blocking
            client.signOut();
            Intent signInIntent = client.getSignInIntent();
            startActivityForResult(call, signInIntent, "handleSignInResult");
        } catch (Exception e) {
            call.reject("Failed to initialize Google Sign In: " + e.getMessage(), "INIT_FAILED", e);
        }
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        Intent data = result.getData();
        if (data == null) {
            call.reject("Google Sign-In returned no data intent.", "NO_DATA");
            return;
        }

        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            if (account != null) {
                String idToken = account.getIdToken();
                if (idToken == null || idToken.trim().isEmpty()) {
                    call.reject(
                        "Google Sign-In completed, but Google did not return an ID token. Ensure the Web Client ID is linked and the Android SHA-1 fingerprint (FE:E4:D7:75:7E:9D:F4:8D:78:38:3F:9F:EE:81:0D:81:50:94:89:37) is registered for package com.smartattendance.app in Google Cloud Console.",
                        "NO_ID_TOKEN"
                    );
                    return;
                }

                JSObject ret = new JSObject();
                ret.put("idToken", idToken);
                ret.put("email", account.getEmail());
                ret.put("displayName", account.getDisplayName());
                if (account.getPhotoUrl() != null) {
                    ret.put("photoUrl", account.getPhotoUrl().toString());
                }
                call.resolve(ret);
            } else {
                call.reject("Google Sign In returned empty account.", "EMPTY_ACCOUNT");
            }
        } catch (ApiException e) {
            int statusCode = e.getStatusCode();
            String errorMsg;
            switch (statusCode) {
                case 12501: // GoogleSignInStatusCodes.SIGN_IN_CANCELLED
                    errorMsg = "Google sign-in was cancelled by the user.";
                    break;
                case 12500: // GoogleSignInStatusCodes.SIGN_IN_FAILED
                    errorMsg = "Google sign-in failed (Code 12500). Verify device network connection and Google Play Services.";
                    break;
                case 10: // CommonStatusCodes.DEVELOPER_ERROR
                    errorMsg = "Google Sign-In DEVELOPER_ERROR (Status Code 10): Mismatched SHA-1 fingerprint or package name in Google Cloud Console. Ensure SHA-1 FE:E4:D7:75:7E:9D:F4:8D:78:38:3F:9F:EE:81:0D:81:50:94:89:37 is added for package com.smartattendance.app.";
                    break;
                case 7: // CommonStatusCodes.NETWORK_ERROR
                    errorMsg = "Google sign-in network error. Please check your internet connection.";
                    break;
                case 8: // CommonStatusCodes.INTERNAL_ERROR
                    errorMsg = "Google sign-in internal error. Please try again.";
                    break;
                default:
                    errorMsg = "Google Sign In failed with status code " + statusCode + ": " + e.getMessage();
                    break;
            }
            call.reject(errorMsg, String.valueOf(statusCode), e);
        } catch (Exception e) {
            call.reject("Unexpected error during Google Sign In: " + e.getMessage(), "UNKNOWN_ERROR", e);
        }
    }
}
