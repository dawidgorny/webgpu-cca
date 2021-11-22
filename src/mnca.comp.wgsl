[[block]] struct SimParams {
    seedRadius : f32;
    nstates : f32;
    rez : f32;
    rowPitch : f32;
    mousex : f32;
    mousey : f32;
    mouse : f32;
};

[[block]] struct Cells {
    data : array<f32>;
};

[[binding(0), group(0)]] var<uniform> params : SimParams;
[[binding(1), group(0)]] var<storage, read> currentCells : Cells;
[[binding(2), group(0)]] var<storage, write> cells : Cells;
[[binding(3), group(0)]] var outputTex : texture_storage_2d<rgba8unorm, write>;

// via "The Art of Code" on Youtube
fn Random(p : vec2<f32>) -> vec2<f32> {
    var a : vec3<f32> = fract(p.xyx * vec3<f32>(123.34, 234.34, 345.65));
    a = a + dot(a, a + 34.45);
    return fract(vec2<f32>(a.x * a.y, a.y * a.z));
}

fn toCellIndex(coords : vec2<i32> ) -> u32 {
   return u32(coords.y * i32(params.rez) + coords.x); 
}

fn S(coords : vec2<i32>, offset : vec2<i32>, next : i32) -> i32 {
    var cellIdx : u32 = toCellIndex(coords + offset);
    return i32(currentCells.data[cellIdx] > 0.0);
}

fn renderColor(state : f32, statesNum : f32) -> vec4<f32> {
    var v = state / statesNum;
    return vec4<f32>(v, v, v, 1.0);
}

