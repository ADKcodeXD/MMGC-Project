import { JSONSchemaType } from 'ajv'

export const configUpdateSchemas: JSONSchemaType<MMGCSysConfig> = {
	type: 'object',
	properties: {
		currentActivityId: { type: 'integer', nullable: true },
		isVideoPlay: { type: 'boolean', nullable: true },
		enableWatermark: { type: 'boolean', nullable: true },
		otherSettings: { type: 'string', nullable: true },
		skin: { type: 'string', nullable: true },
		configType: { type: 'integer', nullable: true },
		assetBaseUrl: { type: 'string', nullable: true },
		assetPrimaryBaseUrl: { type: 'string', nullable: true },
		assetGlobalBaseUrl: { type: 'string', nullable: true },
		assetRegion: { type: 'string', nullable: true, enum: ['cn', 'global'] }
	},
	additionalProperties: true
}
