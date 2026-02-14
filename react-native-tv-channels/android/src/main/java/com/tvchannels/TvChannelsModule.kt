package com.tvchannels

import android.content.ContentUris
import android.content.pm.PackageManager
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import androidx.tvprovider.media.tv.Channel
import androidx.tvprovider.media.tv.ChannelLogoUtils
import androidx.tvprovider.media.tv.PreviewProgram
import androidx.tvprovider.media.tv.TvContractCompat
import androidx.tvprovider.media.tv.WatchNextProgram
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.net.URL

class TvChannelsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val TAG = "TvChannels"

    override fun getName(): String = "TvChannels"

    override fun onCatalystInstanceDestroy() {
        scope.cancel()
    }

    // --- Helpers ---

    private fun runAsync(promise: Promise, block: suspend () -> Unit) {
        scope.launch {
            try {
                block()
            } catch (e: Exception) {
                Log.e(TAG, "Error in async operation", e)
                promise.reject("TV_CHANNELS_ERROR", e.message, e)
            }
        }
    }

    private fun downloadBitmap(url: String): Bitmap? {
        return try {
            val connection = URL(url).openConnection().apply {
                connectTimeout = 10000
                readTimeout = 10000
            }
            connection.getInputStream().use { stream ->
                BitmapFactory.decodeStream(stream)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to download bitmap from $url", e)
            null
        }
    }

    private fun parseProgramType(type: String?): Int {
        return when (type?.uppercase()) {
            "MOVIE" -> TvContractCompat.PreviewPrograms.TYPE_MOVIE
            "TV_SERIES" -> TvContractCompat.PreviewPrograms.TYPE_TV_SERIES
            "TV_EPISODE" -> TvContractCompat.PreviewPrograms.TYPE_TV_EPISODE
            "CLIP" -> TvContractCompat.PreviewPrograms.TYPE_CLIP
            "CHANNEL" -> TvContractCompat.PreviewPrograms.TYPE_CHANNEL
            else -> TvContractCompat.PreviewPrograms.TYPE_TV_EPISODE
        }
    }

    private fun parseWatchNextType(type: String?): Int {
        return when (type?.uppercase()) {
            "CONTINUE" -> TvContractCompat.WatchNextPrograms.WATCH_NEXT_TYPE_CONTINUE
            "NEXT" -> TvContractCompat.WatchNextPrograms.WATCH_NEXT_TYPE_NEXT
            "NEW" -> TvContractCompat.WatchNextPrograms.WATCH_NEXT_TYPE_NEW
            "WATCHLIST" -> TvContractCompat.WatchNextPrograms.WATCH_NEXT_TYPE_WATCHLIST
            else -> TvContractCompat.WatchNextPrograms.WATCH_NEXT_TYPE_CONTINUE
        }
    }

    private fun buildProgram(channelId: Long, data: ReadableMap): PreviewProgram {
        val builder = PreviewProgram.Builder()
            .setChannelId(channelId)
            .setTitle(data.getString("title") ?: "")
            .setType(parseProgramType(data.getString("type")))
            .setIntentUri(Uri.parse(data.getString("intentUri") ?: ""))

        if (data.hasKey("description")) {
            builder.setDescription(data.getString("description"))
        }
        if (data.hasKey("posterArtUri")) {
            builder.setPosterArtUri(Uri.parse(data.getString("posterArtUri")))
        }
        if (data.hasKey("thumbnailUri")) {
            builder.setThumbnailUri(Uri.parse(data.getString("thumbnailUri")))
        }
        if (data.hasKey("internalProviderId")) {
            builder.setInternalProviderId(data.getString("internalProviderId"))
        }
        if (data.hasKey("episodeNumber")) {
            builder.setEpisodeNumber(data.getDouble("episodeNumber").toInt())
        }
        if (data.hasKey("seasonNumber")) {
            builder.setSeasonNumber(data.getDouble("seasonNumber").toInt())
        }
        if (data.hasKey("genre")) {
            builder.setGenre(data.getString("genre"))
        }
        if (data.hasKey("durationMillis")) {
            builder.setDurationMillis(data.getDouble("durationMillis").toInt())
        }
        if (data.hasKey("lastPlaybackPositionMillis")) {
            builder.setLastPlaybackPositionMillis(data.getDouble("lastPlaybackPositionMillis").toInt())
        }
        if (data.hasKey("releaseDate")) {
            builder.setReleaseDate(data.getString("releaseDate"))
        }
        if (data.hasKey("weight")) {
            builder.setWeight(data.getDouble("weight").toInt())
        }

        return builder.build()
    }

    private fun buildWatchNextProgram(data: ReadableMap): WatchNextProgram {
        val builder = WatchNextProgram.Builder()
            .setTitle(data.getString("title") ?: "")
            .setType(parseProgramType(data.getString("type")))
            .setIntentUri(Uri.parse(data.getString("intentUri") ?: ""))
            .setWatchNextType(parseWatchNextType(data.getString("watchNextType")))

        if (data.hasKey("description")) {
            builder.setDescription(data.getString("description"))
        }
        if (data.hasKey("posterArtUri")) {
            builder.setPosterArtUri(Uri.parse(data.getString("posterArtUri")))
        }
        if (data.hasKey("internalProviderId")) {
            builder.setInternalProviderId(data.getString("internalProviderId"))
        }
        if (data.hasKey("lastEngagementTimeMillis")) {
            builder.setLastEngagementTimeUtcMillis(data.getDouble("lastEngagementTimeMillis").toLong())
        }
        if (data.hasKey("lastPlaybackPositionMillis")) {
            builder.setLastPlaybackPositionMillis(data.getDouble("lastPlaybackPositionMillis").toInt())
        }
        if (data.hasKey("durationMillis")) {
            builder.setDurationMillis(data.getDouble("durationMillis").toInt())
        }
        if (data.hasKey("episodeNumber")) {
            builder.setEpisodeNumber(data.getDouble("episodeNumber").toInt())
        }
        if (data.hasKey("genre")) {
            builder.setGenre(data.getString("genre"))
        }

        return builder.build()
    }

    private fun channelToMap(cursor: Cursor): WritableMap {
        val map = Arguments.createMap()
        val idIdx = cursor.getColumnIndex(TvContractCompat.Channels._ID)
        val nameIdx = cursor.getColumnIndex(TvContractCompat.Channels.COLUMN_DISPLAY_NAME)
        val browsableIdx = cursor.getColumnIndex(TvContractCompat.Channels.COLUMN_BROWSABLE)
        val dataIdx = cursor.getColumnIndex(TvContractCompat.Channels.COLUMN_INTERNAL_PROVIDER_DATA)

        if (idIdx >= 0) map.putDouble("id", cursor.getLong(idIdx).toDouble())
        if (nameIdx >= 0) map.putString("displayName", cursor.getString(nameIdx))
        if (browsableIdx >= 0) map.putBoolean("isBrowsable", cursor.getInt(browsableIdx) == 1)
        if (dataIdx >= 0) {
            val bytes = cursor.getBlob(dataIdx)
            if (bytes != null) {
                map.putString("internalProviderName", String(bytes))
            }
        }
        return map
    }

    private fun programToMap(cursor: Cursor): WritableMap {
        val map = Arguments.createMap()
        val idIdx = cursor.getColumnIndex(TvContractCompat.PreviewPrograms._ID)
        val titleIdx = cursor.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_TITLE)
        val providerIdIdx = cursor.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_INTERNAL_PROVIDER_ID)

        if (idIdx >= 0) map.putDouble("id", cursor.getLong(idIdx).toDouble())
        if (titleIdx >= 0) map.putString("title", cursor.getString(titleIdx))
        if (providerIdIdx >= 0) map.putString("internalProviderId", cursor.getString(providerIdIdx))
        return map
    }

    /**
     * Get all program IDs belonging to a specific channel.
     * TvProvider forbids WHERE clauses, so we query all and filter in code.
     */
    private fun getProgramIdsForChannel(channelId: Long): List<Long> {
        val ids = mutableListOf<Long>()
        val cursor = reactApplicationContext.contentResolver.query(
            TvContractCompat.PreviewPrograms.CONTENT_URI,
            null, null, null, null
        )
        cursor?.use {
            val idIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms._ID)
            val chIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_CHANNEL_ID)
            if (idIdx >= 0 && chIdx >= 0) {
                while (it.moveToNext()) {
                    if (it.getLong(chIdx) == channelId) {
                        ids.add(it.getLong(idIdx))
                    }
                }
            }
        }
        return ids
    }

    /**
     * Delete programs one by one by their URI (no WHERE clause).
     */
    private fun deleteProgramsByIds(ids: List<Long>): Int {
        var count = 0
        for (id in ids) {
            val deleted = reactApplicationContext.contentResolver.delete(
                TvContractCompat.buildPreviewProgramUri(id),
                null, null
            )
            if (deleted > 0) count++
        }
        return count
    }

    // --- Channel Management ---

    @ReactMethod
    fun createChannel(config: ReadableMap, promise: Promise) {
        runAsync(promise) {
            val displayName = config.getString("displayName") ?: run {
                promise.reject("INVALID_CONFIG", "displayName is required")
                return@runAsync
            }

            val builder = Channel.Builder()
                .setType(TvContractCompat.Channels.TYPE_PREVIEW)
                .setDisplayName(displayName)

            if (config.hasKey("description")) {
                builder.setDescription(config.getString("description"))
            }
            if (config.hasKey("appLinkIntentUri")) {
                builder.setAppLinkIntentUri(Uri.parse(config.getString("appLinkIntentUri")))
            }
            if (config.hasKey("internalProviderName")) {
                builder.setInternalProviderData(config.getString("internalProviderName")!!.toByteArray())
            }

            val channelUri = reactApplicationContext.contentResolver.insert(
                TvContractCompat.Channels.CONTENT_URI,
                builder.build().toContentValues()
            ) ?: run {
                promise.reject("INSERT_FAILED", "Failed to create channel")
                return@runAsync
            }

            val channelId = ContentUris.parseId(channelUri)

            val logoUrl = config.getString("logoUrl")
            if (logoUrl != null) {
                val bitmap = downloadBitmap(logoUrl)
                if (bitmap != null) {
                    ChannelLogoUtils.storeChannelLogo(reactApplicationContext, channelId, bitmap)
                }
            }

            TvContractCompat.requestChannelBrowsable(reactApplicationContext, channelId)

            promise.resolve(channelId.toDouble())
        }
    }

    @ReactMethod
    fun updateChannel(channelId: Double, config: ReadableMap, promise: Promise) {
        runAsync(promise) {
            val id = channelId.toLong()
            val builder = Channel.Builder()
                .setType(TvContractCompat.Channels.TYPE_PREVIEW)

            if (config.hasKey("displayName")) {
                builder.setDisplayName(config.getString("displayName"))
            }
            if (config.hasKey("description")) {
                builder.setDescription(config.getString("description"))
            }
            if (config.hasKey("appLinkIntentUri")) {
                builder.setAppLinkIntentUri(Uri.parse(config.getString("appLinkIntentUri")))
            }
            if (config.hasKey("internalProviderName")) {
                builder.setInternalProviderData(config.getString("internalProviderName")!!.toByteArray())
            }

            val channelUri = TvContractCompat.buildChannelUri(id)
            reactApplicationContext.contentResolver.update(
                channelUri,
                builder.build().toContentValues(),
                null, null
            )

            val logoUrl = config.getString("logoUrl")
            if (logoUrl != null) {
                val bitmap = downloadBitmap(logoUrl)
                if (bitmap != null) {
                    ChannelLogoUtils.storeChannelLogo(reactApplicationContext, id, bitmap)
                }
            }

            promise.resolve(true)
        }
    }

    @ReactMethod
    fun deleteChannel(channelId: Double, promise: Promise) {
        runAsync(promise) {
            val id = channelId.toLong()
            // Delete all programs first (one by one, no WHERE)
            val programIds = getProgramIdsForChannel(id)
            deleteProgramsByIds(programIds)
            // Delete the channel
            val channelUri = TvContractCompat.buildChannelUri(id)
            reactApplicationContext.contentResolver.delete(channelUri, null, null)
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getChannels(promise: Promise) {
        runAsync(promise) {
            val result = Arguments.createArray()
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.Channels.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                while (it.moveToNext()) {
                    result.pushMap(channelToMap(it))
                }
            }

            promise.resolve(result)
        }
    }

    @ReactMethod
    fun findChannelByName(name: String, promise: Promise) {
        runAsync(promise) {
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.Channels.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                while (it.moveToNext()) {
                    val dataIdx = it.getColumnIndex(TvContractCompat.Channels.COLUMN_INTERNAL_PROVIDER_DATA)
                    if (dataIdx >= 0) {
                        val bytes = it.getBlob(dataIdx)
                        if (bytes != null && String(bytes) == name) {
                            promise.resolve(channelToMap(it))
                            return@runAsync
                        }
                    }
                }
            }

            promise.resolve(null)
        }
    }

    // --- Program Management ---

    @ReactMethod
    fun addProgram(channelId: Double, data: ReadableMap, promise: Promise) {
        runAsync(promise) {
            val program = buildProgram(channelId.toLong(), data)
            val programUri = reactApplicationContext.contentResolver.insert(
                TvContractCompat.PreviewPrograms.CONTENT_URI,
                program.toContentValues()
            ) ?: run {
                promise.reject("INSERT_FAILED", "Failed to add program")
                return@runAsync
            }

            promise.resolve(ContentUris.parseId(programUri).toDouble())
        }
    }

    @ReactMethod
    fun addPrograms(channelId: Double, array: ReadableArray, promise: Promise) {
        runAsync(promise) {
            val ids = Arguments.createArray()
            val chId = channelId.toLong()

            for (i in 0 until array.size()) {
                val data = array.getMap(i) ?: continue
                val program = buildProgram(chId, data)
                val programUri = reactApplicationContext.contentResolver.insert(
                    TvContractCompat.PreviewPrograms.CONTENT_URI,
                    program.toContentValues()
                )
                if (programUri != null) {
                    ids.pushDouble(ContentUris.parseId(programUri).toDouble())
                }
            }

            promise.resolve(ids)
        }
    }

    @ReactMethod
    fun updateProgram(programId: Double, data: ReadableMap, promise: Promise) {
        runAsync(promise) {
            val id = programId.toLong()
            val programUri = TvContractCompat.buildPreviewProgramUri(id)

            // Query single program by URI (allowed, no WHERE)
            val cursor = reactApplicationContext.contentResolver.query(
                programUri, null, null, null, null
            )

            val channelId = cursor?.use {
                if (it.moveToFirst()) {
                    val idx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_CHANNEL_ID)
                    if (idx >= 0) it.getLong(idx) else 0L
                } else 0L
            } ?: 0L

            val program = buildProgram(channelId, data)
            reactApplicationContext.contentResolver.update(
                programUri,
                program.toContentValues(),
                null, null
            )

            promise.resolve(true)
        }
    }

    @ReactMethod
    fun removeProgram(programId: Double, promise: Promise) {
        runAsync(promise) {
            val programUri = TvContractCompat.buildPreviewProgramUri(programId.toLong())
            reactApplicationContext.contentResolver.delete(programUri, null, null)
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun clearChannelPrograms(channelId: Double, promise: Promise) {
        runAsync(promise) {
            val programIds = getProgramIdsForChannel(channelId.toLong())
            val count = deleteProgramsByIds(programIds)
            Log.d(TAG, "clearChannelPrograms: deleted $count programs")
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun getPrograms(channelId: Double, promise: Promise) {
        runAsync(promise) {
            val chId = channelId.toLong()
            val result = Arguments.createArray()
            // Query all, filter in code (no WHERE allowed)
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.PreviewPrograms.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                val idIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms._ID)
                val chIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_CHANNEL_ID)
                val titleIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_TITLE)
                val providerIdIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_INTERNAL_PROVIDER_ID)
                while (it.moveToNext()) {
                    if (chIdx >= 0 && it.getLong(chIdx) == chId) {
                        val map = Arguments.createMap()
                        if (idIdx >= 0) map.putDouble("id", it.getLong(idIdx).toDouble())
                        if (titleIdx >= 0) map.putString("title", it.getString(titleIdx))
                        if (providerIdIdx >= 0) map.putString("internalProviderId", it.getString(providerIdIdx))
                        result.pushMap(map)
                    }
                }
            }

            promise.resolve(result)
        }
    }

    @ReactMethod
    fun findProgram(channelId: Double, internalProviderId: String, promise: Promise) {
        runAsync(promise) {
            val chId = channelId.toLong()
            // Query all, filter in code (no WHERE allowed)
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.PreviewPrograms.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                val idIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms._ID)
                val chIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_CHANNEL_ID)
                val providerIdIdx = it.getColumnIndex(TvContractCompat.PreviewPrograms.COLUMN_INTERNAL_PROVIDER_ID)
                while (it.moveToNext()) {
                    if (chIdx >= 0 && it.getLong(chIdx) == chId &&
                        providerIdIdx >= 0 && it.getString(providerIdIdx) == internalProviderId) {
                        promise.resolve(programToMap(it))
                        return@runAsync
                    }
                }
            }

            promise.resolve(null)
        }
    }

    // --- Watch Next ---

    @ReactMethod
    fun addToWatchNext(data: ReadableMap, promise: Promise) {
        runAsync(promise) {
            val internalProviderId = data.getString("internalProviderId")

            // Upsert: query all Watch Next, find by internalProviderId in code
            if (internalProviderId != null) {
                val cursor = reactApplicationContext.contentResolver.query(
                    TvContractCompat.WatchNextPrograms.CONTENT_URI,
                    null, null, null, null
                )

                cursor?.use {
                    val idIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms._ID)
                    val providerIdIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms.COLUMN_INTERNAL_PROVIDER_ID)
                    while (it.moveToNext()) {
                        if (providerIdIdx >= 0 && it.getString(providerIdIdx) == internalProviderId && idIdx >= 0) {
                            val existingId = it.getLong(idIdx)
                            val program = buildWatchNextProgram(data)
                            val programUri = TvContractCompat.buildWatchNextProgramUri(existingId)
                            reactApplicationContext.contentResolver.update(
                                programUri,
                                program.toContentValues(),
                                null, null
                            )
                            promise.resolve(existingId.toDouble())
                            return@runAsync
                        }
                    }
                }
            }

            // Insert new
            val program = buildWatchNextProgram(data)
            val programUri = reactApplicationContext.contentResolver.insert(
                TvContractCompat.WatchNextPrograms.CONTENT_URI,
                program.toContentValues()
            ) ?: run {
                promise.reject("INSERT_FAILED", "Failed to add Watch Next program")
                return@runAsync
            }

            promise.resolve(ContentUris.parseId(programUri).toDouble())
        }
    }

    @ReactMethod
    fun removeFromWatchNext(programId: Double, promise: Promise) {
        runAsync(promise) {
            val programUri = TvContractCompat.buildWatchNextProgramUri(programId.toLong())
            reactApplicationContext.contentResolver.delete(programUri, null, null)
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun findWatchNextProgram(internalProviderId: String, promise: Promise) {
        runAsync(promise) {
            // Query all, filter in code
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.WatchNextPrograms.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                val idIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms._ID)
                val titleIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms.COLUMN_TITLE)
                val providerIdIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms.COLUMN_INTERNAL_PROVIDER_ID)
                while (it.moveToNext()) {
                    if (providerIdIdx >= 0 && it.getString(providerIdIdx) == internalProviderId) {
                        val map = Arguments.createMap()
                        if (idIdx >= 0) map.putDouble("id", it.getLong(idIdx).toDouble())
                        if (titleIdx >= 0) map.putString("title", it.getString(titleIdx))
                        map.putString("internalProviderId", it.getString(providerIdIdx))
                        promise.resolve(map)
                        return@runAsync
                    }
                }
            }

            promise.resolve(null)
        }
    }

    @ReactMethod
    fun clearWatchNext(promise: Promise) {
        runAsync(promise) {
            val cursor = reactApplicationContext.contentResolver.query(
                TvContractCompat.WatchNextPrograms.CONTENT_URI,
                null, null, null, null
            )

            var count = 0
            cursor?.use {
                val idIdx = it.getColumnIndex(TvContractCompat.WatchNextPrograms._ID)
                if (idIdx >= 0) {
                    while (it.moveToNext()) {
                        val id = it.getLong(idIdx)
                        val uri = TvContractCompat.buildWatchNextProgramUri(id)
                        val deleted = reactApplicationContext.contentResolver.delete(uri, null, null)
                        if (deleted > 0) count++
                    }
                }
            }

            promise.resolve(count.toDouble())
        }
    }

    // --- Utility ---

    @ReactMethod
    fun isAndroidTV(promise: Promise) {
        val pm = reactApplicationContext.packageManager
        val isTV = pm.hasSystemFeature(PackageManager.FEATURE_LEANBACK) ||
                   pm.hasSystemFeature(PackageManager.FEATURE_TELEVISION)
        promise.resolve(isTV)
    }

    @ReactMethod
    fun debug(promise: Promise) {
        runAsync(promise) {
            val info = Arguments.createMap()
            val pm = reactApplicationContext.packageManager

            info.putBoolean("hasLeanback", pm.hasSystemFeature(PackageManager.FEATURE_LEANBACK))
            info.putBoolean("hasTelevision", pm.hasSystemFeature(PackageManager.FEATURE_TELEVISION))
            info.putBoolean("hasActivityContext", currentActivity != null)

            var hasTvProvider = false
            try {
                val cursor = reactApplicationContext.contentResolver.query(
                    TvContractCompat.Channels.CONTENT_URI,
                    null, null, null, null
                )
                cursor?.use {
                    hasTvProvider = true
                    info.putInt("existingChannelCount", it.count)
                }
            } catch (e: Exception) {
                info.putString("tvProviderError", e.message)
            }
            info.putBoolean("hasTvProvider", hasTvProvider)

            if (hasTvProvider) {
                val channels = Arguments.createArray()
                val cursor = reactApplicationContext.contentResolver.query(
                    TvContractCompat.Channels.CONTENT_URI,
                    null, null, null, null
                )
                cursor?.use {
                    while (it.moveToNext()) {
                        val ch = channelToMap(it)
                        val chId = ch.getDouble("id").toLong()
                        // Count programs by iterating (no WHERE)
                        val programCount = getProgramIdsForChannel(chId).size
                        ch.putInt("programCount", programCount)
                        channels.pushMap(ch)
                    }
                }
                info.putArray("channels", channels)
            }

            Log.d(TAG, "debug: $info")
            promise.resolve(info)
        }
    }

    @ReactMethod
    fun requestChannelBrowsable(channelId: Double, promise: Promise) {
        runAsync(promise) {
            TvContractCompat.requestChannelBrowsable(reactApplicationContext, channelId.toLong())
            promise.resolve(true)
        }
    }

    // --- Convenience ---

    @ReactMethod
    fun syncChannel(channelConfig: ReadableMap, programs: ReadableArray, promise: Promise) {
        runAsync(promise) {
            val internalName = channelConfig.getString("internalProviderName")
            var channelId: Long? = null

            Log.d(TAG, "syncChannel: internalName=$internalName, programs=${programs.size()}")

            // Find existing channel (no WHERE — channels allow query without selection)
            if (internalName != null) {
                val cursor = reactApplicationContext.contentResolver.query(
                    TvContractCompat.Channels.CONTENT_URI,
                    null, null, null, null
                )

                cursor?.use {
                    while (it.moveToNext()) {
                        val dataIdx = it.getColumnIndex(TvContractCompat.Channels.COLUMN_INTERNAL_PROVIDER_DATA)
                        if (dataIdx >= 0) {
                            val bytes = it.getBlob(dataIdx)
                            if (bytes != null && String(bytes) == internalName) {
                                val idIdx = it.getColumnIndex(TvContractCompat.Channels._ID)
                                if (idIdx >= 0) {
                                    channelId = it.getLong(idIdx)
                                }
                                break
                            }
                        }
                    }
                }
            }

            if (channelId != null) {
                Log.d(TAG, "syncChannel: updating existing channel $channelId")
                val builder = Channel.Builder()
                    .setType(TvContractCompat.Channels.TYPE_PREVIEW)

                if (channelConfig.hasKey("displayName")) {
                    builder.setDisplayName(channelConfig.getString("displayName"))
                }
                if (channelConfig.hasKey("description")) {
                    builder.setDescription(channelConfig.getString("description"))
                }
                if (channelConfig.hasKey("appLinkIntentUri")) {
                    builder.setAppLinkIntentUri(Uri.parse(channelConfig.getString("appLinkIntentUri")))
                }
                if (internalName != null) {
                    builder.setInternalProviderData(internalName.toByteArray())
                }

                val channelUri = TvContractCompat.buildChannelUri(channelId!!)
                reactApplicationContext.contentResolver.update(
                    channelUri,
                    builder.build().toContentValues(),
                    null, null
                )

                val logoUrl = channelConfig.getString("logoUrl")
                if (logoUrl != null) {
                    val bitmap = downloadBitmap(logoUrl)
                    if (bitmap != null) {
                        ChannelLogoUtils.storeChannelLogo(reactApplicationContext, channelId!!, bitmap)
                    }
                }
            } else {
                // Create new channel
                val displayName = channelConfig.getString("displayName") ?: "Channel"
                Log.d(TAG, "syncChannel: creating new channel '$displayName'")
                val builder = Channel.Builder()
                    .setType(TvContractCompat.Channels.TYPE_PREVIEW)
                    .setDisplayName(displayName)

                if (channelConfig.hasKey("description")) {
                    builder.setDescription(channelConfig.getString("description"))
                }
                if (channelConfig.hasKey("appLinkIntentUri")) {
                    builder.setAppLinkIntentUri(Uri.parse(channelConfig.getString("appLinkIntentUri")))
                }
                if (internalName != null) {
                    builder.setInternalProviderData(internalName.toByteArray())
                }

                val channelUri = reactApplicationContext.contentResolver.insert(
                    TvContractCompat.Channels.CONTENT_URI,
                    builder.build().toContentValues()
                ) ?: run {
                    Log.e(TAG, "syncChannel: insert returned null — TvProvider may not be available")
                    promise.reject("INSERT_FAILED", "Failed to create channel")
                    return@runAsync
                }

                channelId = ContentUris.parseId(channelUri)
                Log.d(TAG, "syncChannel: created channel with id=$channelId")

                val logoUrl = channelConfig.getString("logoUrl")
                if (logoUrl != null) {
                    val bitmap = downloadBitmap(logoUrl)
                    if (bitmap != null) {
                        ChannelLogoUtils.storeChannelLogo(reactApplicationContext, channelId!!, bitmap)
                    }
                }

                try {
                    val activity = currentActivity
                    if (activity != null) {
                        TvContractCompat.requestChannelBrowsable(activity, channelId!!)
                    } else {
                        TvContractCompat.requestChannelBrowsable(reactApplicationContext, channelId!!)
                    }
                    Log.d(TAG, "syncChannel: requestChannelBrowsable sent")
                } catch (e: Exception) {
                    Log.w(TAG, "syncChannel: requestChannelBrowsable failed", e)
                    try {
                        val values = android.content.ContentValues()
                        values.put(TvContractCompat.Channels.COLUMN_BROWSABLE, 1)
                        reactApplicationContext.contentResolver.update(
                            TvContractCompat.buildChannelUri(channelId!!),
                            values, null, null
                        )
                    } catch (e2: Exception) {
                        Log.w(TAG, "syncChannel: direct browsable also failed", e2)
                    }
                }
            }

            // Clear existing programs (one by one, no WHERE)
            val existingProgramIds = getProgramIdsForChannel(channelId!!)
            val deleted = deleteProgramsByIds(existingProgramIds)
            Log.d(TAG, "syncChannel: cleared $deleted old programs")

            // Insert all programs
            val programIds = Arguments.createArray()
            var insertedCount = 0
            for (i in 0 until programs.size()) {
                val data = programs.getMap(i) ?: continue
                val program = buildProgram(channelId!!, data)
                val programUri = reactApplicationContext.contentResolver.insert(
                    TvContractCompat.PreviewPrograms.CONTENT_URI,
                    program.toContentValues()
                )
                if (programUri != null) {
                    programIds.pushDouble(ContentUris.parseId(programUri).toDouble())
                    insertedCount++
                } else {
                    Log.w(TAG, "syncChannel: failed to insert program '${data.getString("title")}'")
                }
            }
            Log.d(TAG, "syncChannel: inserted $insertedCount/${programs.size()} programs")

            val result = Arguments.createMap()
            result.putDouble("channelId", channelId!!.toDouble())
            result.putArray("programIds", programIds)
            promise.resolve(result)
        }
    }
}
