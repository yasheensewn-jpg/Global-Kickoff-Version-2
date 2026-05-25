package com.finandflow.globalkickoff;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        View decorView = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
            int bottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
            float density = getResources().getDisplayMetrics().density;
            int bottomDp = Math.round(bottom / density);
            
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().post(() -> {
                    this.bridge.getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('nativeSafeAreaChanged', { detail: { bottom: " + bottomDp + " } }));", 
                        null
                    );
                });
            }
            return ViewCompat.onApplyWindowInsets(v, insets);
        });
    }
}
