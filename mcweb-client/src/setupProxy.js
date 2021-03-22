const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use('/api',
        createProxyMiddleware({
            target: 'http://localhost:1337',
            changeOrigin: true,
            pathRewrite: {
                '^/api' : '/'
            },
            ws: true
        })
    );
    app.use("/curseforge",
        createProxyMiddleware({
            target: "https://addons-ecs.forgesvc.net/api/v2/",
            changeOrigin: true,
            pathRewrite: {
                "^/curseforge": "/"
            }
        })
    );
};