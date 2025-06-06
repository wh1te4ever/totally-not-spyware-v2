//
// Utility functions.
//
// Copyright (c) 2016 Samuel Groß
//

// Return the hexadecimal representation of the given byte.
function hex(b) {
    return ('0' + b.toString(16)).substr(-2);
}

// Return the hexadecimal representation of the given byte array.
function hexlify(bytes) {
    var res = [];
    for (var i = 0; i < bytes.length; i++)
        res.push(hex(bytes[i]));

    return res.join('');
}

// Return the binary data represented by the given hexdecimal string.
function unhexlify(hexstr) {
    if (hexstr.length % 2 == 1)
        throw new TypeError("Invalid hex string");

    var bytes = new Uint8Array(hexstr.length / 2);
    for (var i = 0; i < hexstr.length; i += 2)
        bytes[i/2] = parseInt(hexstr.substr(i, 2), 16);

    return bytes;
}

function hexdump(data) {
    if (typeof data.BYTES_PER_ELEMENT !== 'undefined')
        data = Array.from(data);

    var lines = [];
    for (var i = 0; i < data.length; i += 16) {
        var chunk = data.slice(i, i+16);
        var parts = chunk.map(hex);
        if (parts.length > 8)
            parts.splice(8, 0, ' ');
        lines.push(parts.join(' '));
    }

    return lines.join('\n');
}

// Simplified version of the similarly named python module.
var Struct = (function() {
    // Allocate these once to avoid unecessary heap allocations during pack/unpack operations.
    var buffer      = new ArrayBuffer(8);
    var byteView    = new Uint8Array(buffer);
    var uint32View  = new Uint32Array(buffer);
    var float64View = new Float64Array(buffer);

    return {
        pack: function(type, value) {
            var view = type;        // See below
            view[0] = value;
            return new Uint8Array(buffer, 0, type.BYTES_PER_ELEMENT);
        },

        unpack: function(type, bytes) {
            if (bytes.length !== type.BYTES_PER_ELEMENT)
                throw Error("Invalid bytearray");

            var view = type;        // See below
            byteView.set(bytes);
            return view[0];
        },

        // Available types.
        int8:    byteView,
        int32:   uint32View,
        float64: float64View
    };
})();

function str2ab(str = '')
{
	return new TextEncoder().encode(str).buffer;
};

function millis(ms)
{
	var t1 = Date.now();
    while(Date.now() - t1 < ms)
    {
    	//Simply wait
    }
}

// JOP utilities
var zero8 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0])

function b2u32(b) {
    return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
}

function off2addr(segs, off)
{
    if(!(off instanceof Int64)) off = new Int64(off);
    for(var i = 0; i < segs.length; ++i)
    {
        var start = segs[i].fileoff;
        var end   = Add(start, segs[i].size);
        if
        (
            (start.hi() < off.hi() || (start.hi() == off.hi() && start.lo() <= off.lo())) &&
            (end.hi() > off.hi() || (end.hi() == off.hi() && end.lo() > off.lo()))
        )
        {
            return Add(segs[i].addr, Sub(off, start));
        }
    }
    return new Int64("0x4141414141414141");
}

function fsyms(mem, base, segs, want, syms)
{
    want = Array.from(want); // copy
    if(syms === undefined)
    {
        syms = {};
    }
    var stab = null;
    var ncmds = mem.u32(Add(base, 0x10));
    for(var i = 0, off = 0x20; i < ncmds; ++i)
    {
        var cmd = mem.u32(Add(base, off));
        if(cmd == 0x2) // LC_SYMTAB
        {
            var b = mem.read(Add(base, off + 0x8), 0x10);
            stab =
            {
                symoff:  b2u32(b.slice(0x0, 0x4)),
                nsyms:   b2u32(b.slice(0x4, 0x8)),
                stroff:  b2u32(b.slice(0x8, 0xc)),
                strsize: b2u32(b.slice(0xc, 0x10)),
            };
            break;
        }
        off += mem.u32(Add(base, off + 0x4));
    }
    if(stab == null)
    {
        log("fail: stab");
    }
    var tmp = { base: off2addr(segs, stab.stroff), off: 0 };
    var fn = function(i)
    {
        return mem.read(Add(tmp.base, tmp.off + i), 1)[0];
    };
    for(var i = 0; i < stab.nsyms && want.length > 0; ++i)
    {
        tmp.off = mem.u32(off2addr(segs, stab.symoff + i * 0x10));
        for(var j = 0; j < want.length; ++j)
        {
            var s = want[j];
            if((strcmp(fn, s)))
            {
                syms[s] = mem.readInt64(off2addr(segs, stab.symoff + i * 0x10 + 0x8));
                want.splice(j, 1);
                break;
            }
        }
    }
    return syms;
}

function _u32(i) {
    return b2u32(this.read(i, 4));
}

function _read(i, l)
{
    if (i instanceof Int64) i = i.lo();
    if (l instanceof Int64) l = l.lo();
    if (i + l > this.length)
    {
        log(`fail: OOB read: ${i} -> ${i + l}, size: ${l}`);
    }
    return this.slice(i, i + l);
}
function _readInt64(addr)
{
    return new Int64(this.read(addr, 8));
}
function _writeInt64(i, val)
{
    if (i instanceof Int64) i = i.lo();
    this.set(val.bytes(), i);
}

function strcmp(b, str)
{
    var fn = typeof b == "function" ? b : function(i) { return b[i]; };
    for(var i = 0; i < str.length; ++i)
    {
        if(fn(i) != str.charCodeAt(i))
        {
            return false;
        }
    }
    return fn(str.length) == 0;
}