// gpu.js — WebGPU compute alongside the VM
var gpu = { available:false, adapter:null, device:null, info:{} };

async function initGPU() {
  if (!navigator.gpu) { gpu.info = { error:'WebGPU not available' }; return false; }
  try {
    gpu.adapter = await navigator.gpu.requestAdapter({ powerPreference:'high-performance' });
    if (!gpu.adapter) { gpu.info = { error:'no adapter' }; return false; }
    var ai = await gpu.adapter.requestAdapterInfo();
    gpu.device = await gpu.adapter.requestDevice();
    gpu.available = true;
    gpu.info = {
      vendor: ai.vendor, arch: ai.architecture,
      device: ai.device, desc: ai.description,
      maxBuf: gpu.device.limits.maxBufferSize,
      maxTex: gpu.device.limits.maxTextureDimension2D,
      maxWG: gpu.device.limits.maxComputeWorkgroupSizeX,
    };
    return true;
  } catch(e) { gpu.info = { error:e.message }; return false; }
}

async function gpuCompute(data, shader) {
  if (!gpu.device) return null;
  var input = new Float32Array(data);
  var gpuBuf = gpu.device.createBuffer({ size:input.byteLength, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC, mappedAtCreation:true });
  new Float32Array(gpuBuf.getMappedRange()).set(input);
  gpuBuf.unmap();

  var outBuf = gpu.device.createBuffer({ size:input.byteLength, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC });
  var readBuf = gpu.device.createBuffer({ size:input.byteLength, usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ });

  var mod = gpu.device.createShaderModule({ code:shader });
  var pipeline = gpu.device.createComputePipeline({ layout:'auto', compute:{ module:mod, entryPoint:'main' } });
  var bindGroup = gpu.device.createBindGroup({ layout:pipeline.getBindGroupLayout(0),
    entries:[{ binding:0, resource:{ buffer:gpuBuf }}, { binding:1, resource:{ buffer:outBuf }}] });

  var enc = gpu.device.createCommandEncoder();
  var pass = enc.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(Math.ceil(input.length / 64));
  pass.end();
  enc.copyBufferToBuffer(outBuf, 0, readBuf, 0, input.byteLength);
  gpu.device.queue.submit([enc.finish()]);

  await readBuf.mapAsync(GPUMapMode.READ);
  var result = new Float32Array(readBuf.getMappedRange().slice(0));
  readBuf.unmap();
  return result;
}

var BENCH_SHADER = `
@group(0) @binding(0) var<storage,read> input: array<f32>;
@group(0) @binding(1) var<storage,read_write> output: array<f32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= arrayLength(&input)) { return; }
  var v = input[i];
  for (var j = 0u; j < 1000u; j++) { v = v * 1.00001 + 0.00001; }
  output[i] = v;
}`;

async function gpuBench(size) {
  var data = [];
  for (var i = 0; i < size; i++) data.push(Math.random());
  var t0 = performance.now();
  var result = await gpuCompute(data, BENCH_SHADER);
  var ms = performance.now() - t0;
  return { size:size, ms:Math.round(ms), ops: Math.round(size * 1000 / ms), sample:result ? result[0] : null };
}
