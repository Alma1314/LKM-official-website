@group(0) @binding(0) var<uniform> r: RenU;
@fragment
fn fmain(@location(0) uv: vec2f) -> @location(0) vec4f {
  /* 2D：域上方的简单垂直渐变天空，下方为灰色 */
  let up = pow(1.0 - uv.y, 0.8);
  var col = mix(vec3f(0.020, 0.024, 0.048), vec3f(0.008, 0.010, 0.024), up);
  /* 云层：靠近顶部的一薄层噪声带 */
  let cloudY = 0.85;
  if (uv.y > cloudY) {
    let yf = (uv.y - cloudY) / 0.15;
    let hx = floor(uv.x * 60.0);
    var cd = (fbm(vec2f(hx * 0.42, r.misc1.x * 0.07)) * 0.5 + 0.5);
    cd = smoothstep(0.38, 0.80, cd);
    let cf = cd * yf * (1.0 - yf) * 4.0 * 0.35;
    let cloudLight = r.strike.w * cd * 0.07;
    let cc = vec3f(0.050, 0.056, 0.086) * (0.6 + 0.4 * cd)
           + vec3f(0.62, 0.58, 0.92) * cloudLight;
    col = mix(col, cc, clamp(cf, 0.0, 1.0));
  }
  /* 放电期间整片天空的填充光 */
  col = col + vec3f(0.050, 0.050, 0.080) * r.strike.w * 0.045;
  return vec4f(col, 1.0);
}
