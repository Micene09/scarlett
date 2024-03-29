import { defineConfig } from 'vitepress'
import { version } from "../../package.json"

export default defineConfig({
	vite: {
		server: {
			host: "0.0.0.0",
			open: true
		}
	},
	lang: 'en-US',
	title: "Scarlett",
	description: "A rest client library that actually covers high complexity scenarios...for real!",
	outDir: "../lib-docs",
	base: "/scarlett/",
	head: [
		['link', { rel: 'icon', type: 'image/svg+xml', href: '/scarlett/logo.svg' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:title', content: "Scarlett" }],
		['meta', { property: 'og:image', content: "/scarlett/og-image.png" }],
		['meta', { property: 'og:url', content: "https://micene09.github.io/scarlett" }],
		['meta', { property: 'og:description', content: "A rest client library that actually covers high complexity scenarios...for real!" }],
		['meta', { name: 'theme-color', content: '#BB0000' }]
	],
	themeConfig: {
		logo: "/logo.svg",
		search: {
			provider: "local"
		},
		editLink: {
			pattern: 'https://github.com/micene09/scarlett/edit/main/docs/:path',
			text: 'Edit this page on GitHub'
		},
		nav: [
			{
				text: 'Guide',
				link: '/guide/getting-started',
				activeMatch: "^/guide/"
			},
			{
				text: 'API',
				link: '/api/styles',
				activeMatch: "^/api/"
			},
			{
				text: version,
				items: [
					{
						text: 'Release Notes',
						link: 'https://github.com/Micene09/scarlett/releases'
					},
					{
						text: 'How to contribute',
						link: '/contribute'
					}
				]
			}
		],
		sidebar: {
			"/": [
				{
					text: "Guide",
					items: [
						{ text: "Why", link: "/guide/why" },
						{ text: "Features", link: "/guide/features" },
						{ text: "Getting Started", link: "/guide/getting-started" },
						{ text: "How to contribute", link: "/contribute" },
						{ text: "Support", link: "/guide/support" },
						{ text: "Functional API Usage", link: "/guide/functional" },
						{ text: "Class API Usage", link: "/guide/class" }
					]
				},
				{
					text: "API",
					items: [
						{ text: "Styles", link: "/api/styles" },
						{ text: "Functional API", link: "/api/functional" },
						{ text: "Class API", link: "/api/class" },
						{ text: "Cache System", link: "/api/in-memory-cache" },
						{ text: "Request Options", link: "/api/request-options" },
						{ text: "Response Object", link: "/api/response-object" },
						{ text: "Rest Error", link: "/api/rest-error" }
					]
				},
				{
					text: "Migration",
					items: [
						{ text: "1.x to 2.x", link: "/migration/1-to-2" }
					]
				}
			]
		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Micene09/scarlett' }
		],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present micene09',
		}
	}
})
