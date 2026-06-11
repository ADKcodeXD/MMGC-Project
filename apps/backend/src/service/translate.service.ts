import { Service } from '~/common/decorator/decorator'
import axios from 'axios'
import config from '~/config/config.default'
import logger from '~/common/utils/log4j'

type TranslationResponse = {
	cn?: unknown
	en?: unknown
	ja?: unknown
	jp?: unknown
}

@Service(true)
export default class TranslateService {
	private get apiKey() {
		return config.OPENAI_API_KEY || ''
	}

	private get model() {
		return config.OPENAI_MODEL || 'google/gemini-2.5-flash'
	}

	private get baseUrl() {
		return config.OPENAI_BASE_URL || 'https://api.apifast.tech/v1'
	}

	private normalizeText(value: unknown) {
		return typeof value === 'string' ? value.trim() : ''
	}

	private parseTranslationContent(content: string): TranslationResponse | null {
		const normalized = content
			.trim()
			.replace(/^```(?:json)?\s*/i, '')
			.replace(/\s*```$/i, '')

		const candidates = [normalized]
		const firstBrace = normalized.indexOf('{')
		const lastBrace = normalized.lastIndexOf('}')
		if (firstBrace >= 0 && lastBrace > firstBrace) {
			candidates.push(normalized.slice(firstBrace, lastBrace + 1))
		}

		for (const candidate of candidates) {
			try {
				return JSON.parse(candidate)
			} catch {}
		}

		return null
	}

	async translate(text: string, isHtml?: boolean): Promise<I18N | null> {
		const sourceText = this.normalizeText(text)
		if (!sourceText) return null

		if (!this.apiKey) {
			logger.error('AI Translation API Key (OPENAI_API_KEY) is not configured')
			return null
		}

		const systemPrompt = isHtml
			? `You are a professional translator for an ACG video site admin form. Translate the given HTML content into Chinese (cn), English (en), and Japanese (ja). Preserve every HTML tag, attribute, entity, and line break. Return ONLY valid JSON in this exact shape: {"cn":"...","en":"...","ja":"..."}.`
			: `You are a professional translator for an ACG video site admin form. Translate the given text into Chinese (cn), English (en), and Japanese (ja). Keep titles concise and descriptions natural. Return ONLY valid JSON in this exact shape: {"cn":"...","en":"...","ja":"..."}.`

		try {
			const response = await axios.post(
				`${this.baseUrl}/chat/completions`,
				{
					model: this.model,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: sourceText }
					],
					temperature: 0.1
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
				logger.error('Empty response from AI Translation API')
				return null
			}

			const result = this.parseTranslationContent(content)
			if (!result) {
				logger.error(`Failed to parse translation response: ${content}`)
				return null
			}

			return {
				cn: this.normalizeText(result.cn) || sourceText,
				en: this.normalizeText(result.en),
				jp: this.normalizeText(result.ja) || this.normalizeText(result.jp)
			}
		} catch (error: any) {
			logger.error(`Translation error: ${error?.message || error}`)
			return null
		}
	}
}
