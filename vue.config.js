module.exports = {
    devServer: {
        port: 8090,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080', // 后端服务的实际地址
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '' // 将 /api 前缀替换为空
                },
                secure: false, // 如果是https接口，需要配置这个参数
                logLevel: 'debug' // 显示代理日志，便于调试
            }
        }
    }
}