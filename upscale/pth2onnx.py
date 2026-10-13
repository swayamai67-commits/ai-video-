"""Convert Real-ESRGAN SRVGGNetCompact .pth weights to ONNX without PyTorch.

A torch .pth is a zip holding a pickle whose tensors point at raw storages;
we unpickle with stub classes and rebuild the arrays with numpy.
"""
import io, pickle, sys, zipfile
import numpy as np
import onnx
from onnx import helper, TensorProto, numpy_helper

DT = {"FloatStorage": np.float32, "HalfStorage": np.float16}

def load_pth(path):
    zf = zipfile.ZipFile(path)
    root = zf.namelist()[0].split("/")[0]

    class Storage:
        def __init__(self, name): self.name = name

    def rebuild(storage, offset, size, stride, *a):
        dtype, key = storage
        raw = np.frombuffer(zf.read(f"{root}/data/{key}"), dtype=dtype)
        n = int(np.prod(size)) if size else 1
        arr = raw[offset:offset + max(n, 1)] if not stride else np.lib.stride_tricks.as_strided(
            raw[offset:], shape=size, strides=[s * raw.itemsize for s in stride])
        return np.array(arr, dtype=np.float32).reshape(size)

    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if name == "_rebuild_tensor_v2": return rebuild
            if name.endswith("Storage"): return DT.get(name, np.float32)
            if name == "OrderedDict":
                import collections; return collections.OrderedDict
            return super().find_class(mod, name)
        def persistent_load(self, pid):
            _, dtype, key, _loc, _n = pid
            return (dtype, key)

    obj = U(io.BytesIO(zf.read(f"{root}/data.pkl"))).load()
    return obj.get("params", obj.get("params_ema", obj))

def build(sd, scale=4, out_path="model.onnx"):
    convs = sorted({int(k.split(".")[1]) for k in sd if k.endswith("weight") and sd[k].ndim == 4})
    prelus = sorted({int(k.split(".")[1]) for k in sd if k.endswith("weight") and sd[k].ndim == 1})
    nodes, inits = [], []
    x = "input"
    for idx in sorted(set(convs) | set(prelus)):
        w = sd[f"body.{idx}.weight"]
        if w.ndim == 4:
            inits += [numpy_helper.from_array(w, f"w{idx}"), numpy_helper.from_array(sd[f"body.{idx}.bias"], f"b{idx}")]
            nodes.append(helper.make_node("Conv", [x, f"w{idx}", f"b{idx}"], [f"c{idx}"], pads=[1, 1, 1, 1], kernel_shape=[3, 3]))
            x = f"c{idx}"
        else:
            inits.append(numpy_helper.from_array(w.reshape(-1, 1, 1), f"a{idx}"))
            nodes.append(helper.make_node("PRelu", [x, f"a{idx}"], [f"p{idx}"]))
            x = f"p{idx}"
    nodes.append(helper.make_node("DepthToSpace", [x], ["ps"], blocksize=scale, mode="CRD"))
    inits.append(numpy_helper.from_array(np.array([1, 1, scale, scale], np.float32), "sc"))
    nodes.append(helper.make_node("Resize", ["input", "", "sc"], ["up"], mode="nearest"))
    nodes.append(helper.make_node("Add", ["ps", "up"], ["output"]))
    g = helper.make_graph(nodes, "srvgg",
        [helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, 3, "h", "w"])],
        [helper.make_tensor_value_info("output", TensorProto.FLOAT, [1, 3, "H", "W"])], inits)
    m = helper.make_model(g, opset_imports=[helper.make_opsetid("", 17)])
    m.ir_version = 9
    onnx.checker.check_model(m)
    onnx.save(m, out_path)

if __name__ == "__main__":
    sd = load_pth(sys.argv[1])
    if len(sys.argv) > 3:  # optional denoise blend with the wdn variant: dni = a*x + (1-a)*wdn
        a = float(sys.argv[3]); sd2 = load_pth(sys.argv[4])
        sd = {k: a * sd[k] + (1 - a) * sd2[k] for k in sd}
    build(sd, out_path=sys.argv[2])
    print("ok", sys.argv[2], len(sd), "tensors")
