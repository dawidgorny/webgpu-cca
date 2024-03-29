import{t as N,E as V}from"./vendor.0f84d0df.js";const q=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&t(a)}).observe(document,{childList:!0,subtree:!0});function o(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerpolicy&&(s.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?s.credentials="include":e.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(e){if(e.ep)return;e.ep=!0;const s=o(e);fetch(e.href,s)}};q();function k(i,n){return Math.ceil(i/n)*n}function v(i,n,o){let t={size:n.byteLength,usage:o,mappedAtCreation:!0},e=i.createBuffer(t);return(n instanceof Uint16Array?new Uint16Array(e.getMappedRange()):n instanceof Uint8Array?new Uint8Array(e.getMappedRange()):new Float32Array(e.getMappedRange())).set(n),e.unmap(),e}function Y(i,n){return Array.from({length:n-i},(o,t)=>t+i)}var X=`struct SimParams {
    seedRadius : f32,
    nstates : f32,
    rez : f32,
    rowPitch : f32,
    mousex : f32,
    mousey : f32,
    mouse : f32
};

struct Cells {
    data : array<f32>
};

@binding(0) @group(0) var<uniform> params : SimParams;
@binding(1) @group(0) var<storage, read> currentCells : Cells;
@binding(2) @group(0) var<storage, read_write> cells : Cells;
@binding(3) @group(0) var outputTex : texture_storage_2d<rgba8unorm, write>;

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

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
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
`;const W=`
struct VSOut {
    @builtin(position) Position: vec4<f32>,
    @location(0) texCoord: vec2<f32>
};

@vertex
fn main(@location(0) inPos: vec3<f32>,
        @location(1) inColor: vec3<f32>, 
        @location(2) inUV: vec2<f32>) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = vec4<f32>(inPos, 1.0);
    vsOut.texCoord = inUV;
    return vsOut;
}`,H=`
@group(0) @binding(0) var mainSampler: sampler;
@group(0) @binding(1) var mainTexture: texture_2d<f32>;

@fragment
fn main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
    // return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    return textureSample(mainTexture, mainSampler, texCoord);
}`,j=new Float32Array([1,-1,0,-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,-1,0]),K=new Float32Array([1,1,0,1,0,0,0,0,1,0,1,1]),J=new Float32Array([1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0,0]),Q=new Uint16Array([0,1,2,3,4,5]);let U=0,m=performance.now(),E=performance.now(),h=0;class Z{constructor(n){this.paramsNeedUpdate=!1,this.isPaused=!1,this.seedRadius=5,this.nstates=10,this.rez=100,this.mousex=0,this.mousey=0,this.mouse=0,this.resolution=100,this.render=()=>{let o=performance.now();if(h=(h+(o-m))/2,o-E>1e3&&(E=o,h=o-m,this.fpsDom.innerText=(1e3/h).toFixed(2)+" fps (avg)"),m=o,this.colorTexture=this.context.getCurrentTexture(),this.colorTextureView=this.colorTexture.createView(),this.encodeCommands(),this.paramsNeedUpdate){this.paramsNeedUpdate=!1,this.simParamData[0]=this.seedRadius,this.simParamData[1]=this.nstates,this.simParamData[2]=this.rez,this.simParamData[3]=this.rowPitch,this.simParamData[4]=this.mousex,this.simParamData[5]=this.mousey,this.simParamData[6]=this.mouse;let t=this.device.createBuffer({size:this.simParamData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});new Float32Array(t.getMappedRange()).set(this.simParamData),t.unmap();let e=this.device.createCommandEncoder();e.copyBufferToBuffer(t,0,this.simParamBuffer,0,this.simParamData.byteLength),this.queue.submit([e.finish()])}++U,requestAnimationFrame(this.render)},this.canvas=n,this.fpsDom=document.getElementById("fps"),this.resolution=this.rez=Math.round(Math.max(this.canvas.width,this.canvas.height)),this.canvas.addEventListener("mousemove",o=>{let t=this.canvas.getBoundingClientRect();this.mousex=(o.clientX-t.left)/t.width*this.rez,this.mousey=(o.clientY-t.top)/t.height*this.rez,this.mouse&&(this.paramsNeedUpdate=!0)}),this.canvas.addEventListener("mousedown",o=>{this.mouse=1,this.paramsNeedUpdate=!0}),document.body.addEventListener("mouseup",o=>{this.mouse=0,this.paramsNeedUpdate=!0})}async start(){await this.initializeAPI()&&(this.resizeBackings(),await this.initializeResources(),this.render())}async initializeAPI(){try{const n=navigator.gpu;if(!n)return!1;this.adapter=await n.requestAdapter(),this.device=await this.adapter.requestDevice(),this.queue=this.device.queue}catch(n){return console.error(n),!1}return!0}async initializeResources(){this.positionBuffer=v(this.device,j,GPUBufferUsage.VERTEX),this.uvsBuffer=v(this.device,K,GPUBufferUsage.VERTEX),this.colorBuffer=v(this.device,J,GPUBufferUsage.VERTEX),this.indexBuffer=v(this.device,Q,GPUBufferUsage.INDEX);const n={code:W};this.vertModule=this.device.createShaderModule(n);const o={code:H};this.fragModule=this.device.createShaderModule(o);const t={shaderLocation:0,offset:0,format:"float32x3"},e={shaderLocation:1,offset:0,format:"float32x3"},s={shaderLocation:2,offset:0,format:"float32x2"},a={attributes:[t],arrayStride:4*3,stepMode:"vertex"},A={attributes:[s],arrayStride:4*2,stepMode:"vertex"},G={attributes:[e],arrayStride:4*3,stepMode:"vertex"},R={depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus-stencil8"},z=this.device.createSampler({magFilter:"linear",minFilter:"linear"}),P=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}}]}),D={bindGroupLayouts:[P]},_=this.device.createPipelineLayout(D),M={module:this.vertModule,entryPoint:"main",buffers:[a,G,A]},O={format:this.presentationFormat,writeMask:GPUColorWrite.ALL},I={module:this.fragModule,entryPoint:"main",targets:[O]},L={layout:_,vertex:M,fragment:I,primitive:{frontFace:"cw",cullMode:"none",topology:"triangle-list"},depthStencil:R};this.pipeline=this.device.createRenderPipeline(L);const y=4,f=this.rowPitch=k(this.rez*y,256),S=new Float32Array(f*this.rez);for(let c=0;c<f*this.rez;c+=1)S[c]=0;for(let c=0;c<this.rez;c++)for(let d=0;d<this.rez;d++){const u=c*f+d*y;S[u+0]=.1,S[u+1]=.1,S[u+2]=.1,S[u+3]=1}this.textureDataBuffer=v(this.device,S,GPUBufferUsage.COPY_SRC|GPUBufferUsage.STORAGE),this.outTexture=this.device.createTexture({size:{width:this.rez,height:this.rez},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING});{const c=this.device.createCommandEncoder();c.copyBufferToTexture({buffer:this.textureDataBuffer,bytesPerRow:this.rowPitch*Float32Array.BYTES_PER_ELEMENT,rowsPerImage:this.rez},{texture:this.outTexture},{width:this.rez,height:this.rez,depthOrArrayLayers:1}),this.queue.submit([c.finish()])}this.uniformBindGroup=this.device.createBindGroup({layout:P,entries:[{binding:0,resource:z},{binding:1,resource:this.outTexture.createView()}]}),this.simParamData=new Float32Array([this.seedRadius,this.nstates,this.rez,this.rowPitch,this.mousex,this.mousey,this.mouse]),this.simParamBuffer=this.device.createBuffer({size:this.simParamData.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0}),new Float32Array(this.simParamBuffer.getMappedRange()).set(this.simParamData),this.simParamBuffer.unmap();const w=new Float32Array(this.rez*this.rez),B=new Float32Array(this.rez*this.rez);for(let c=0;c<this.rez*this.rez;c++){const d=0;w[c]=d,B[c]=d}this.cellBufferA=v(this.device,w,GPUBufferUsage.STORAGE),this.cellBufferB=v(this.device,B,GPUBufferUsage.STORAGE);try{const c={code:X};this.compModule=this.device.createShaderModule(c)}catch(c){console.error(c)}const b=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,storageTexture:{format:"rgba8unorm",access:"write-only"}}]}),F=this.device.createPipelineLayout({bindGroupLayouts:[b]});this.computePipeline=this.device.createComputePipeline({layout:F,compute:{module:this.compModule,entryPoint:"main"}}),this.mainBindGroup=Y(0,2).map((c,d)=>this.device.createBindGroup({layout:b,entries:[{binding:0,resource:{buffer:this.simParamBuffer}},{binding:1,resource:{buffer:d%2?this.cellBufferA:this.cellBufferB}},{binding:2,resource:{buffer:d%2?this.cellBufferB:this.cellBufferA}},{binding:3,resource:this.outTexture.createView()}]}))}resizeBackings(){if(!this.context){this.context=this.canvas.getContext("webgpu"),this.presentationFormat=navigator.gpu.getPreferredCanvasFormat();const o={device:this.device,format:this.presentationFormat,alphaMode:"opaque",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC};this.context.configure(o)}const n={size:[this.canvas.width,this.canvas.height,1],dimension:"2d",format:"depth24plus-stencil8",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC};this.depthTexture=this.device.createTexture(n),this.depthTextureView=this.depthTexture.createView()}encodeCommands(){let n={view:this.colorTextureView,clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"};const o={view:this.depthTextureView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store",stencilLoadOp:"load",stencilStoreOp:"store"},t={colorAttachments:[n],depthStencilAttachment:o},e=this.device.createCommandEncoder();if(!this.isPaused){const s=e.beginComputePass();s.setPipeline(this.computePipeline),s.setBindGroup(0,this.mainBindGroup[U%2]),s.dispatchWorkgroups(this.rez/64,this.rez),s.end()}this.passEncoder=e.beginRenderPass(t),this.passEncoder.setPipeline(this.pipeline),this.passEncoder.setBindGroup(0,this.uniformBindGroup),this.passEncoder.setViewport(0,0,this.canvas.width,this.canvas.height,0,1),this.passEncoder.setScissorRect(0,0,this.canvas.width,this.canvas.height),this.passEncoder.setVertexBuffer(0,this.positionBuffer),this.passEncoder.setVertexBuffer(1,this.colorBuffer),this.passEncoder.setVertexBuffer(2,this.uvsBuffer),this.passEncoder.setIndexBuffer(this.indexBuffer,"uint16"),this.passEncoder.drawIndexed(6,1),this.passEncoder.end(),this.queue.submit([e.finish()])}}let l=parseInt(window.location.hash.substr(1));l=l>9?l:512;const x=document.getElementById("gfx");x.width=x.height=l;const r=new Z(x);r.start();const p=new N.exports.Pane;p.registerPlugin(V);const T=p.addFolder({title:"Resolution"});T.addInput(r,"resolution",{min:10,max:2048,step:1});T.addButton({title:"Apply (reload)"}).on("click",i=>{window.location.hash="#"+r.resolution,window.location.reload()});const g=p.addFolder({title:"Simulation"});g.addInput(r,"nstates",{min:0,max:50,step:1}).on("change",()=>{r.paramsNeedUpdate=!0});g.addInput(r,"seedRadius",{min:1,max:20,step:.1}).on("change",()=>{r.paramsNeedUpdate=!0});const $=g.addButton({title:"Pause"}).on("click",i=>{r.isPaused=!r.isPaused,$.title=r.isPaused?"Play":"Pause"});function C(){document.documentElement.clientWidth>document.documentElement.clientHeight?(x.style.width="auto",x.style.height="90%"):(x.style.width="90%",x.style.height="auto")}window.addEventListener("resize",C);C();
