module.exports = {
	title: '一本關於 Ethereum 與 Solidity 智能合約的書',
	description: '在 2022 年，我們該如何學習智能合約開發',
	locales: {
		'/': {
			lang: 'zh-TW',
		}
	},
	themeConfig: {
		repo: 'hydai/solidity.tw',
		editLinks: true,
		nav: [
			{ text: '首頁', link: '/' },
			{ text: '那些關於 Ethereum 的事', link: '/ethereum-101/' }
		]
	},
	plugins: [
		["vuepress-plugin-auto-sidebar", {}],
		['@vuepress/last-updated'],
		['@vuepress/back-to-top'],
	]
}
