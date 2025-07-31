import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  cdn: undefined,
  codeHeightLimit: 300,
  comment: undefined,
  encrypt: undefined,
  feed: undefined,
  floatingVue: undefined,
  frontmatter: undefined,
  fuse: undefined,
  lang: "",
  languages: undefined,
  lastUpdated: false,
  license: undefined,
  mode: undefined,
  pageSize: 0,
  redirects: undefined,
  search: undefined,
  sponsor: undefined,
  statistics: undefined,
  subtitle: "",
  timezone: 'Asia/Shanghai',
  vanillaLazyload: undefined,
  url: "",
  // 站点标题
  title: '北沐城歌',
  // 作者信息
  author: {
    avatar: 'https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202410261321057.png',
    name: '北歌'
  },
  favicon: 'https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202411051423199.svg',

  social: [
      {
        name: 'RSS',
        link: '/atom.xml',
        icon: 'i-ri-rss-line',
        color: 'orange',
      },
      {
        name: '网易云音乐',
        link: 'https://music.163.com/#/user/home?id=3954596483',
        icon: 'i-ri-netease-cloud-music-line',
        color:'#C20C0C',
      },
      {
        name: 'QQ 2409101203',
        link: 'https://qm.qq.com/cgi-bin/qm/qr?k=kZJzggTTCf4SpvEQ8lXWoi5ZjhAx0ILZ&jump_from=webapi',
        icon: 'i-ri-qq-line',
        color: '#12B7F5',
      },

      {
        name: 'GitHub',
        link: 'https://github.com/kinsey973',
        icon: 'i-ri-github-line',
        color: '#6e5494',
      },
      {
        name: 'Travelling',
        link: 'https://travellings.link',
        icon: 'i-ri-train-line',
        color: 'white'
      },


    ],
  // 站点描述
  description: '山行野宿，孤身万里',
  // 站点主题(hairy)
  theme: 'hairy',
  // or more...
  mediumZoom: { enable: true }


})



