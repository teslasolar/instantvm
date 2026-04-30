// gpu.js — WebGPU init + generic compute dispatch
var GPU = { ok:false, adapter:null, device:null, info:{} };

async function initGPU() {
  if (!navigator.gpu) { GPU.info = { error:'not available' }; return false; }
  try {
    GPU.adapter = await navigator.gpu.requestAdapter({ powerPreference:'high-performance' });
    if (!GPU.adapter) { GPU.info = { error:'no adapter' }; return false; }
    var ai = GPU.adapter.info || {};
    GPU.device = await GPU.adapter.requestDevice();
    GPU.ok = true;
    GPU.info = { vendor:ai.vendor||'', desc:ai.description||'', arch:ai.architecture||'' };
    return true;
  } catch(e) { GPU.info = { error:e.message }; return false; }
}

async function gpuBench(size) {
  if (!GPU.device) return null;
  var data = new Float32Array(size);
  for (var i=0;i<size;i++) data[i] = Math.random();
  var inBuf = GPU.device.createBuffer({ size:data.byteLength, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC, mappedAtCreation:true });
  new Float32Array(inBuf.getMappedRange()).set(data); inBuf.unmap();
  var outBuf = GPU.device.createBuffer({ size:data.byteLength, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC });
  var readBuf = GPU.device.createBuffer({ size:data.byteLength, usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ });
  var shader = GPU.device.createShaderModule({ code:'@group(0)@binding(0) var<storage,read> i:array<f32>;@group(0)@binding(1) var<storage,read_write> o:array<f32>;@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3u){let x=id.x;if(x>=arrayLength(&i)){return;}var v=i[x];for(var j=0u;j<1000u;j++){v=v*1.00001+0.00001;}o[x]=v;}' });
  var pipe = GPU.device.createComputePipeline({ layout:'auto', compute:{module:shader,entryPoint:'main'} });
  var bg = GPU.device.createBindGroup({ layout:pipe.getBindGroupLayout(0), entries:[{binding:0,resource:{buffer:inBuf}},{binding:1,resource:{buffer:outBuf}}] });
  var enc = GPU.device.createCommandEncoder();
  var pass = enc.beginComputePass(); pass.setPipeline(pipe); pass.setBindGroup(0,bg); pass.dispatchWorkgroups(Math.ceil(size/64)); pass.end();
  enc.copyBufferToBuffer(outBuf,0,readBuf,0,data.byteLength);
  var t0 = performance.now();
  GPU.device.queue.submit([enc.finish()]);
  await readBuf.mapAsync(GPUMapMode.READ);
  var ms = performance.now()-t0;
  readBuf.unmap();
  return { size:size, ms:Math.round(ms), ops:Math.round(size*1000/ms) };
}
