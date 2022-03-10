module.exports = {
  publicPath: "/",
  chainWebpack: (config) => {
    config.module
      .rule("glsl")
      .test(/\.(glsl|vs|fs|vert|frag)$/)
      .use("raw-loader")
      .loader("raw-loader")
      .end()
  },
  configureWebpack: {
    // lets debugger map the code within a compressed file back to its position in the original file
    devtool: "source-map",
  },
};
