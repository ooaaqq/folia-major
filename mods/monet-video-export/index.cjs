// mods/sample-transparent-mov-export/index.cjs
// Local video tool: always renders Monet lyrics over the Monet background.

'use strict';

module.exports = function activate(api) {
    api.log.info('monet-video-export loaded');

    api.commands.register({
        id: 'export-monet-video',
        label: { 'zh-CN': '导出莫奈视频', en: 'Export Monet video' },
        description: {
            'zh-CN': '将当前本地歌曲按莫奈歌词和莫奈背景离屏渲染为无声视频，自动带入歌名、歌手、专辑与封面。',
            en: 'Renders the current local track as a silent Monet lyrics video with its metadata and cover.',
        },
        permissions: ['render.export', 'runtime.playback'],
        params: [
            {
                key: 'codec',
                label: { 'zh-CN': '编码格式', en: 'Codec' },
                description: {
                    'zh-CN': 'H.264 输出 MP4，便于后续压入音频；VP9 输出 WebM；ProRes 输出高码率 MOV。',
                    en: 'H.264 outputs MP4 for easy audio muxing; VP9 outputs WebM; ProRes outputs a high-bitrate MOV.',
                },
                type: 'select',
                options: [
                    { value: 'h264', label: { 'zh-CN': 'H.264（高质量 MP4）', en: 'H.264 (high-quality MP4)' } },
                    { value: 'vp9', label: { 'zh-CN': 'VP9（WebM）', en: 'VP9 (WebM)' } },
                    { value: 'prores', label: { 'zh-CN': 'ProRes 4444（MOV）', en: 'ProRes 4444 (MOV)' } },
                ],
                defaultValue: 'h264',
            },
            {
                key: 'width',
                label: { 'zh-CN': '宽度（像素）', en: 'Width (px)' },
                type: 'number',
                min: 320,
                max: 3840,
                defaultValue: 3840,
            },
            {
                key: 'height',
                label: { 'zh-CN': '高度（像素）', en: 'Height (px)' },
                type: 'number',
                min: 180,
                max: 2160,
                defaultValue: 2160,
            },
            {
                key: 'fps',
                label: { 'zh-CN': '帧率', en: 'Frame rate' },
                type: 'number',
                min: 10,
                max: 60,
                defaultValue: 60,
            },
            {
                key: 'startSec',
                label: { 'zh-CN': '开始时间（秒）', en: 'Start time (sec)' },
                description: { 'zh-CN': '从歌曲的该时刻开始渲染。', en: 'Render from this song position.' },
                type: 'number',
                min: 0,
                defaultValue: 0,
            },
            {
                key: 'endSec',
                label: { 'zh-CN': '结束时间（秒，0 = 歌词结束）', en: 'End time (sec, 0 = lyric end)' },
                description: { 'zh-CN': '0 表示自动渲染到歌词结束。', en: '0 renders until the lyrics finish.' },
                type: 'number',
                min: 0,
                defaultValue: 0,
            },
        ],
        run: async (params) => {
            const snapshot = api.runtime.getPlaybackSnapshot();
            if (!snapshot || !snapshot.lyricData || !Array.isArray(snapshot.lyricData.lines) || snapshot.lyricData.lines.length === 0) {
                throw new Error('export-no-lyrics');
            }

            const result = await api.render.exportVideo({
                codec: ['h264', 'prores'].includes(params.codec) ? params.codec : 'vp9',
                width: Number(params.width),
                height: Number(params.height),
                fps: Number(params.fps),
                startSec: Number(params.startSec) || 0,
                // 0 leaves the end open; the export service falls back to the
                // end of the lyric timeline plus a short outro.
                endSec: Number(params.endSec) || 0,
                visualizerMode: 'monet',
                visualizerTunings: snapshot.visualizerTunings || null,
                backgroundMode: 'theme',
                transparent: false,
                lyricData: snapshot.lyricData,
                theme: snapshot.theme,
                coverUrl: snapshot.coverUrl,
                background: {
                    ...(snapshot.background || {}),
                    mode: 'monet',
                    transparent: false,
                },
                monetPortraitImage: snapshot.monetPortraitImage,
                isDaylight: snapshot.isDaylight,
                subtitleFontScale: snapshot.subtitleFontScale,
                showSubtitleTranslation: snapshot.showSubtitleTranslation,
                subtitleContentMode: snapshot.subtitleContentMode,
                showHarmonySubtitle: snapshot.showHarmonySubtitle,
                harmonySubtitleBackground: snapshot.harmonySubtitleBackground,
                seed: snapshot.seed,
                songMeta: {
                    title: snapshot.songTitle ?? '',
                    artist: snapshot.songArtist ?? '',
                    album: snapshot.songAlbum ?? snapshot.song?.album?.name ?? '',
                },
            });

            if (!result.ok) {
                throw new Error(result.error || 'export-failed');
            }
            api.log.info('export finished', result.outputPath);
            return {
                outputPath: result.outputPath,
                frameCount: result.frameCount,
                warnings: result.warnings ?? [],
            };
        },
    });
};
