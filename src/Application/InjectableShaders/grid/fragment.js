export default [
  {
    old: "#include <uv_pars_fragment>",
    new: `
         #define USE_UV
         #include <uv_pars_fragment>
         uniform float uWidthOfUV;
         uniform float uLocationOfUV;
      `,
  },
  {
    old: "#include <dithering_fragment>",
    new: `
         #include <dithering_fragment>
         float strength = uWidthOfUV / (distance(vUv, vec2(uLocationOfUV)));
         strength = clamp(strength, 0.0, 1.0);

         vec3 blackColor = vec3(0.0);
         vec3 uvColor = vec3(vUv, 1.0);
         vec3 mixedColor = mix(blackColor, uvColor, strength);
         gl_FragColor = vec4(mixedColor, 1.0);
      `,
  },
];
