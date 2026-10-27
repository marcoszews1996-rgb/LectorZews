package com.lectorzews.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

/**
 * Foreground Service for persistent audio playback and text-to-speech reading in background.
 * Prevents Android from killing or suspending TTS and audio when the user locks screen,
 * presses the home button, or uses other applications.
 */
public class AudioPlaybackService extends Service {
    private static final String TAG = "AudioPlaybackService";
    public static final String ACTION_START = "com.lectorzews.app.START_FOREGROUND";
    public static final String ACTION_STOP = "com.lectorzews.app.STOP_FOREGROUND";
    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_TEXT = "extra_text";
    public static final String CHANNEL_ID = "lectorzews_audio_playback";
    public static final int NOTIF_ID = 2001;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "LectorZews - Lectura en Segundo Plano",
                    NotificationManager.IMPORTANCE_LOW
                );
                channel.setDescription("Mantiene la lectura de voz activa al salir de la app o bloquear el teléfono");
                channel.setShowBadge(false);
                nm.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE);
                } else {
                    stopForeground(true);
                }
                stopSelf();
                return START_NOT_STICKY;
            }

            String title = intent.getStringExtra(EXTRA_TITLE);
            String text = intent.getStringExtra(EXTRA_TEXT);
            if (title == null || title.isEmpty()) title = "LectorZews";
            if (text == null || text.isEmpty()) text = "Leyendo en voz alta en segundo plano";

            Notification notification = buildNotification(title, text);
            try {
                if (Build.VERSION.SDK_INT >= 34) { // Android 14+
                    startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) { // Android 10-13
                    startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                } else {
                    startForeground(NOTIF_ID, notification);
                }
            } catch (Exception e) {
                Log.w(TAG, "Error starting foreground service: ", e);
            }
        }
        return START_STICKY;
    }

    private Notification buildNotification(String title, String text) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_UPDATE_CURRENT
        );

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        builder.setContentTitle(title)
               .setContentText(text)
               .setSmallIcon(R.mipmap.ic_launcher)
               .setContentIntent(pendingIntent)
               .setOngoing(true);

        return builder.build();
    }

    @Override
    public void onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        super.onDestroy();
    }
}
