export default [
  {
    old: "#include <clipping_planes_pars_vertex>",
    new: `
         #include <clipping_planes_pars_vertex>

         attribute float aDisplacement;
      `,
  },
  {
    old: "#include <begin_vertex>",
    new: `
         #include <begin_vertex>;
         transformed.z += aDisplacement;
      `,
  },
  {
    old: "#include <uv_pars_vertex>",
    new: `
         #define USE_UV
         #include <uv_pars_vertex>
      `,
  },
];
