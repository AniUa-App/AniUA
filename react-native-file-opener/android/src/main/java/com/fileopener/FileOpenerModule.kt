package com.fileopener

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class FileOpenerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FileOpener"
    }

    /**
     * Open a file with an external application
     */
    @ReactMethod
    fun openFile(filePath: String, mimeType: String, promise: Promise) {
        try {
            val file = File(filePath)
            
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File does not exist: $filePath")
                return
            }

            if (!file.canRead()) {
                promise.reject("FILE_NOT_READABLE", "File is not readable: $filePath")
                return
            }

            val uri: Uri = FileProvider.getUriForFile(
                reactApplicationContext,
                "${reactApplicationContext.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            // Check if there's an app to handle this intent
            if (intent.resolveActivity(reactApplicationContext.packageManager) != null) {
                val chooser = Intent.createChooser(intent, "Open file")
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(chooser)
                promise.resolve("File opened successfully")
            } else {
                promise.reject("NO_APP_FOUND", "No application found to open this file type: $mimeType")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to open file: ${e.message}", e)
        }
    }

    /**
     * Check if a file exists
     */
    @ReactMethod
    fun checkFileExists(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            promise.resolve(file.exists())
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to check file existence: ${e.message}", e)
        }
    }

    /**
     * Get file information
     */
    @ReactMethod
    fun getFileInfo(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            val info = Arguments.createMap().apply {
                putString("path", file.absolutePath)
                putString("name", file.name)
                putBoolean("exists", file.exists())
                putBoolean("isFile", file.isFile)
                putBoolean("isDirectory", file.isDirectory)
                putBoolean("canRead", file.canRead())
                putBoolean("canWrite", file.canWrite())
                putDouble("size", file.length().toDouble())
                putString("lastModified", SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                    .format(Date(file.lastModified())))
            }
            promise.resolve(info)
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to get file info: ${e.message}", e)
        }
    }

    /**
     * Get MIME type from file extension
     */
    @ReactMethod
    fun getMimeType(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            val extension = file.extension.lowercase()
            val mimeType = when (extension) {
                "pdf" -> "application/pdf"
                "doc", "docx" -> "application/msword"
                "xls", "xlsx" -> "application/vnd.ms-excel"
                "ppt", "pptx" -> "application/vnd.ms-powerpoint"
                "txt" -> "text/plain"
                "html", "htm" -> "text/html"
                "css" -> "text/css"
                "js" -> "application/javascript"
                "json" -> "application/json"
                "xml" -> "application/xml"
                "jpg", "jpeg" -> "image/jpeg"
                "png" -> "image/png"
                "gif" -> "image/gif"
                "bmp" -> "image/bmp"
                "webp" -> "image/webp"
                "mp4" -> "video/mp4"
                "avi" -> "video/x-msvideo"
                "mkv" -> "video/x-matroska"
                "mp3" -> "audio/mpeg"
                "wav" -> "audio/wav"
                "ogg" -> "audio/ogg"
                "zip" -> "application/zip"
                "rar" -> "application/x-rar-compressed"
                "7z" -> "application/x-7z-compressed"
                else -> "application/octet-stream"
            }
            promise.resolve(mimeType)
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to get MIME type: ${e.message}", e)
        }
    }

    /**
     * Open file with auto-detected MIME type
     */
    @ReactMethod
    fun openFileAuto(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            val extension = file.extension.lowercase()
            val mimeType = when (extension) {
                "pdf" -> "application/pdf"
                "doc", "docx" -> "application/msword"
                "xls", "xlsx" -> "application/vnd.ms-excel"
                "ppt", "pptx" -> "application/vnd.ms-powerpoint"
                "txt" -> "text/plain"
                "html", "htm" -> "text/html"
                "css" -> "text/css"
                "js" -> "application/javascript"
                "json" -> "application/json"
                "xml" -> "application/xml"
                "jpg", "jpeg" -> "image/jpeg"
                "png" -> "image/png"
                "gif" -> "image/gif"
                "bmp" -> "image/bmp"
                "webp" -> "image/webp"
                "mp4" -> "video/mp4"
                "avi" -> "video/x-msvideo"
                "mkv" -> "video/x-matroska"
                "mp3" -> "audio/mpeg"
                "wav" -> "audio/wav"
                "ogg" -> "audio/ogg"
                "zip" -> "application/zip"
                "rar" -> "application/x-rar-compressed"
                "7z" -> "application/x-7z-compressed"
                else -> "application/octet-stream"
            }
            openFile(filePath, mimeType, promise)
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to open file: ${e.message}", e)
        }
    }

    /**
     * Install APK file
     */
    @ReactMethod
    fun installAPK(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)

            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "APK file does not exist: $filePath")
                return
            }

            if (!file.canRead()) {
                promise.reject("FILE_NOT_READABLE", "APK file is not readable: $filePath")
                return
            }

            val uri: Uri = FileProvider.getUriForFile(
                reactApplicationContext,
                "${reactApplicationContext.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactApplicationContext.startActivity(intent)
            promise.resolve("APK installer opened successfully")
        } catch (e: Exception) {
            promise.reject("ERROR", "Unable to install APK: ${e.message}", e)
        }
    }
} 