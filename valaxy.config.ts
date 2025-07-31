import { defineConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-hairy'
import { addonWaline } from 'valaxy-addon-waline'
import { addonMeting } from 'valaxy-addon-meting'

/**
 * User Config
 * do not use export const config to avoid defu conflict
 */

export default defineConfig<ThemeConfig>({
  theme: 'hairy',
  themeConfig: {
  "nav": [
    {
      "text": "Home",
      "link": "/",
      "icon": "i-material-symbols-home-work-sharp"
    },
    {
      "text": "About",
      "link": "/about",
      "icon": "i-material-symbols-home-work-sharp"
    },
    {
      "text": "Links",
      "link": "/links",
      "icon": "i-material-symbols-home-work-sharp"
    },
    {
      "text": "Posts",
      "link": "/archives",
      "icon": "i-material-symbols-home-work-sharp"
    },
    {
      "text": "Github",
      "icon": "i-ri-github-fill",
      "link": "https://github.com/kinsey973"
    }
  ],
  "layout":
    {
    "post": "image:slice:reverse"
    }

 },


  addons: [
    addonMeting({
      global: true,
      props: {
        // 设置你的网易云/qq或其他歌单 ID
        id: '5312894314',
        type: 'playlist',
        autoplay: true,
        theme: 'var(--hy-c-primary)',
      },
    }),
    // 请参考 https://waline.js.org/ 设置 serverURL 地址
    addonWaline({
      comment: true,
      serverURL: 'https://kinsey-six.vercel.app',
      emoji: ["https://fastly.jsdelivr.net/gh/walinejs/emojis@latest/bilibili/","https://fastly.jsdelivr.net/gh/walinejs/emojis@latest/weibo/", "https://fastly.jsdelivr.net/gh/walinejs/emojis@latest/qq/"],
      pageview: true,
    }),
  ]
})
