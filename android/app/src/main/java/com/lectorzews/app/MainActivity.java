package com.lectorzews.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.os.PowerManager;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class MainActivity extends Activity {
    private static final String TAG = "LectorZewsApp";
    private static final String APP_HOST = "lectorzews.app";
    private static final String APP_URL = "https://" + APP_HOST + "/index.html";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private AndroidTTSBridge ttsBridge;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Native App: Hide status bar, title bar, and navigation bar for true 100% full-screen app experience
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (getActionBar() != null) {
            getActionBar().hide();
        }
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Hide system status bar & navigation bar (sticky immersive)
        hideSystemBars();

        // Android 13+ (API 33+) Runtime Notification Permission for background audio controls
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1002);
            }
        }

        webView = new WebView(this);
        // Ensure WebView layout occupies 100% of the screen match_parent edge-to-edge
        webView.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        // Set dark background matching the app theme (#0c0a09) to avoid white screen flash
        webView.setBackgroundColor(0xFF0c0a09);
        setContentView(webView);

        // Initialize Native Android TextToSpeech Bridge for real high-fidelity voice reading
        ttsBridge = new AndroidTTSBridge(this);
        webView.addJavascriptInterface(ttsBridge, "AndroidTTS");

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Identify as Native App in user agent so web UI suppresses browser install banners
        String defaultUa = settings.getUserAgentString();
        settings.setUserAgentString((defaultUa != null ? defaultUa : "") + " LectorZewsNative");

        // Hardware acceleration for smooth UI and animations
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if (host != null && (host.equalsIgnoreCase(APP_HOST) || host.equalsIgnoreCase("localhost") || host.equalsIgnoreCase("appassets.androidplatform.net"))) {
                    return false; // Let WebView handle internal application navigation
                }
                // Open external links in external system browser
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    Log.e(TAG, "Error opening external url: " + uri, e);
                    return false;
                }
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if (host != null && (host.equalsIgnoreCase(APP_HOST) || host.equalsIgnoreCase("localhost") || host.equalsIgnoreCase("appassets.androidplatform.net"))) {
                    String path = uri.getPath();
                    if (path == null || path.isEmpty() || path.equals("/")) {
                        path = "index.html";
                    }
                    while (path.startsWith("/")) {
                        path = path.substring(1);
                    }

                    try {
                        InputStream is = getAssets().open(path);
                        String mimeType = getMimeType(path);
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        headers.put("Cache-Control", "no-cache");
                        return new WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, is);
                    } catch (IOException e) {
                        // Fallback to index.html for SPA routes if not an asset file
                        if (!path.startsWith("assets/")) {
                            try {
                                InputStream is = getAssets().open("index.html");
                                Map<String, String> headers = new HashMap<>();
                                headers.put("Access-Control-Allow-Origin", "*");
                                return new WebResourceResponse("text/html", "UTF-8", 200, "OK", headers, is);
                            } catch (IOException ignored) {}
                        }
                        Log.w(TAG, "Asset not found: " + path);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                Log.e(TAG, "WebView error: " + description + " (" + errorCode + ") for " + failingUrl);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "[JS Console] " + consoleMessage.message() + " (" + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
                return true;
            }

            // Support PDF file upload from Android storage
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/pdf");

                try {
                    startActivityForResult(Intent.createChooser(intent, "Seleccionar PDF para leer"), FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "No se pudo abrir el explorador de archivos", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        // Load the local app securely intercepted from APK assets
        webView.loadUrl(APP_URL);
    }

    private String getMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".ttf")) return "font/ttf";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    /**
     * Hides the system status bar and navigation bar completely (Immersive Sticky Mode)
     * for a 100% border-to-border native full-screen experience with zero URL or browser chrome.
     */
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error hiding insets on Android R+", e);
            }
        } else {
            try {
                View decorView = getWindow().getDecorView();
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                );
            } catch (Exception e) {
                Log.w(TAG, "Error setting systemUiVisibility", e);
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "MainActivity onPause - background audio remains active");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "MainActivity onStop - native background audio reading continues");
    }

    @Override
    protected void onDestroy() {
        if (ttsBridge != null) {
            ttsBridge.shutdown();
            ttsBridge = null;
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    /**
     * Native Android TextToSpeech Bridge exposing high-performance background speech
     * synthesis with persistent sentence playlist, WakeLock, and system Media Notification.
     */
    public class AndroidTTSBridge {
        private TextToSpeech tts;
        private boolean isReady = false;
        private AudioManager audioManager;
        private Context context;
        private PowerManager.WakeLock wakeLock;
        private NotificationManager notificationManager;
        private static final String NOTIF_CHANNEL_ID = "lectorzews_audio_playback";
        private static final int NOTIF_ID = 2001;

        public class PlaylistItem {
            public int pageIndex;
            public int sentenceIndex;
            public String text;

            public PlaylistItem(int pageIndex, int sentenceIndex, String text) {
                this.pageIndex = pageIndex;
                this.sentenceIndex = sentenceIndex;
                this.text = text;
            }
        }

        private final List<PlaylistItem> playlist = Collections.synchronizedList(new ArrayList<PlaylistItem>());
        private int playlistIndex = 0;
        private boolean isPlayingPlaylist = false;
        private boolean isPaused = false;
        private String currentBookTitle = "LectorZews";
        private float currentRate = 1.0f;
        private float currentPitch = 1.0f;
        private String currentLang = "es-ES";

        public AndroidTTSBridge(Context context) {
            this.context = context;
            this.audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
            initNotifications();
            initTTS();
        }

        private void initNotifications() {
            try {
                notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && notificationManager != null) {
                    NotificationChannel channel = new NotificationChannel(
                        NOTIF_CHANNEL_ID,
                        "LectorZews - Lectura en Segundo Plano",
                        NotificationManager.IMPORTANCE_LOW
                    );
                    channel.setDescription("Controles de audio y narración en segundo plano");
                    channel.setShowBadge(false);
                    notificationManager.createNotificationChannel(channel);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error initializing NotificationChannel", e);
            }
        }

        private void acquireWakeLock() {
            try {
                if (wakeLock == null) {
                    PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                    if (pm != null) {
                        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "LectorZews:AudioKeepAlive");
                    }
                }
                if (wakeLock != null && !wakeLock.isHeld()) {
                    wakeLock.acquire(12 * 60 * 60 * 1000L); // Max 12 hours timeout
                    Log.i(TAG, "Partial WakeLock acquired for background audio");
                }
            } catch (Exception e) {
                Log.w(TAG, "Error acquiring wake lock", e);
            }
        }

        private void releaseWakeLock() {
            try {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                    Log.i(TAG, "Partial WakeLock released");
                }
            } catch (Exception e) {
                Log.w(TAG, "Error releasing wake lock", e);
            }
        }

        private void updateNotification(String title, String contentText, boolean isOngoing) {
            if (notificationManager == null) return;
            try {
                Intent openAppIntent = new Intent(context, MainActivity.class);
                openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                PendingIntent contentPendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    openAppIntent,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT
                );

                Notification.Builder builder;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    builder = new Notification.Builder(context, NOTIF_CHANNEL_ID);
                } else {
                    builder = new Notification.Builder(context);
                }

                builder.setContentTitle(title)
                       .setContentText(contentText)
                       .setSmallIcon(R.mipmap.ic_launcher)
                       .setContentIntent(contentPendingIntent)
                       .setOngoing(isOngoing)
                       .setAutoCancel(!isOngoing);

                notificationManager.notify(NOTIF_ID, builder.build());
            } catch (Exception e) {
                Log.w(TAG, "Error updating notification", e);
            }
        }

        private void clearNotification() {
            if (notificationManager != null) {
                try {
                    notificationManager.cancel(NOTIF_ID);
                } catch (Exception ignored) {}
            }
        }

        private void initTTS() {
            tts = new TextToSpeech(context, new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    if (status == TextToSpeech.SUCCESS) {
                        isReady = true;
                        tts.setLanguage(new Locale("es", "ES"));
                        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override
                            public void onStart(String utteranceId) {
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("if (window.__onAndroidTTSStart) window.__onAndroidTTSStart('" + escapeJs(utteranceId) + "');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onDone(String utteranceId) {
                                // Native automatic queue progression: Runs on native thread, unaffected by WebView sleep!
                                if (isPlayingPlaylist && !isPaused) {
                                    playlistIndex++;
                                    if (playlistIndex < playlist.size()) {
                                        speakCurrentPlaylistItem();
                                        return;
                                    } else {
                                        isPlayingPlaylist = false;
                                        releaseWakeLock();
                                        clearNotification();
                                        runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                if (webView != null) {
                                                    webView.evaluateJavascript("if (window.__onAndroidTTSQueueFinished) window.__onAndroidTTSQueueFinished();", null);
                                                }
                                            }
                                        });
                                        return;
                                    }
                                }

                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("if (window.__onAndroidTTSDone) window.__onAndroidTTSDone('" + escapeJs(utteranceId) + "');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onError(String utteranceId) {
                                Log.e(TAG, "TTS onError for " + utteranceId);
                                if (isPlayingPlaylist && !isPaused && playlistIndex + 1 < playlist.size()) {
                                    // Skip forward smoothly if single sentence encountered an issue
                                    playlistIndex++;
                                    speakCurrentPlaylistItem();
                                    return;
                                }
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("if (window.__onAndroidTTSError) window.__onAndroidTTSError('" + escapeJs(utteranceId) + "', 'Error al sintetizar voz');", null);
                                        }
                                    }
                                });
                            }

                            @Override
                            public void onError(String utteranceId, int errorCode) {
                                Log.e(TAG, "TTS onError (" + errorCode + ") for " + utteranceId);
                                if (isPlayingPlaylist && !isPaused && playlistIndex + 1 < playlist.size()) {
                                    playlistIndex++;
                                    speakCurrentPlaylistItem();
                                    return;
                                }
                                runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        if (webView != null) {
                                            webView.evaluateJavascript("if (window.__onAndroidTTSError) window.__onAndroidTTSError('" + escapeJs(utteranceId) + "', 'Error código " + errorCode + "');", null);
                                        }
                                    }
                                });
                            }
                        });

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                if (webView != null) {
                                    webView.evaluateJavascript("if (window.__onAndroidTTSReady) window.__onAndroidTTSReady();", null);
                                }
                            }
                        });
                        Log.i(TAG, "Native Android TextToSpeech is READY!");
                    } else {
                        Log.e(TAG, "Native Android TextToSpeech failed initialization: " + status);
                    }
                }
            });
        }

        private String escapeJs(String str) {
            if (str == null) return "";
            return str.replace("\\", "\\\\")
                      .replace("'", "\\'")
                      .replace("\"", "\\\"")
                      .replace("\n", " ")
                      .replace("\r", " ");
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return isReady && tts != null;
        }

        private void applyLocale(String langCode) {
            if (tts == null || !isReady || langCode == null || langCode.isEmpty()) return;
            try {
                Locale targetLocale;
                if (langCode.contains("-")) {
                    String[] parts = langCode.split("-");
                    targetLocale = new Locale(parts[0], parts[1]);
                } else if (langCode.contains("_")) {
                    String[] parts = langCode.split("_");
                    targetLocale = new Locale(parts[0], parts[1]);
                } else {
                    targetLocale = new Locale(langCode);
                }
                int availability = tts.isLanguageAvailable(targetLocale);
                if (availability >= TextToSpeech.LANG_AVAILABLE) {
                    tts.setLanguage(targetLocale);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error applying locale: " + langCode, e);
            }
        }

        private void speakCurrentPlaylistItem() {
            if (tts == null || !isReady || playlist.isEmpty() || playlistIndex >= playlist.size()) return;
            try {
                PlaylistItem item = playlist.get(playlistIndex);
                if (audioManager != null) {
                    audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
                }

                applyLocale(currentLang);
                tts.setSpeechRate(currentRate > 0 ? currentRate : 1.0f);
                tts.setPitch(currentPitch > 0 ? currentPitch : 1.0f);

                Bundle params = new Bundle();
                params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                String uttId = "utt_p" + item.pageIndex + "_s" + item.sentenceIndex + "_" + System.currentTimeMillis();

                tts.speak(item.text, TextToSpeech.QUEUE_FLUSH, params, uttId);

                updateNotification(currentBookTitle, "Pág. " + (item.pageIndex + 1) + ": " + item.text, true);

                final int pIdx = item.pageIndex;
                final int sIdx = item.sentenceIndex;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (webView != null) {
                            webView.evaluateJavascript("if (window.__onAndroidTTSSentenceChange) window.__onAndroidTTSSentenceChange(" + pIdx + ", " + sIdx + ");", null);
                        }
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "Error in speakCurrentPlaylistItem", e);
            }
        }

        @JavascriptInterface
        public void playBookPlaylist(String bookTitle, String jsonPlaylist, int startIndex, float rate, float pitch, String langCode) {
            if (tts == null || !isReady) {
                Log.w(TAG, "TTS not ready for playlist playback");
                return;
            }
            try {
                currentBookTitle = (bookTitle != null && !bookTitle.isEmpty()) ? bookTitle : "LectorZews";
                currentRate = rate > 0 ? rate : 1.0f;
                currentPitch = pitch > 0 ? pitch : 1.0f;
                currentLang = (langCode != null && !langCode.isEmpty()) ? langCode : "es-ES";

                applyLocale(currentLang);

                playlist.clear();
                JSONArray arr = new JSONArray(jsonPlaylist);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    int pIdx = obj.optInt("pageIndex", 0);
                    int sIdx = obj.optInt("sentenceIndex", 0);
                    String txt = obj.optString("text", "");
                    if (!txt.trim().isEmpty()) {
                        playlist.add(new PlaylistItem(pIdx, sIdx, txt));
                    }
                }

                if (playlist.isEmpty()) {
                    Log.w(TAG, "playBookPlaylist called with empty sentences list");
                    return;
                }

                playlistIndex = Math.max(0, Math.min(startIndex, playlist.size() - 1));
                isPlayingPlaylist = true;
                isPaused = false;

                acquireWakeLock();
                speakCurrentPlaylistItem();
            } catch (Exception e) {
                Log.e(TAG, "Error in playBookPlaylist", e);
            }
        }

        @JavascriptInterface
        public void speak(String text, float rate, float pitch, String langCode, String utteranceId) {
            if (tts == null || !isReady) {
                Log.w(TAG, "TTS requested but engine not ready yet");
                return;
            }
            try {
                isPlayingPlaylist = false;
                if (audioManager != null) {
                    audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
                }

                applyLocale(langCode);
                tts.setSpeechRate(rate > 0 ? rate : 1.0f);
                tts.setPitch(pitch > 0 ? pitch : 1.0f);

                acquireWakeLock();
                Bundle params = new Bundle();
                params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId != null ? utteranceId : "utt_" + System.currentTimeMillis());
                updateNotification("LectorZews", text, true);
            } catch (Exception e) {
                Log.e(TAG, "Error in native TTS speak", e);
            }
        }

        @JavascriptInterface
        public void pause() {
            isPaused = true;
            if (tts != null) {
                tts.stop();
            }
            releaseWakeLock();
            updateNotification(currentBookTitle, "Lectura pausada", false);
        }

        @JavascriptInterface
        public void resume() {
            if (isPaused && !playlist.isEmpty() && playlistIndex < playlist.size()) {
                isPaused = false;
                acquireWakeLock();
                speakCurrentPlaylistItem();
            }
        }

        @JavascriptInterface
        public void stop() {
            isPlayingPlaylist = false;
            isPaused = false;
            playlist.clear();
            if (tts != null) {
                tts.stop();
            }
            releaseWakeLock();
            clearNotification();
        }

        @JavascriptInterface
        public void nextSentence() {
            if (!playlist.isEmpty() && playlistIndex + 1 < playlist.size()) {
                playlistIndex++;
                isPaused = false;
                acquireWakeLock();
                speakCurrentPlaylistItem();
            }
        }

        @JavascriptInterface
        public void prevSentence() {
            if (!playlist.isEmpty() && playlistIndex > 0) {
                playlistIndex--;
                isPaused = false;
                acquireWakeLock();
                speakCurrentPlaylistItem();
            }
        }

        @JavascriptInterface
        public int getCurrentPageIndex() {
            if (playlistIndex >= 0 && playlistIndex < playlist.size()) {
                return playlist.get(playlistIndex).pageIndex;
            }
            return -1;
        }

        @JavascriptInterface
        public int getCurrentSentenceIndex() {
            if (playlistIndex >= 0 && playlistIndex < playlist.size()) {
                return playlist.get(playlistIndex).sentenceIndex;
            }
            return -1;
        }

        @JavascriptInterface
        public boolean isSpeaking() {
            return (isPlayingPlaylist && !isPaused) || (tts != null && isReady && tts.isSpeaking());
        }

        @JavascriptInterface
        public void setVoiceByName(String voiceName) {
            if (tts == null || !isReady || voiceName == null || voiceName.isEmpty()) return;
            try {
                Set<Voice> voices = tts.getVoices();
                if (voices != null) {
                    for (Voice v : voices) {
                        if (v.getName().equalsIgnoreCase(voiceName)) {
                            tts.setVoice(v);
                            Log.i(TAG, "Selected native voice: " + voiceName);
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error setting voice by name: " + voiceName, e);
            }
        }

        @JavascriptInterface
        public String getVoicesJson() {
            if (tts == null || !isReady) return "[]";
            try {
                Set<Voice> voices = tts.getVoices();
                if (voices == null || voices.isEmpty()) return "[]";
                StringBuilder sb = new StringBuilder("[");
                boolean first = true;
                for (Voice v : voices) {
                    if (!first) sb.append(",");
                    first = false;
                    sb.append("{");
                    sb.append("\"name\":\"").append(escapeJs(v.getName())).append("\",");
                    sb.append("\"lang\":\"").append(escapeJs(v.getLocale().toLanguageTag())).append("\",");
                    sb.append("\"quality\":").append(v.getQuality()).append(",");
                    sb.append("\"requiresNetwork\":").append(v.isNetworkConnectionRequired());
                    sb.append("}");
                }
                sb.append("]");
                return sb.toString();
            } catch (Exception e) {
                Log.e(TAG, "Error serializing voices", e);
                return "[]";
            }
        }

        public void shutdown() {
            stop();
            if (tts != null) {
                try {
                    tts.shutdown();
                } catch (Exception ignored) {}
                tts = null;
                isReady = false;
            }
        }
    }
}