[[stage(compute), workgroup_size(64)]]
fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
    // var index : u32 = u32(GlobalInvocationID.x);
    var coords : vec2<i32> = vec2<i32>(GlobalInvocationID.xy);
    var cellIdx : u32 = toCellIndex(coords);
    var state = currentCells.data[cellIdx];

    var next = i32(state + 1.0) % i32(params.nstates);

    //

    var s0 = 
      S(coords, vec2<i32>(-14, -1), next) +
      S(coords, vec2<i32>(-14, 0), next) +
      S(coords, vec2<i32>(-14, 1), next) +
      S(coords, vec2<i32>(-13, -4), next) +
      S(coords, vec2<i32>(-13, -3), next) +
      S(coords, vec2<i32>(-13, -2), next) +
      S(coords, vec2<i32>(-13, 2), next) +
      S(coords, vec2<i32>(-13, 3), next) +
      S(coords, vec2<i32>(-13, 4), next) +
      S(coords, vec2<i32>(-12, -6), next) +
      S(coords, vec2<i32>(-12, -5), next) +
      S(coords, vec2<i32>(-12, 5), next) +
      S(coords, vec2<i32>(-12, 6), next) +
      S(coords, vec2<i32>(-11, -8), next) +
      S(coords, vec2<i32>(-11, -7), next) +
      S(coords, vec2<i32>(-11, 7), next) +
      S(coords, vec2<i32>(-11, 8), next) +
      S(coords, vec2<i32>(-10, -9), next) +
      S(coords, vec2<i32>(-10, -1), next) +
      S(coords, vec2<i32>(-10, 0), next) +
      S(coords, vec2<i32>(-10, 1), next) +
      S(coords, vec2<i32>(-10, 9), next) +
      S(coords, vec2<i32>(-9, -10), next) +
      S(coords, vec2<i32>(-9, -4), next) +
      S(coords, vec2<i32>(-9, -3), next) +
      S(coords, vec2<i32>(-9, -2), next) +
      S(coords, vec2<i32>(-9, 2), next) +
      S(coords, vec2<i32>(-9, 3), next) +
      S(coords, vec2<i32>(-9, 4), next) +
      S(coords, vec2<i32>(-9, 10), next) +
      S(coords, vec2<i32>(-8, -11), next) +
      S(coords, vec2<i32>(-8, -6), next) +
      S(coords, vec2<i32>(-8, -5), next) +
      S(coords, vec2<i32>(-8, 5), next) +
      S(coords, vec2<i32>(-8, 6), next) +
      S(coords, vec2<i32>(-8, 11), next) +
      S(coords, vec2<i32>(-7, -11), next) +
      S(coords, vec2<i32>(-7, -7), next) +
      S(coords, vec2<i32>(-7, -2), next) +
      S(coords, vec2<i32>(-7, -1), next) +
      S(coords, vec2<i32>(-7, 0), next) +
      S(coords, vec2<i32>(-7, 1), next) +
      S(coords, vec2<i32>(-7, 2), next) +
      S(coords, vec2<i32>(-7, 7), next) +
      S(coords, vec2<i32>(-7, 11), next) +
      S(coords, vec2<i32>(-6, -12), next) +
      S(coords, vec2<i32>(-6, -8), next) +
      S(coords, vec2<i32>(-6, -4), next) +
      S(coords, vec2<i32>(-6, -3), next) +
      S(coords, vec2<i32>(-6, 3), next) +
      S(coords, vec2<i32>(-6, 4), next) +
      S(coords, vec2<i32>(-6, 8), next) +
      S(coords, vec2<i32>(-6, 12), next) +
      S(coords, vec2<i32>(-5, -12), next) +
      S(coords, vec2<i32>(-5, -8), next) +
      S(coords, vec2<i32>(-5, -5), next) +
      S(coords, vec2<i32>(-5, -1), next) +
      S(coords, vec2<i32>(-5, 0), next) +
      S(coords, vec2<i32>(-5, 1), next) +
      S(coords, vec2<i32>(-5, 5), next);
    var s1 = 		
      S(coords, vec2<i32>(-5, 8), next) +
      S(coords, vec2<i32>(-5, 12), next) +
      S(coords, vec2<i32>(-4, -13), next) +
      S(coords, vec2<i32>(-4, -9), next) +
      S(coords, vec2<i32>(-4, -6), next) +
      S(coords, vec2<i32>(-4, -3), next) +
      S(coords, vec2<i32>(-4, -2), next) +
      S(coords, vec2<i32>(-4, 2), next) +
      S(coords, vec2<i32>(-4, 3), next) +
      S(coords, vec2<i32>(-4, 6), next) +
      S(coords, vec2<i32>(-4, 9), next) +
      S(coords, vec2<i32>(-4, 13), next) +
      S(coords, vec2<i32>(-3, -13), next) +
      S(coords, vec2<i32>(-3, -9), next) +
      S(coords, vec2<i32>(-3, -6), next) +
      S(coords, vec2<i32>(-3, -4), next) +
      S(coords, vec2<i32>(-3, -1), next) +
      S(coords, vec2<i32>(-3, 0), next) +
      S(coords, vec2<i32>(-3, 1), next) +
      S(coords, vec2<i32>(-3, 4), next) +
      S(coords, vec2<i32>(-3, 6), next) +
      S(coords, vec2<i32>(-3, 9), next) +
      S(coords, vec2<i32>(-3, 13), next) +
      S(coords, vec2<i32>(-2, -13), next) +
      S(coords, vec2<i32>(-2, -9), next) +
      S(coords, vec2<i32>(-2, -7), next) +
      S(coords, vec2<i32>(-2, -4), next) +
      S(coords, vec2<i32>(-2, -2), next) +
      S(coords, vec2<i32>(-2, 2), next) +
      S(coords, vec2<i32>(-2, 4), next) +
      S(coords, vec2<i32>(-2, 7), next) +
      S(coords, vec2<i32>(-2, 9), next) +
      S(coords, vec2<i32>(-2, 13), next) +
      S(coords, vec2<i32>(-1, -14), next) +
      S(coords, vec2<i32>(-1, -10), next) +
      S(coords, vec2<i32>(-1, -7), next) +
      S(coords, vec2<i32>(-1, -5), next) +
      S(coords, vec2<i32>(-1, -3), next) +
      S(coords, vec2<i32>(-1, -1), next) +
      S(coords, vec2<i32>(-1, 0), next) +
      S(coords, vec2<i32>(-1, 1), next) +
      S(coords, vec2<i32>(-1, 3), next) +
      S(coords, vec2<i32>(-1, 5), next) +
      S(coords, vec2<i32>(-1, 7), next) +
      S(coords, vec2<i32>(-1, 10), next) +
      S(coords, vec2<i32>(-1, 14), next) +
      S(coords, vec2<i32>(0, -14), next) +
      S(coords, vec2<i32>(0, -10), next) +
      S(coords, vec2<i32>(0, -7), next) +
      S(coords, vec2<i32>(0, -5), next) +
      S(coords, vec2<i32>(0, -3), next) +
      S(coords, vec2<i32>(0, -1), next) +
      S(coords, vec2<i32>(0, 1), next) +
      S(coords, vec2<i32>(0, 3), next) +
      S(coords, vec2<i32>(0, 5), next) +
      S(coords, vec2<i32>(0, 7), next) +
      S(coords, vec2<i32>(0, 10), next) +
      S(coords, vec2<i32>(0, 14), next) +
      S(coords, vec2<i32>(1, -14), next) +
      S(coords, vec2<i32>(1, -10), next) +
      S(coords, vec2<i32>(1, -7), next);
    var s2 = 		
      S(coords, vec2<i32>(1, -5), next) +
      S(coords, vec2<i32>(1, -3), next) +
      S(coords, vec2<i32>(1, -1), next) +
      S(coords, vec2<i32>(1, 0), next) +
      S(coords, vec2<i32>(1, 1), next) +
      S(coords, vec2<i32>(1, 3), next) +
      S(coords, vec2<i32>(1, 5), next) +
      S(coords, vec2<i32>(1, 7), next) +
      S(coords, vec2<i32>(1, 10), next) +
      S(coords, vec2<i32>(1, 14), next) +
      S(coords, vec2<i32>(2, -13), next) +
      S(coords, vec2<i32>(2, -9), next) +
      S(coords, vec2<i32>(2, -7), next) +
      S(coords, vec2<i32>(2, -4), next) +
      S(coords, vec2<i32>(2, -2), next) +
      S(coords, vec2<i32>(2, 2), next) +
      S(coords, vec2<i32>(2, 4), next) +
      S(coords, vec2<i32>(2, 7), next) +
      S(coords, vec2<i32>(2, 9), next) +
      S(coords, vec2<i32>(2, 13), next) +
      S(coords, vec2<i32>(3, -13), next) +
      S(coords, vec2<i32>(3, -9), next) +
      S(coords, vec2<i32>(3, -6), next) +
      S(coords, vec2<i32>(3, -4), next) +
      S(coords, vec2<i32>(3, -1), next) +
      S(coords, vec2<i32>(3, 0), next) +
      S(coords, vec2<i32>(3, 1), next) +
      S(coords, vec2<i32>(3, 4), next) +
      S(coords, vec2<i32>(3, 6), next) +
      S(coords, vec2<i32>(3, 9), next) +
      S(coords, vec2<i32>(3, 13), next) +
      S(coords, vec2<i32>(4, -13), next) +
      S(coords, vec2<i32>(4, -9), next) +
      S(coords, vec2<i32>(4, -6), next) +
      S(coords, vec2<i32>(4, -3), next) +
      S(coords, vec2<i32>(4, -2), next) +
      S(coords, vec2<i32>(4, 2), next) +
      S(coords, vec2<i32>(4, 3), next) +
      S(coords, vec2<i32>(4, 6), next) +
      S(coords, vec2<i32>(4, 9), next) +
      S(coords, vec2<i32>(4, 13), next) +
      S(coords, vec2<i32>(5, -12), next) +
      S(coords, vec2<i32>(5, -8), next) +
      S(coords, vec2<i32>(5, -5), next) +
      S(coords, vec2<i32>(5, -1), next) +
      S(coords, vec2<i32>(5, 0), next) +
      S(coords, vec2<i32>(5, 1), next) +
      S(coords, vec2<i32>(5, 5), next) +
      S(coords, vec2<i32>(5, 8), next) +
      S(coords, vec2<i32>(5, 12), next) +
      S(coords, vec2<i32>(6, -12), next) +
      S(coords, vec2<i32>(6, -8), next) +
      S(coords, vec2<i32>(6, -4), next) +
      S(coords, vec2<i32>(6, -3), next) +
      S(coords, vec2<i32>(6, 3), next) +
      S(coords, vec2<i32>(6, 4), next) +
      S(coords, vec2<i32>(6, 8), next) +
      S(coords, vec2<i32>(6, 12), next) +
      S(coords, vec2<i32>(7, -11), next) +
      S(coords, vec2<i32>(7, -7), next) +
      S(coords, vec2<i32>(7, -2), next);
    var s3 = 
      S(coords, vec2<i32>(7, -1), next) +
      S(coords, vec2<i32>(7, 0), next) +
      S(coords, vec2<i32>(7, 1), next) +
      S(coords, vec2<i32>(7, 2), next) +
      S(coords, vec2<i32>(7, 7), next) +
      S(coords, vec2<i32>(7, 11), next) +
      S(coords, vec2<i32>(8, -11), next) +
      S(coords, vec2<i32>(8, -6), next) +
      S(coords, vec2<i32>(8, -5), next) +
      S(coords, vec2<i32>(8, 5), next) +
      S(coords, vec2<i32>(8, 6), next) +
      S(coords, vec2<i32>(8, 11), next) +
      S(coords, vec2<i32>(9, -10), next) +
      S(coords, vec2<i32>(9, -4), next) +
      S(coords, vec2<i32>(9, -3), next) +
      S(coords, vec2<i32>(9, -2), next) +
      S(coords, vec2<i32>(9, 2), next) +
      S(coords, vec2<i32>(9, 3), next) +
      S(coords, vec2<i32>(9, 4), next) +
      S(coords, vec2<i32>(9, 10), next) +
      S(coords, vec2<i32>(10, -9), next) +
      S(coords, vec2<i32>(10, -1), next) +
      S(coords, vec2<i32>(10, 0), next) +
      S(coords, vec2<i32>(10, 1), next) +
      S(coords, vec2<i32>(10, 9), next) +
      S(coords, vec2<i32>(11, -8), next) +
      S(coords, vec2<i32>(11, -7), next) +
      S(coords, vec2<i32>(11, 7), next) +
      S(coords, vec2<i32>(11, 8), next) +
      S(coords, vec2<i32>(12, -6), next) +
      S(coords, vec2<i32>(12, -5), next) +
      S(coords, vec2<i32>(12, 5), next) +
      S(coords, vec2<i32>(12, 6), next) +
      S(coords, vec2<i32>(13, -4), next) +
      S(coords, vec2<i32>(13, -3), next) +
      S(coords, vec2<i32>(13, -2), next) +
      S(coords, vec2<i32>(13, 2), next) +
      S(coords, vec2<i32>(13, 3), next) +
      S(coords, vec2<i32>(13, 4), next) +
      S(coords, vec2<i32>(14, -1), next) +
      S(coords, vec2<i32>(14, 0), next) +
      S(coords, vec2<i32>(14, 1), next);
    var s4 = 
      S(coords, vec2<i32>(-3, -1), next) +
      S(coords, vec2<i32>(-3, 0), next) +
      S(coords, vec2<i32>(-3, 1), next) +
      S(coords, vec2<i32>(-2, -2), next) +
      S(coords, vec2<i32>(-2, 2), next) +
      S(coords, vec2<i32>(-1, -3), next) +
      S(coords, vec2<i32>(-1, -1), next) +
      S(coords, vec2<i32>(-1, 0), next) +
      S(coords, vec2<i32>(-1, 1), next) +
      S(coords, vec2<i32>(-1, 3), next) +
      S(coords, vec2<i32>(0, -3), next) +
      S(coords, vec2<i32>(0, -1), next) +
      S(coords, vec2<i32>(0, 1), next) +
      S(coords, vec2<i32>(0, 3), next) +
      S(coords, vec2<i32>(1, -3), next) +
      S(coords, vec2<i32>(1, -1), next) +
      S(coords, vec2<i32>(1, 0), next) +
      S(coords, vec2<i32>(1, 1), next) +
      S(coords, vec2<i32>(1, 3), next) +
      S(coords, vec2<i32>(2, -2), next) +
      S(coords, vec2<i32>(2, 2), next) +
      S(coords, vec2<i32>(3, -1), next) +
      S(coords, vec2<i32>(3, 0), next) +
      S(coords, vec2<i32>(3, 1), next);
    var s5 = 
      S(coords, vec2<i32>(-6, -1), next) +
      S(coords, vec2<i32>(-6, 0), next) +
      S(coords, vec2<i32>(-6, 1), next) +
      S(coords, vec2<i32>(-5, -3), next) +
      S(coords, vec2<i32>(-5, -2), next) +
      S(coords, vec2<i32>(-5, -1), next) +
      S(coords, vec2<i32>(-5, 0), next) +
      S(coords, vec2<i32>(-5, 1), next) +
      S(coords, vec2<i32>(-5, 2), next) +
      S(coords, vec2<i32>(-5, 3), next) +
      S(coords, vec2<i32>(-4, -4), next) +
      S(coords, vec2<i32>(-4, -3), next) +
      S(coords, vec2<i32>(-4, -2), next) +
      S(coords, vec2<i32>(-4, -1), next) +
      S(coords, vec2<i32>(-4, 0), next) +
      S(coords, vec2<i32>(-4, 1), next) +
      S(coords, vec2<i32>(-4, 2), next) +
      S(coords, vec2<i32>(-4, 3), next) +
      S(coords, vec2<i32>(-4, 4), next) +
      S(coords, vec2<i32>(-3, -5), next) +
      S(coords, vec2<i32>(-3, -4), next) +
      S(coords, vec2<i32>(-3, -3), next) +
      S(coords, vec2<i32>(-3, -2), next) +
      S(coords, vec2<i32>(-3, 2), next) +
      S(coords, vec2<i32>(-3, 3), next) +
      S(coords, vec2<i32>(-3, 4), next) +
      S(coords, vec2<i32>(-3, 5), next) +
      S(coords, vec2<i32>(-2, -5), next) +
      S(coords, vec2<i32>(-2, -4), next) +
      S(coords, vec2<i32>(-2, -3), next) +
      S(coords, vec2<i32>(-2, 3), next) +
      S(coords, vec2<i32>(-2, 4), next) +
      S(coords, vec2<i32>(-2, 5), next) +
      S(coords, vec2<i32>(-1, -6), next) +
      S(coords, vec2<i32>(-1, -5), next) +
      S(coords, vec2<i32>(-1, -4), next) +
      S(coords, vec2<i32>(-1, 4), next) +
      S(coords, vec2<i32>(-1, 5), next) +
      S(coords, vec2<i32>(-1, 6), next) +
      S(coords, vec2<i32>(0, -6), next) +
      S(coords, vec2<i32>(0, -5), next) +
      S(coords, vec2<i32>(0, -4), next) +
      S(coords, vec2<i32>(0, 4), next) +
      S(coords, vec2<i32>(0, 5), next) +
      S(coords, vec2<i32>(0, 6), next) +
      S(coords, vec2<i32>(1, -6), next) +
      S(coords, vec2<i32>(1, -5), next) +
      S(coords, vec2<i32>(1, -4), next) +
      S(coords, vec2<i32>(1, 4), next) +
      S(coords, vec2<i32>(1, 5), next) +
      S(coords, vec2<i32>(1, 6), next) +
      S(coords, vec2<i32>(2, -5), next) +
      S(coords, vec2<i32>(2, -4), next) +
      S(coords, vec2<i32>(2, -3), next) +
      S(coords, vec2<i32>(2, 3), next) +
      S(coords, vec2<i32>(2, 4), next) +
      S(coords, vec2<i32>(2, 5), next) +
      S(coords, vec2<i32>(3, -5), next) +
      S(coords, vec2<i32>(3, -4), next) +
      S(coords, vec2<i32>(3, -3), next);
    var s6 = 
      S(coords, vec2<i32>(3, -2), next) +
      S(coords, vec2<i32>(3, 2), next) +
      S(coords, vec2<i32>(3, 3), next) +
      S(coords, vec2<i32>(3, 4), next) +
      S(coords, vec2<i32>(3, 5), next) +
      S(coords, vec2<i32>(4, -4), next) +
      S(coords, vec2<i32>(4, -3), next) +
      S(coords, vec2<i32>(4, -2), next) +
      S(coords, vec2<i32>(4, -1), next) +
      S(coords, vec2<i32>(4, 0), next) +
      S(coords, vec2<i32>(4, 1), next) +
      S(coords, vec2<i32>(4, 2), next) +
      S(coords, vec2<i32>(4, 3), next) +
      S(coords, vec2<i32>(4, 4), next) +
      S(coords, vec2<i32>(5, -3), next) +
      S(coords, vec2<i32>(5, -2), next) +
      S(coords, vec2<i32>(5, -1), next) +
      S(coords, vec2<i32>(5, 0), next) +
      S(coords, vec2<i32>(5, 1), next) +
      S(coords, vec2<i32>(5, 2), next) +
      S(coords, vec2<i32>(5, 3), next) +
      S(coords, vec2<i32>(6, -1), next) +
      S(coords, vec2<i32>(6, 0), next) +
      S(coords, vec2<i32>(6, 1), next);
    var s7 = 
      S(coords, vec2<i32>(-14, -3), next) +
      S(coords, vec2<i32>(-14, -2), next) +
      S(coords, vec2<i32>(-14, -1), next) +
      S(coords, vec2<i32>(-14, 0), next) +
      S(coords, vec2<i32>(-14, 1), next) +
      S(coords, vec2<i32>(-14, 2), next) +
      S(coords, vec2<i32>(-14, 3), next) +
      S(coords, vec2<i32>(-13, -6), next) +
      S(coords, vec2<i32>(-13, -5), next) +
      S(coords, vec2<i32>(-13, -4), next) +
      S(coords, vec2<i32>(-13, -3), next) +
      S(coords, vec2<i32>(-13, -2), next) +
      S(coords, vec2<i32>(-13, -1), next) +
      S(coords, vec2<i32>(-13, 0), next) +
      S(coords, vec2<i32>(-13, 1), next) +
      S(coords, vec2<i32>(-13, 2), next) +
      S(coords, vec2<i32>(-13, 3), next) +
      S(coords, vec2<i32>(-13, 4), next) +
      S(coords, vec2<i32>(-13, 5), next) +
      S(coords, vec2<i32>(-13, 6), next) +
      S(coords, vec2<i32>(-12, -8), next) +
      S(coords, vec2<i32>(-12, -7), next) +
      S(coords, vec2<i32>(-12, -6), next) +
      S(coords, vec2<i32>(-12, -5), next) +
      S(coords, vec2<i32>(-12, -4), next) +
      S(coords, vec2<i32>(-12, -3), next) +
      S(coords, vec2<i32>(-12, -2), next) +
      S(coords, vec2<i32>(-12, -1), next) +
      S(coords, vec2<i32>(-12, 0), next) +
      S(coords, vec2<i32>(-12, 1), next) +
      S(coords, vec2<i32>(-12, 2), next) +
      S(coords, vec2<i32>(-12, 3), next) +
      S(coords, vec2<i32>(-12, 4), next) +
      S(coords, vec2<i32>(-12, 5), next) +
      S(coords, vec2<i32>(-12, 6), next) +
      S(coords, vec2<i32>(-12, 7), next) +
      S(coords, vec2<i32>(-12, 8), next) +
      S(coords, vec2<i32>(-11, -9), next) +
      S(coords, vec2<i32>(-11, -8), next) +
      S(coords, vec2<i32>(-11, -7), next) +
      S(coords, vec2<i32>(-11, -6), next) +
      S(coords, vec2<i32>(-11, -5), next) +
      S(coords, vec2<i32>(-11, -4), next) +
      S(coords, vec2<i32>(-11, -3), next) +
      S(coords, vec2<i32>(-11, -2), next) +
      S(coords, vec2<i32>(-11, -1), next) +
      S(coords, vec2<i32>(-11, 0), next) +
      S(coords, vec2<i32>(-11, 1), next) +
      S(coords, vec2<i32>(-11, 2), next) +
      S(coords, vec2<i32>(-11, 3), next) +
      S(coords, vec2<i32>(-11, 4), next) +
      S(coords, vec2<i32>(-11, 5), next) +
      S(coords, vec2<i32>(-11, 6), next) +
      S(coords, vec2<i32>(-11, 7), next) +
      S(coords, vec2<i32>(-11, 8), next) +
      S(coords, vec2<i32>(-11, 9), next) +
      S(coords, vec2<i32>(-10, -10), next) +
      S(coords, vec2<i32>(-10, -9), next) +
      S(coords, vec2<i32>(-10, -8), next) +
      S(coords, vec2<i32>(-10, -7), next);
    var s8 =
      S(coords, vec2<i32>(-10, -6), next) +
      S(coords, vec2<i32>(-10, -5), next) +
      S(coords, vec2<i32>(-10, 5), next) +
      S(coords, vec2<i32>(-10, 6), next) +
      S(coords, vec2<i32>(-10, 7), next) +
      S(coords, vec2<i32>(-10, 8), next) +
      S(coords, vec2<i32>(-10, 9), next) +
      S(coords, vec2<i32>(-10, 10), next) +
      S(coords, vec2<i32>(-9, -11), next) +
      S(coords, vec2<i32>(-9, -10), next) +
      S(coords, vec2<i32>(-9, -9), next) +
      S(coords, vec2<i32>(-9, -8), next) +
      S(coords, vec2<i32>(-9, -7), next) +
      S(coords, vec2<i32>(-9, 7), next) +
      S(coords, vec2<i32>(-9, 8), next) +
      S(coords, vec2<i32>(-9, 9), next) +
      S(coords, vec2<i32>(-9, 10), next) +
      S(coords, vec2<i32>(-9, 11), next) +
      S(coords, vec2<i32>(-8, -12), next) +
      S(coords, vec2<i32>(-8, -11), next) +
      S(coords, vec2<i32>(-8, -10), next) +
      S(coords, vec2<i32>(-8, -9), next) +
      S(coords, vec2<i32>(-8, -8), next) +
      S(coords, vec2<i32>(-8, 8), next) +
      S(coords, vec2<i32>(-8, 9), next) +
      S(coords, vec2<i32>(-8, 10), next) +
      S(coords, vec2<i32>(-8, 11), next) +
      S(coords, vec2<i32>(-8, 12), next) +
      S(coords, vec2<i32>(-7, -12), next) +
      S(coords, vec2<i32>(-7, -11), next) +
      S(coords, vec2<i32>(-7, -10), next) +
      S(coords, vec2<i32>(-7, -9), next) +
      S(coords, vec2<i32>(-7, -2), next) +
      S(coords, vec2<i32>(-7, -1), next) +
      S(coords, vec2<i32>(-7, 0), next) +
      S(coords, vec2<i32>(-7, 1), next) +
      S(coords, vec2<i32>(-7, 2), next) +
      S(coords, vec2<i32>(-7, 9), next) +
      S(coords, vec2<i32>(-7, 10), next) +
      S(coords, vec2<i32>(-7, 11), next) +
      S(coords, vec2<i32>(-7, 12), next) +
      S(coords, vec2<i32>(-6, -13), next) +
      S(coords, vec2<i32>(-6, -12), next) +
      S(coords, vec2<i32>(-6, -11), next) +
      S(coords, vec2<i32>(-6, -10), next) +
      S(coords, vec2<i32>(-6, -4), next) +
      S(coords, vec2<i32>(-6, -3), next) +
      S(coords, vec2<i32>(-6, 3), next) +
      S(coords, vec2<i32>(-6, 4), next) +
      S(coords, vec2<i32>(-6, 10), next) +
      S(coords, vec2<i32>(-6, 11), next) +
      S(coords, vec2<i32>(-6, 12), next) +
      S(coords, vec2<i32>(-6, 13), next) +
      S(coords, vec2<i32>(-5, -13), next) +
      S(coords, vec2<i32>(-5, -12), next) +
      S(coords, vec2<i32>(-5, -11), next) +
      S(coords, vec2<i32>(-5, -10), next) +
      S(coords, vec2<i32>(-5, -5), next) +
      S(coords, vec2<i32>(-5, 5), next) +
      S(coords, vec2<i32>(-5, 10), next) +
      S(coords, vec2<i32>(-5, 11), next);
    var s9 =
      S(coords, vec2<i32>(-5, 12), next) +
      S(coords, vec2<i32>(-5, 13), next) +
      S(coords, vec2<i32>(-4, -13), next) +
      S(coords, vec2<i32>(-4, -12), next) +
      S(coords, vec2<i32>(-4, -11), next) +
      S(coords, vec2<i32>(-4, -6), next) +
      S(coords, vec2<i32>(-4, -1), next) +
      S(coords, vec2<i32>(-4, 0), next) +
      S(coords, vec2<i32>(-4, 1), next) +
      S(coords, vec2<i32>(-4, 6), next) +
      S(coords, vec2<i32>(-4, 11), next) +
      S(coords, vec2<i32>(-4, 12), next) +
      S(coords, vec2<i32>(-4, 13), next) +
      S(coords, vec2<i32>(-3, -14), next) +
      S(coords, vec2<i32>(-3, -13), next) +
      S(coords, vec2<i32>(-3, -12), next) +
      S(coords, vec2<i32>(-3, -11), next) +
      S(coords, vec2<i32>(-3, -6), next) +
      S(coords, vec2<i32>(-3, -2), next) +
      S(coords, vec2<i32>(-3, 2), next) +
      S(coords, vec2<i32>(-3, 6), next) +
      S(coords, vec2<i32>(-3, 11), next) +
      S(coords, vec2<i32>(-3, 12), next) +
      S(coords, vec2<i32>(-3, 13), next) +
      S(coords, vec2<i32>(-3, 14), next) +
      S(coords, vec2<i32>(-2, -14), next) +
      S(coords, vec2<i32>(-2, -13), next) +
      S(coords, vec2<i32>(-2, -12), next) +
      S(coords, vec2<i32>(-2, -11), next) +
      S(coords, vec2<i32>(-2, -7), next) +
      S(coords, vec2<i32>(-2, -3), next) +
      S(coords, vec2<i32>(-2, 3), next) +
      S(coords, vec2<i32>(-2, 7), next) +
      S(coords, vec2<i32>(-2, 11), next) +
      S(coords, vec2<i32>(-2, 12), next) +
      S(coords, vec2<i32>(-2, 13), next) +
      S(coords, vec2<i32>(-2, 14), next) +
      S(coords, vec2<i32>(-1, -14), next) +
      S(coords, vec2<i32>(-1, -13), next) +
      S(coords, vec2<i32>(-1, -12), next) +
      S(coords, vec2<i32>(-1, -11), next) +
      S(coords, vec2<i32>(-1, -7), next) +
      S(coords, vec2<i32>(-1, -4), next) +
      S(coords, vec2<i32>(-1, -1), next) +
      S(coords, vec2<i32>(-1, 0), next) +
      S(coords, vec2<i32>(-1, 1), next) +
      S(coords, vec2<i32>(-1, 4), next) +
      S(coords, vec2<i32>(-1, 7), next) +
      S(coords, vec2<i32>(-1, 11), next) +
      S(coords, vec2<i32>(-1, 12), next) +
      S(coords, vec2<i32>(-1, 13), next) +
      S(coords, vec2<i32>(-1, 14), next) +
      S(coords, vec2<i32>(0, -14), next) +
      S(coords, vec2<i32>(0, -13), next) +
      S(coords, vec2<i32>(0, -12), next) +
      S(coords, vec2<i32>(0, -11), next) +
      S(coords, vec2<i32>(0, -7), next) +
      S(coords, vec2<i32>(0, -4), next) +
      S(coords, vec2<i32>(0, -1), next) +
      S(coords, vec2<i32>(0, 1), next) +
      S(coords, vec2<i32>(0, 4), next);
    var s10 =
      S(coords, vec2<i32>(0, 7), next) +
      S(coords, vec2<i32>(0, 11), next) +
      S(coords, vec2<i32>(0, 12), next) +
      S(coords, vec2<i32>(0, 13), next) +
      S(coords, vec2<i32>(0, 14), next) +
      S(coords, vec2<i32>(1, -14), next) +
      S(coords, vec2<i32>(1, -13), next) +
      S(coords, vec2<i32>(1, -12), next) +
      S(coords, vec2<i32>(1, -11), next) +
      S(coords, vec2<i32>(1, -7), next) +
      S(coords, vec2<i32>(1, -4), next) +
      S(coords, vec2<i32>(1, -1), next) +
      S(coords, vec2<i32>(1, 0), next) +
      S(coords, vec2<i32>(1, 1), next) +
      S(coords, vec2<i32>(1, 4), next) +
      S(coords, vec2<i32>(1, 7), next) +
      S(coords, vec2<i32>(1, 11), next) +
      S(coords, vec2<i32>(1, 12), next) +
      S(coords, vec2<i32>(1, 13), next) +
      S(coords, vec2<i32>(1, 14), next) +
      S(coords, vec2<i32>(2, -14), next) +
      S(coords, vec2<i32>(2, -13), next) +
      S(coords, vec2<i32>(2, -12), next) +
      S(coords, vec2<i32>(2, -11), next) +
      S(coords, vec2<i32>(2, -7), next) +
      S(coords, vec2<i32>(2, -3), next) +
      S(coords, vec2<i32>(2, 3), next) +
      S(coords, vec2<i32>(2, 7), next) +
      S(coords, vec2<i32>(2, 11), next) +
      S(coords, vec2<i32>(2, 12), next) +
      S(coords, vec2<i32>(2, 13), next) +
      S(coords, vec2<i32>(2, 14), next) +
      S(coords, vec2<i32>(3, -14), next) +
      S(coords, vec2<i32>(3, -13), next) +
      S(coords, vec2<i32>(3, -12), next) +
      S(coords, vec2<i32>(3, -11), next) +
      S(coords, vec2<i32>(3, -6), next) +
      S(coords, vec2<i32>(3, -2), next) +
      S(coords, vec2<i32>(3, 2), next) +
      S(coords, vec2<i32>(3, 6), next) +
      S(coords, vec2<i32>(3, 11), next) +
      S(coords, vec2<i32>(3, 12), next) +
      S(coords, vec2<i32>(3, 13), next) +
      S(coords, vec2<i32>(3, 14), next) +
      S(coords, vec2<i32>(4, -13), next) +
      S(coords, vec2<i32>(4, -12), next) +
      S(coords, vec2<i32>(4, -11), next) +
      S(coords, vec2<i32>(4, -6), next) +
      S(coords, vec2<i32>(4, -1), next) +
      S(coords, vec2<i32>(4, 0), next) +
      S(coords, vec2<i32>(4, 1), next) +
      S(coords, vec2<i32>(4, 6), next) +
      S(coords, vec2<i32>(4, 11), next) +
      S(coords, vec2<i32>(4, 12), next) +
      S(coords, vec2<i32>(4, 13), next) +
      S(coords, vec2<i32>(5, -13), next) +
      S(coords, vec2<i32>(5, -12), next) +
      S(coords, vec2<i32>(5, -11), next) +
      S(coords, vec2<i32>(5, -10), next) +
      S(coords, vec2<i32>(5, -5), next) +
      S(coords, vec2<i32>(5, 5), next);
    var s11 =
      S(coords, vec2<i32>(5, 10), next) +
      S(coords, vec2<i32>(5, 11), next) +
      S(coords, vec2<i32>(5, 12), next) +
      S(coords, vec2<i32>(5, 13), next) +
      S(coords, vec2<i32>(6, -13), next) +
      S(coords, vec2<i32>(6, -12), next) +
      S(coords, vec2<i32>(6, -11), next) +
      S(coords, vec2<i32>(6, -10), next) +
      S(coords, vec2<i32>(6, -4), next) +
      S(coords, vec2<i32>(6, -3), next) +
      S(coords, vec2<i32>(6, 3), next) +
      S(coords, vec2<i32>(6, 4), next) +
      S(coords, vec2<i32>(6, 10), next) +
      S(coords, vec2<i32>(6, 11), next) +
      S(coords, vec2<i32>(6, 12), next) +
      S(coords, vec2<i32>(6, 13), next) +
      S(coords, vec2<i32>(7, -12), next) +
      S(coords, vec2<i32>(7, -11), next) +
      S(coords, vec2<i32>(7, -10), next) +
      S(coords, vec2<i32>(7, -9), next) +
      S(coords, vec2<i32>(7, -2), next) +
      S(coords, vec2<i32>(7, -1), next) +
      S(coords, vec2<i32>(7, 0), next) +
      S(coords, vec2<i32>(7, 1), next) +
      S(coords, vec2<i32>(7, 2), next) +
      S(coords, vec2<i32>(7, 9), next) +
      S(coords, vec2<i32>(7, 10), next) +
      S(coords, vec2<i32>(7, 11), next) +
      S(coords, vec2<i32>(7, 12), next) +
      S(coords, vec2<i32>(8, -12), next) +
      S(coords, vec2<i32>(8, -11), next) +
      S(coords, vec2<i32>(8, -10), next) +
      S(coords, vec2<i32>(8, -9), next) +
      S(coords, vec2<i32>(8, -8), next) +
      S(coords, vec2<i32>(8, 8), next) +
      S(coords, vec2<i32>(8, 9), next) +
      S(coords, vec2<i32>(8, 10), next) +
      S(coords, vec2<i32>(8, 11), next) +
      S(coords, vec2<i32>(8, 12), next) +
      S(coords, vec2<i32>(9, -11), next) +
      S(coords, vec2<i32>(9, -10), next) +
      S(coords, vec2<i32>(9, -9), next) +
      S(coords, vec2<i32>(9, -8), next) +
      S(coords, vec2<i32>(9, -7), next) +
      S(coords, vec2<i32>(9, 7), next) +
      S(coords, vec2<i32>(9, 8), next) +
      S(coords, vec2<i32>(9, 9), next) +
      S(coords, vec2<i32>(9, 10), next) +
      S(coords, vec2<i32>(9, 11), next) +
      S(coords, vec2<i32>(10, -10), next) +
      S(coords, vec2<i32>(10, -9), next) +
      S(coords, vec2<i32>(10, -8), next) +
      S(coords, vec2<i32>(10, -7), next) +
      S(coords, vec2<i32>(10, -6), next) +
      S(coords, vec2<i32>(10, -5), next) +
      S(coords, vec2<i32>(10, 5), next) +
      S(coords, vec2<i32>(10, 6), next) +
      S(coords, vec2<i32>(10, 7), next) +
      S(coords, vec2<i32>(10, 8), next) +
      S(coords, vec2<i32>(10, 9), next) +
      S(coords, vec2<i32>(10, 10), next);
    var s12 =
      S(coords, vec2<i32>(11, -9), next) +
      S(coords, vec2<i32>(11, -8), next) +
      S(coords, vec2<i32>(11, -7), next) +
      S(coords, vec2<i32>(11, -6), next) +
      S(coords, vec2<i32>(11, -5), next) +
      S(coords, vec2<i32>(11, -4), next) +
      S(coords, vec2<i32>(11, -3), next) +
      S(coords, vec2<i32>(11, -2), next) +
      S(coords, vec2<i32>(11, -1), next) +
      S(coords, vec2<i32>(11, 0), next) +
      S(coords, vec2<i32>(11, 1), next) +
      S(coords, vec2<i32>(11, 2), next) +
      S(coords, vec2<i32>(11, 3), next) +
      S(coords, vec2<i32>(11, 4), next) +
      S(coords, vec2<i32>(11, 5), next) +
      S(coords, vec2<i32>(11, 6), next) +
      S(coords, vec2<i32>(11, 7), next) +
      S(coords, vec2<i32>(11, 8), next) +
      S(coords, vec2<i32>(11, 9), next) +
      S(coords, vec2<i32>(12, -8), next) +
      S(coords, vec2<i32>(12, -7), next) +
      S(coords, vec2<i32>(12, -6), next) +
      S(coords, vec2<i32>(12, -5), next) +
      S(coords, vec2<i32>(12, -4), next) +
      S(coords, vec2<i32>(12, -3), next) +
      S(coords, vec2<i32>(12, -2), next) +
      S(coords, vec2<i32>(12, -1), next) +
      S(coords, vec2<i32>(12, 0), next) +
      S(coords, vec2<i32>(12, 1), next) +
      S(coords, vec2<i32>(12, 2), next) +
      S(coords, vec2<i32>(12, 3), next) +
      S(coords, vec2<i32>(12, 4), next) +
      S(coords, vec2<i32>(12, 5), next) +
      S(coords, vec2<i32>(12, 6), next) +
      S(coords, vec2<i32>(12, 7), next) +
      S(coords, vec2<i32>(12, 8), next) +
      S(coords, vec2<i32>(13, -6), next) +
      S(coords, vec2<i32>(13, -5), next) +
      S(coords, vec2<i32>(13, -4), next) +
      S(coords, vec2<i32>(13, -3), next) +
      S(coords, vec2<i32>(13, -2), next) +
      S(coords, vec2<i32>(13, -1), next) +
      S(coords, vec2<i32>(13, 0), next) +
      S(coords, vec2<i32>(13, 1), next) +
      S(coords, vec2<i32>(13, 2), next) +
      S(coords, vec2<i32>(13, 3), next) +
      S(coords, vec2<i32>(13, 4), next) +
      S(coords, vec2<i32>(13, 5), next) +
      S(coords, vec2<i32>(13, 6), next) +
      S(coords, vec2<i32>(14, -3), next) +
      S(coords, vec2<i32>(14, -2), next) +
      S(coords, vec2<i32>(14, -1), next) +
      S(coords, vec2<i32>(14, 0), next) +
      S(coords, vec2<i32>(14, 1), next) +
      S(coords, vec2<i32>(14, 2), next) +
      S(coords, vec2<i32>(14, 3), next);

    //Consolidate the neighbourhood checks

    var sum_0 = s0 + s1 + s2 + s3;
    var sum_1 = s4;
    var sum_2 = s5 + s6;
    var sum_3 = s7 + s8 + s9 + s10 + s11 + s12;

    var count = sum_0 + sum_1 + sum_2 + sum_3;

    //Apply conditional transition functions
    var s = state;

    if(sum_0 >= 0 && sum_0 <= 17) 		{ s = state - 1.0; }
    if(sum_0 >= 40 && sum_0 <= 42) 		{ s = f32(next); }

    if(sum_1 >= 10 && sum_1 <= 13) 		{ s = f32(next); }	

    if(sum_2 >= 9 && sum_2 <= 21) 		{ s = state - 1.0; }	

    if(sum_3 >= 78 && sum_3 <= 89) 		{ s = state - 1.0; }
    if(sum_3 >= 108) 					{ s = state - 1.0; }

    s = max(0.0, s);

    state = s;

    // Cursor populate
    if (params.mouse > 0.0 && distance(vec2<f32>(coords), vec2<f32>(params.mousex, params.mousey)) < params.seedRadius) {
        state = Random(vec2<f32>(coords)).x * params.nstates;
    }

    cells.data[cellIdx] = state;
    textureStore(outputTex, coords, renderColor(state, params.nstates));
}
