import dotEnv from 'dotenv'

const path: NormalObject = {
	default: '.env.development',
	dev: '.env.development',
	prod: '.env.production'
}
const NODE_ENV = process.env.NODE_ENV || 'default'

dotEnv.config({ path: path[NODE_ENV] })

const useEnvFallback = (target: string, fallback: string) => {
	if (!process.env[target] && process.env[fallback]) {
		process.env[target] = process.env[fallback]
	}
}

useEnvFallback('QINIU_ACCESS_KEY', 'CDN_ACCESS_KEY')
useEnvFallback('QINIU_SECRET_KEY', 'CDN_SECRET_KEY')
useEnvFallback('QINIU_BUCKET', 'CDN_BUCKET')
useEnvFallback('QINIU_CDN_LINK', 'CDN_LINK')
useEnvFallback('QINIU_GLOBAL_CDN_LINK', 'CDN_GLOBAL_LINK')
useEnvFallback('QINIU_FRONTEND_DOMAIN', 'CDN_FRONTEND_DOMAIN')

export default process.env
