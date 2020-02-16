const emoji = require("remark-emoji");

module.exports = {
  pathPrefix: "/pristine-typescript-gatsby-react-material-ui",
  siteMetadata: {
    title: 'Pristine',
    description: '',
    logoUrl: 'https://user-images.githubusercontent.com/364566/72745834-80fcac80-3b65-11ea-8521-ec7bacd95687.png',
    primaryColor: '#3f51b5', //material-ui primary color
    secondaryColor: '#f50057', //material-ui secondary colo
    author: '',
    menuLinks: [
      {
        name: 'home',
        link: '/',
        ignoreNextPrev: true
      },
      {
        name: 'API Documentation',
        link: '/api-documentation'
      }
    ],
    footerLinks: [
      {
        name: 'OpenRPC Specification',
        link: 'https://github.com/open-rpc/spec'
      }
    ]
  },
  plugins: [
    "@etclabscore/gatsby-theme-pristine",
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'pristine-site',
        short_name: 'pristine-site',
        start_url: '/',
        background_color: 'transparent',
        theme_color: '#3f51b5',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    }
  ],
}
