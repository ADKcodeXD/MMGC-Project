import { Service } from '~/common/decorator/decorator'
import axios from 'axios'
import config from '~/config/config.default'
import logger from '~/common/utils/log4j'

@Service(true)
export default class TranslateService {
	private get apiKey() {
		return config.OPENROUTER_API_KEY || ''
	}

	private get model() {
		return config.OPENROUTER_MODEL || 'google/gemini-flash-1.5'
	}

	async translate(text: string, isHtml?: boolean): Promise<I18N | null> {
		if (!this.apiKey) {
			logger.error('OPENROUTER_API_KEY is not configured')
			return null
		}

		const systemPrompt = isHtml
			? `You are a professional translator. Translate the given HTML content into Chinese (cn), English (en), and Japanese (ja). Preserve all HTML tags and structure. Return ONLY a JSON object with the format: {"cn": "...", "en": "...", "ja": "..."}. No extra text or markdown wrapping.`
			: `You are a professional translator. Translate the given text into Chinese (cn), English (en), and Japanese (ja). Return ONLY a JSON object with the format: {"cn": "...", "en": "...", "ja": "..."}. No extra text or markdown wrapping.`

		try {
			const response = await axios.post(
				'https://openrouter.ai/api/v1/chat/completions',
				{
					model: this.model,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: text }
					],
					temperature: 0.3
				},
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						'Content-Type': 'application/json'
					},
					timeout: 60000
				}
			)

			const content = response.data?.choices?.[0]?.message?.content
			if (!content) {
				logger.error('Empty response from OpenRouter')
				return null
			}

			// Extract JSON from response (handle possible markdown wrapping)
			const jsonMatch = content.match(/\{[\s\S]*\}/)
			if (!jsonMatch) {
				logger.error(`Failed to parse translation response: ${content}`)
				return null
			}

			const result = JSON.parse(jsonMatch[0])
			return {
				cn: result.cn || '',
				en: result.en || '',
				jp: result.ja || result.jp || ''
			}
		} catch (error: any) {
			logger.error(`Translation error: ${error?.message || error}`)
			return null
		}
	}
}
