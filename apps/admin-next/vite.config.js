import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
function parseProxy(value) {
    if (!value)
        return undefined;
    try {
        var pairs = JSON.parse(value);
        return pairs.reduce(function (proxy, _a) {
            var prefix = _a[0], target = _a[1];
            proxy[prefix] = {
                target: target,
                changeOrigin: true,
                secure: false,
                rewrite: function (path) { return path.replace(new RegExp("^".concat(prefix)), ''); }
            };
            return proxy;
        }, {});
    }
    catch (_a) {
        return undefined;
    }
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/newAdmin/',
        plugins: [react()],
        server: {
            host: true,
            port: Number(env.VITE_PORT || 3670),
            proxy: parseProxy(env.VITE_PROXY)
        }
    };
});
